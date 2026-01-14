import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { getDb } from "./db";
import { 
  companies, shareClasses, shareholders, holdings, certificates,
  transactions, dtcRequests, corporateActions, dividends, proxyEvents,
  proxyProposals, proxyVotes, equityPlans, equityGrants, vestingEvents,
  taxForms, complianceAlerts, notifications, integrations
} from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { generateCertificateHTML, generate1099DivHTML, generateShareholderStatementHTML, getCertificateData, get1099DivData, getShareholderStatementData } from "./pdfGenerator";

// Admin procedure middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin' && ctx.user.role !== 'issuer') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============================================
  // COMPANY MANAGEMENT
  // ============================================
  company: router({
    list: protectedProcedure.query(async () => {
      return db.getCompanies();
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getCompanyById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        ticker: z.string().optional(),
        cik: z.string().optional(),
        incorporationState: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const result = await database.insert(companies).values({
          name: input.name,
          ticker: input.ticker ?? null,
          cik: input.cik ?? null,
          incorporationState: input.incorporationState ?? null,
        });
        return { id: result[0].insertId };
      }),
  }),

  // ============================================
  // CAP TABLE & SHARE CLASSES
  // ============================================
  capTable: router({
    summary: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getCapTableSummary(input.companyId);
      }),
    
    shareClasses: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getShareClassesByCompany(input.companyId);
      }),
    
    createShareClass: adminProcedure
      .input(z.object({
        companyId: z.number(),
        name: z.string(),
        symbol: z.string().optional(),
        authorizedShares: z.number(),
        parValue: z.string().optional(),
        votingRights: z.boolean().default(true),
        isPreferred: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const result = await database.insert(shareClasses).values({
          companyId: input.companyId,
          name: input.name,
          symbol: input.symbol ?? null,
          authorizedShares: input.authorizedShares,
          parValue: input.parValue ?? "0.0001",
          votingRights: input.votingRights,
          isPreferred: input.isPreferred,
          issuedShares: 0,
          outstandingShares: 0,
          treasuryShares: 0,
        });
        return { id: result[0].insertId };
      }),
  }),

  // ============================================
  // SHAREHOLDER MANAGEMENT
  // ============================================
  shareholder: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getShareholdersByCompany(input.companyId);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getShareholderById(input.id);
      }),
    
    count: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getShareholderCount(input.companyId);
      }),
    
    create: adminProcedure
      .input(z.object({
        companyId: z.number(),
        name: z.string(),
        type: z.enum(['individual', 'joint', 'trust', 'corporation', 'partnership', 'ira', 'custodian']).default('individual'),
        email: z.string().email().optional(),
        taxId: z.string().optional(),
        address1: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().default('USA'),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const accountNumber = `SH-${nanoid(10).toUpperCase()}`;
        const result = await database.insert(shareholders).values({
          companyId: input.companyId,
          name: input.name,
          accountNumber,
          type: input.type,
          email: input.email ?? null,
          taxId: input.taxId ?? null,
          address1: input.address1 ?? null,
          city: input.city ?? null,
          state: input.state ?? null,
          postalCode: input.postalCode ?? null,
          country: input.country,
        });
        return { id: result[0].insertId, accountNumber };
      }),
    
    holdings: protectedProcedure
      .input(z.object({ shareholderId: z.number() }))
      .query(async ({ input }) => {
        return db.getHoldingsByShareholder(input.shareholderId);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        type: z.enum(['individual', 'joint', 'trust', 'corporation', 'partnership', 'ira', 'custodian']).optional(),
        email: z.string().email().nullable().optional(),
        phone: z.string().nullable().optional(),
        taxId: z.string().nullable().optional(),
        address1: z.string().nullable().optional(),
        address2: z.string().nullable().optional(),
        city: z.string().nullable().optional(),
        state: z.string().nullable().optional(),
        postalCode: z.string().nullable().optional(),
        country: z.string().optional(),
        status: z.enum(['active', 'inactive', 'suspended', 'deceased', 'escheated']).optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const { id, ...updateData } = input;
        const filteredData = Object.fromEntries(
          Object.entries(updateData).filter(([_, v]) => v !== undefined)
        );
        
        if (Object.keys(filteredData).length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'No fields to update' });
        }
        
        await database.update(shareholders).set(filteredData).where(eq(shareholders.id, id));
        return { success: true };
      }),
  }),

  // ============================================
  // TRANSACTIONS
  // ============================================
  transaction: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number(), limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return db.getTransactionsByCompany(input.companyId, input.limit);
      }),
    
    pending: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getPendingTransactions(input.companyId);
      }),
    
    stats: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getTransactionStats(input.companyId);
      }),
    
    create: adminProcedure
      .input(z.object({
        companyId: z.number(),
        type: z.enum(['issuance', 'transfer', 'cancellation', 'split', 'reverse_split', 'dividend', 'conversion', 'redemption', 'repurchase', 'gift', 'inheritance', 'dtc_deposit', 'dtc_withdrawal', 'drs_transfer']),
        fromShareholderId: z.number().optional(),
        toShareholderId: z.number().optional(),
        shareClassId: z.number(),
        shares: z.number(),
        pricePerShare: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const transactionNumber = `TX-${nanoid(12).toUpperCase()}`;
        const result = await database.insert(transactions).values({
          companyId: input.companyId,
          transactionNumber,
          type: input.type,
          fromShareholderId: input.fromShareholderId ?? null,
          toShareholderId: input.toShareholderId ?? null,
          shareClassId: input.shareClassId,
          shares: input.shares,
          pricePerShare: input.pricePerShare ?? null,
          notes: input.notes ?? null,
          transactionDate: new Date(),
          createdBy: ctx.user.id,
        });
        
        await db.createAuditEntry({
          userId: ctx.user.id,
          companyId: input.companyId,
          action: 'CREATE',
          entityType: 'transaction',
          entityId: result[0].insertId,
          newValues: input,
        });
        
        return { id: result[0].insertId, transactionNumber };
      }),
    
    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        await database.update(transactions)
          .set({ 
            status: 'approved', 
            approvedBy: ctx.user.id, 
            approvedAt: new Date() 
          })
          .where(eq(transactions.id, input.id));
        
        return { success: true };
      }),
  }),

  // ============================================
  // CERTIFICATES
  // ============================================
  certificate: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getCertificatesByCompany(input.companyId);
      }),
    
    activeCount: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getActiveCertificateCount(input.companyId);
      }),
    
    issue: adminProcedure
      .input(z.object({
        shareholderId: z.number(),
        shareClassId: z.number(),
        shares: z.number(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const certificateNumber = `CERT-${nanoid(10).toUpperCase()}`;
        const today = new Date().toISOString().split('T')[0] as string;
        const result = await database.insert(certificates).values({
          shareholderId: input.shareholderId,
          shareClassId: input.shareClassId,
          shares: input.shares,
          certificateNumber,
          issueDate: today,
        });
        
        return { id: result[0].insertId, certificateNumber };
      }),
    
    reportLost: adminProcedure
      .input(z.object({
        id: z.number(),
        indemnityBondNumber: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        await database.update(certificates)
          .set({ 
            status: 'lost',
            indemnityBondNumber: input.indemnityBondNumber ?? null,
          })
          .where(eq(certificates.id, input.id));
        
        return { success: true };
      }),
  }),

  // ============================================
  // DTC/DWAC PROCESSING
  // ============================================
  dtc: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getDtcRequestsByCompany(input.companyId);
      }),
    
    pending: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getPendingDtcRequests(input.companyId);
      }),
    
    create: adminProcedure
      .input(z.object({
        companyId: z.number(),
        type: z.enum(['deposit', 'withdrawal', 'fast_transfer']),
        dtcParticipantNumber: z.string(),
        brokerName: z.string().optional(),
        shareholderId: z.number(),
        shareClassId: z.number(),
        shares: z.number(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const requestNumber = `DTC-${nanoid(10).toUpperCase()}`;
        const result = await database.insert(dtcRequests).values({
          companyId: input.companyId,
          requestNumber,
          type: input.type,
          dtcParticipantNumber: input.dtcParticipantNumber,
          brokerName: input.brokerName ?? null,
          shareholderId: input.shareholderId,
          shareClassId: input.shareClassId,
          shares: input.shares,
        });
        
        return { id: result[0].insertId, requestNumber };
      }),
  }),

  // ============================================
  // CORPORATE ACTIONS
  // ============================================
  corporateAction: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getCorporateActionsByCompany(input.companyId);
      }),
    
    upcoming: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getUpcomingCorporateActions(input.companyId);
      }),
    
    create: adminProcedure
      .input(z.object({
        companyId: z.number(),
        type: z.enum(['dividend_cash', 'dividend_stock', 'split', 'reverse_split', 'merger', 'acquisition', 'spin_off', 'rights_offering', 'tender_offer', 'consolidation', 'name_change', 'symbol_change']),
        title: z.string(),
        description: z.string().optional(),
        recordDate: z.string().optional(),
        exDate: z.string().optional(),
        paymentDate: z.string().optional(),
        effectiveDate: z.string().optional(),
        ratio: z.string().optional(),
        cashAmount: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const actionNumber = `CA-${nanoid(10).toUpperCase()}`;
        const result = await database.insert(corporateActions).values({
          companyId: input.companyId,
          actionNumber,
          type: input.type,
          title: input.title,
          description: input.description ?? null,
          recordDate: input.recordDate ?? null,
          exDate: input.exDate ?? null,
          paymentDate: input.paymentDate ?? null,
          effectiveDate: input.effectiveDate ?? null,
          ratio: input.ratio ?? null,
          cashAmount: input.cashAmount ?? null,
        });
        
        return { id: result[0].insertId, actionNumber };
      }),
  }),

  // ============================================
  // DIVIDENDS
  // ============================================
  dividend: router({
    byShareholder: protectedProcedure
      .input(z.object({ shareholderId: z.number() }))
      .query(async ({ input }) => {
        return db.getDividendsByShareholder(input.shareholderId);
      }),
  }),

  // ============================================
  // PROXY & VOTING
  // ============================================
  proxy: router({
    events: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getProxyEventsByCompany(input.companyId);
      }),
    
    activeEvent: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getActiveProxyEvent(input.companyId);
      }),
    
    proposals: protectedProcedure
      .input(z.object({ eventId: z.number() }))
      .query(async ({ input }) => {
        return db.getProxyProposals(input.eventId);
      }),
    
    voteStats: protectedProcedure
      .input(z.object({ eventId: z.number() }))
      .query(async ({ input }) => {
        return db.getProxyVoteStats(input.eventId);
      }),
    
    createEvent: adminProcedure
      .input(z.object({
        companyId: z.number(),
        title: z.string(),
        type: z.enum(['annual_meeting', 'special_meeting', 'written_consent']).default('annual_meeting'),
        recordDate: z.string(),
        meetingDate: z.string().optional(),
        meetingLocation: z.string().optional(),
        isVirtual: z.boolean().default(false),
        virtualMeetingUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const result = await database.insert(proxyEvents).values({
          companyId: input.companyId,
          title: input.title,
          type: input.type,
          recordDate: input.recordDate,
          meetingLocation: input.meetingLocation ?? null,
          isVirtual: input.isVirtual,
          virtualMeetingUrl: input.virtualMeetingUrl ?? null,
          meetingDate: input.meetingDate ? new Date(input.meetingDate) : null,
        });
        
        return { id: result[0].insertId };
      }),
    
    castVote: protectedProcedure
      .input(z.object({
        proxyEventId: z.number(),
        proposalId: z.number(),
        shareholderId: z.number(),
        shares: z.number(),
        vote: z.enum(['for', 'against', 'abstain', 'withhold']),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        await database.insert(proxyVotes).values({
          proxyEventId: input.proxyEventId,
          proposalId: input.proposalId,
          shareholderId: input.shareholderId,
          shares: input.shares,
          vote: input.vote,
        });
        return { success: true };
      }),
  }),

  // ============================================
  // EQUITY PLANS & GRANTS
  // ============================================
  equity: router({
    plans: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getEquityPlansByCompany(input.companyId);
      }),
    
    grants: protectedProcedure
      .input(z.object({ employeeId: z.number() }))
      .query(async ({ input }) => {
        return db.getEquityGrantsByEmployee(input.employeeId);
      }),
    
    upcomingVesting: protectedProcedure
      .input(z.object({ companyId: z.number(), days: z.number().default(30) }))
      .query(async ({ input }) => {
        return db.getUpcomingVestingEvents(input.companyId, input.days);
      }),
    
    createPlan: adminProcedure
      .input(z.object({
        companyId: z.number(),
        name: z.string(),
        type: z.enum(['stock_option', 'rsu', 'performance', 'sar', 'espp', 'phantom']),
        shareClassId: z.number(),
        authorizedShares: z.number(),
        effectiveDate: z.string(),
        expirationDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const result = await database.insert(equityPlans).values({
          companyId: input.companyId,
          name: input.name,
          type: input.type,
          shareClassId: input.shareClassId,
          authorizedShares: input.authorizedShares,
          availableShares: input.authorizedShares,
          effectiveDate: input.effectiveDate,
          expirationDate: input.expirationDate ?? null,
        });
        
        return { id: result[0].insertId };
      }),
    
    createGrant: adminProcedure
      .input(z.object({
        planId: z.number(),
        employeeId: z.number(),
        grantType: z.enum(['iso', 'nso', 'rsu', 'psu', 'sar', 'restricted_stock']),
        sharesGranted: z.number(),
        exercisePrice: z.string().optional(),
        grantDate: z.string(),
        vestingSchedule: z.enum(['cliff', 'monthly', 'quarterly', 'annual', 'custom']).default('monthly'),
        vestingStartDate: z.string().optional(),
        cliffMonths: z.number().default(12),
        vestingMonths: z.number().default(48),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const grantNumber = `GR-${nanoid(10).toUpperCase()}`;
        const result = await database.insert(equityGrants).values({
          planId: input.planId,
          grantNumber,
          employeeId: input.employeeId,
          grantDate: input.grantDate,
          grantType: input.grantType,
          sharesGranted: input.sharesGranted,
          exercisePrice: input.exercisePrice ?? null,
          vestingSchedule: input.vestingSchedule,
          vestingStartDate: input.vestingStartDate ?? null,
          cliffMonths: input.cliffMonths,
          vestingMonths: input.vestingMonths,
        });
        
        return { id: result[0].insertId, grantNumber };
      }),
  }),

  // ============================================
  // TAX & COMPLIANCE
  // ============================================
  compliance: router({
    alerts: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getComplianceAlerts(input.companyId);
      }),
    
    score: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getComplianceScore(input.companyId);
      }),
    
    taxForms: protectedProcedure
      .input(z.object({ companyId: z.number(), taxYear: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getTaxFormsByCompany(input.companyId, input.taxYear);
      }),
    
    createAlert: adminProcedure
      .input(z.object({
        companyId: z.number(),
        type: z.enum(['filing_deadline', 'escheatment', 'rule_144', 'insider_trading', 'regulatory', 'audit']),
        severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
        title: z.string(),
        description: z.string().optional(),
        dueDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const result = await database.insert(complianceAlerts).values({
          companyId: input.companyId,
          type: input.type,
          severity: input.severity,
          title: input.title,
          description: input.description ?? null,
          dueDate: input.dueDate ?? null,
        });
        return { id: result[0].insertId };
      }),
    
    resolveAlert: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        await database.update(complianceAlerts)
          .set({ 
            status: 'resolved', 
            resolvedBy: ctx.user.id,
          })
          .where(eq(complianceAlerts.id, input.id));
        
        return { success: true };
      }),
  }),

  // ============================================
  // AUDIT LOG
  // ============================================
  audit: router({
    log: adminProcedure
      .input(z.object({ companyId: z.number(), limit: z.number().default(100) }))
      .query(async ({ input }) => {
        return db.getAuditLog(input.companyId, input.limit);
      }),
  }),

  // ============================================
  // NOTIFICATIONS
  // ============================================
  notification: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getNotificationsByUser(ctx.user.id);
    }),
    
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return db.getUnreadNotificationCount(ctx.user.id);
    }),
    
    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        await database.update(notifications)
          .set({ isRead: true })
          .where(eq(notifications.id, input.id));
        
        return { success: true };
      }),
  }),

  // ============================================
  // INTEGRATIONS
  // ============================================
  integration: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getIntegrationsByCompany(input.companyId);
      }),
  }),

  // ============================================
  // DASHBOARD
  // ============================================
  dashboard: router({
    stats: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getDashboardStats(input.companyId);
      }),
  }),

  // ============================================
  // PDF GENERATION
  // ============================================
  pdf: router({
    generateCertificate: protectedProcedure
      .input(z.object({ certificateId: z.number() }))
      .mutation(async ({ input }) => {
        const data = await getCertificateData(input.certificateId);
        if (!data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Certificate not found' });
        }
        const html = generateCertificateHTML(data);
        return { html, certificateNumber: data.certificateNumber };
      }),
    
    generate1099Div: protectedProcedure
      .input(z.object({ shareholderId: z.number(), taxYear: z.number() }))
      .mutation(async ({ input }) => {
        const data = await get1099DivData(input.shareholderId, input.taxYear);
        if (!data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Shareholder not found' });
        }
        const html = generate1099DivHTML(data);
        return { html, recipientName: data.recipientName, taxYear: data.taxYear };
      }),
    
    generateShareholderStatement: protectedProcedure
      .input(z.object({ shareholderId: z.number() }))
      .mutation(async ({ input }) => {
        const data = await getShareholderStatementData(input.shareholderId);
        if (!data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Shareholder not found' });
        }
        const html = generateShareholderStatementHTML(data);
        return { html, shareholderName: data.shareholderName, accountNumber: data.shareholderAccountNumber };
      }),
  }),
});

export type AppRouter = typeof appRouter;
