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
  taxForms, complianceAlerts, notifications, integrations, documents, users, invitations
} from "../drizzle/schema";
import { storagePut } from "./storage";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { generateCertificateHTML, generate1099DivHTML, generateShareholderStatementHTML, getCertificateData, get1099DivData, getShareholderStatementData } from "./pdfGenerator";
import { generateShareholdersCSV, generateTransactionsCSV, generateHoldingsCSV, generateCertificatesCSV, addBOM } from "./exportUtils";

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
        ein: z.string().optional(),
        incorporationState: z.string().optional(),
        incorporationDate: z.string().optional(),
        fiscalYearEnd: z.string().optional(),
        industry: z.string().optional(),
        sector: z.string().optional(),
        address1: z.string().optional(),
        address2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        website: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const result = await database.insert(companies).values({
          name: input.name,
          ticker: input.ticker ?? null,
          cik: input.cik ?? null,
          ein: input.ein ?? null,
          incorporationState: input.incorporationState ?? null,
          incorporationDate: input.incorporationDate ?? null,
          fiscalYearEnd: input.fiscalYearEnd ?? null,
          industry: input.industry ?? null,
          sector: input.sector ?? null,
          address1: input.address1 ?? null,
          address2: input.address2 ?? null,
          city: input.city ?? null,
          state: input.state ?? null,
          postalCode: input.postalCode ?? null,
          country: input.country ?? 'USA',
          phone: input.phone ?? null,
          email: input.email ?? null,
          website: input.website ?? null,
          description: input.description ?? null,
        });
        return { id: result[0].insertId };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        ticker: z.string().optional(),
        cik: z.string().optional(),
        ein: z.string().optional(),
        incorporationState: z.string().optional(),
        incorporationDate: z.string().optional(),
        fiscalYearEnd: z.string().optional(),
        industry: z.string().optional(),
        sector: z.string().optional(),
        address1: z.string().optional(),
        address2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        website: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(['active', 'inactive', 'suspended']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const { id, ...updateData } = input;
        const cleanedData: Record<string, any> = {};
        
        for (const [key, value] of Object.entries(updateData)) {
          if (value !== undefined) {
            cleanedData[key] = value;
          }
        }
        
        if (Object.keys(cleanedData).length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'No fields to update' });
        }
        
        await database.update(companies)
          .set(cleanedData)
          .where(eq(companies.id, id));
        
        await db.createAuditEntry({
          userId: ctx.user.id,
          companyId: id,
          action: 'UPDATE',
          entityType: 'company',
          entityId: id,
          newValues: cleanedData,
        });
        
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        // Check if company has shareholders
        const companyShareholders = await db.getShareholdersByCompany(input.id);
        if (companyShareholders && companyShareholders.length > 0) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'Cannot delete company with existing shareholders. Remove all shareholders first.' 
          });
        }
        
        await database.delete(companies).where(eq(companies.id, input.id));
        
        await db.createAuditEntry({
          userId: ctx.user.id,
          companyId: input.id,
          action: 'DELETE',
          entityType: 'company',
          entityId: input.id,
          oldValues: { id: input.id },
        });
        
        return { success: true };
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
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        // Check if shareholder has any holdings
        const shareholderHoldings = await db.getHoldingsByShareholder(input.id);
        if (shareholderHoldings && shareholderHoldings.length > 0) {
          const totalShares = shareholderHoldings.reduce((sum: number, h: any) => sum + (h.shares || 0), 0);
          if (totalShares > 0) {
            throw new TRPCError({ 
              code: 'BAD_REQUEST', 
              message: 'Cannot delete shareholder with active holdings. Transfer or cancel shares first.' 
            });
          }
        }
        
        await database.delete(shareholders).where(eq(shareholders.id, input.id));
        
        await db.createAuditEntry({
          userId: ctx.user.id,
          companyId: 0,
          action: 'DELETE',
          entityType: 'shareholder',
          entityId: input.id,
          oldValues: { id: input.id },
        });
        
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
    
    bulkApprove: adminProcedure
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        let approved = 0;
        for (const id of input.ids) {
          await database.update(transactions)
            .set({ 
              status: 'approved', 
              approvedBy: ctx.user.id, 
              approvedAt: new Date() 
            })
            .where(eq(transactions.id, id));
          approved++;
        }
        
        return { success: true, count: approved };
      }),
    
    bulkReject: adminProcedure
      .input(z.object({ ids: z.array(z.number()), reason: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        let rejected = 0;
        for (const id of input.ids) {
          await database.update(transactions)
            .set({ 
              status: 'rejected',
              notes: input.reason ?? 'Bulk rejected'
            })
            .where(eq(transactions.id, id));
          rejected++;
        }
        
        return { success: true, count: rejected };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        await database.delete(transactions).where(eq(transactions.id, input.id));
        
        await db.createAuditEntry({
          userId: ctx.user.id,
          companyId: 0,
          action: 'DELETE',
          entityType: 'transaction',
          entityId: input.id,
          oldValues: { id: input.id },
        });
        
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
    
    bulkCancel: adminProcedure
      .input(z.object({ ids: z.array(z.number()), reason: z.string().optional() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const today = new Date().toISOString().split('T')[0] as string;
        let cancelled = 0;
        for (const id of input.ids) {
          await database.update(certificates)
            .set({ 
              status: 'cancelled',
              cancelDate: today,
            })
            .where(eq(certificates.id, id));
          cancelled++;
        }
        
        return { success: true, count: cancelled };
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
    
    bulkUpdateStatus: adminProcedure
      .input(z.object({ 
        ids: z.array(z.number()), 
        status: z.enum(['pending', 'processing', 'completed', 'rejected'])
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        let updated = 0;
        for (const id of input.ids) {
          await database.update(dtcRequests)
            .set({ status: input.status })
            .where(eq(dtcRequests.id, id));
          updated++;
        }
        
        return { success: true, count: updated };
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
            resolvedAt: new Date(),
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
  // DOCUMENTS / ATTACHMENTS
  // ============================================
  document: router({
    list: protectedProcedure
      .input(z.object({ 
        entityType: z.enum(['transaction', 'corporate_action', 'certificate', 'shareholder', 'dividend', 'proxy_event']),
        entityId: z.number()
      }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) return [];
        
        return database.select().from(documents)
          .where(and(
            eq(documents.entityType, input.entityType),
            eq(documents.entityId, input.entityId)
          ))
          .orderBy(desc(documents.createdAt));
      }),
    
    upload: adminProcedure
      .input(z.object({
        companyId: z.number(),
        entityType: z.enum(['transaction', 'corporate_action', 'certificate', 'shareholder', 'dividend', 'proxy_event']),
        entityId: z.number(),
        fileName: z.string(),
        fileData: z.string(), // Base64 encoded
        mimeType: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        // Decode base64 and upload to S3
        const buffer = Buffer.from(input.fileData, 'base64');
        const fileKey = `documents/${input.companyId}/${input.entityType}/${input.entityId}/${nanoid(10)}-${input.fileName}`;
        
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        const result = await database.insert(documents).values({
          companyId: input.companyId,
          entityType: input.entityType,
          entityId: input.entityId,
          fileName: input.fileName,
          fileKey,
          fileUrl: url,
          fileSize: buffer.length,
          mimeType: input.mimeType,
          description: input.description ?? null,
          uploadedBy: ctx.user.id,
        });
        
        return { id: result[0].insertId, url };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        await database.delete(documents).where(eq(documents.id, input.id));
        
        return { success: true };
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

  // ============================================
  // USER MANAGEMENT
  // ============================================
  user: router({
    list: adminProcedure.query(async () => {
      const database = await getDb();
      if (!database) return [];
      return database.select().from(users).orderBy(desc(users.createdAt));
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) return null;
        const result = await database.select().from(users).where(eq(users.id, input.id));
        return result[0] || null;
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().optional(),
        role: z.enum(['user', 'admin', 'issuer', 'shareholder', 'employee']).optional(),
        companyId: z.number().nullable().optional(),
        securityLevel: z.enum(['low', 'medium', 'high']).optional(),
        mfaEnabled: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const { id, ...updateData } = input;
        const cleanedData: Record<string, any> = {};
        
        for (const [key, value] of Object.entries(updateData)) {
          if (value !== undefined) {
            cleanedData[key] = value;
          }
        }
        
        if (Object.keys(cleanedData).length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'No fields to update' });
        }
        
        await database.update(users)
          .set(cleanedData)
          .where(eq(users.id, id));
        
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        // Cannot delete yourself
        if (input.id === ctx.user.id) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot delete your own account' });
        }
        
        await database.delete(users).where(eq(users.id, input.id));
        
        return { success: true };
      }),
  }),

  // ============================================
  // INVITATIONS
  // ============================================
  invitation: router({
    list: adminProcedure.query(async () => {
      const database = await getDb();
      if (!database) return [];
      return database.select().from(invitations).orderBy(desc(invitations.createdAt));
    }),
    
    create: adminProcedure
      .input(z.object({
        email: z.string().email(),
        role: z.enum(['user', 'admin', 'issuer', 'shareholder', 'employee']).default('user'),
        companyId: z.number().nullable().optional(),
        message: z.string().optional(),
        expiresInDays: z.number().min(1).max(30).default(7),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        // Check if email already has a pending invitation
        const existing = await database.select().from(invitations)
          .where(and(
            eq(invitations.email, input.email),
            eq(invitations.status, 'pending')
          ));
        
        if (existing.length > 0) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'An invitation is already pending for this email address' 
          });
        }
        
        // Check if user already exists with this email
        const existingUser = await database.select().from(users)
          .where(eq(users.email, input.email));
        
        if (existingUser.length > 0) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'A user with this email already exists' 
          });
        }
        
        // Generate unique token
        const token = nanoid(32);
        
        // Calculate expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);
        
        const result = await database.insert(invitations).values({
          email: input.email,
          token,
          role: input.role,
          companyId: input.companyId ?? null,
          message: input.message ?? null,
          invitedBy: ctx.user.id,
          expiresAt,
        });
        
        return { 
          id: result[0].insertId, 
          token,
          email: input.email,
          expiresAt: expiresAt.toISOString()
        };
      }),
    
    resend: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        // Get the invitation
        const [invitation] = await database.select().from(invitations)
          .where(eq(invitations.id, input.id));
        
        if (!invitation) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Invitation not found' });
        }
        
        if (invitation.status !== 'pending') {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'Can only resend pending invitations' 
          });
        }
        
        // Generate new token and extend expiry
        const newToken = nanoid(32);
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 7);
        
        await database.update(invitations)
          .set({ 
            token: newToken, 
            expiresAt: newExpiresAt 
          })
          .where(eq(invitations.id, input.id));
        
        return { 
          success: true, 
          token: newToken,
          email: invitation.email,
          expiresAt: newExpiresAt.toISOString()
        };
      }),
    
    revoke: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        // Get the invitation
        const [invitation] = await database.select().from(invitations)
          .where(eq(invitations.id, input.id));
        
        if (!invitation) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Invitation not found' });
        }
        
        if (invitation.status !== 'pending') {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'Can only revoke pending invitations' 
          });
        }
        
        await database.update(invitations)
          .set({ status: 'revoked' })
          .where(eq(invitations.id, input.id));
        
        return { success: true };
      }),
    
    getByToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) return null;
        
        const [invitation] = await database.select().from(invitations)
          .where(eq(invitations.token, input.token));
        
        if (!invitation) return null;
        
        // Check if expired
        if (new Date() > new Date(invitation.expiresAt)) {
          // Mark as expired if still pending
          if (invitation.status === 'pending') {
            await database.update(invitations)
              .set({ status: 'expired' })
              .where(eq(invitations.id, invitation.id));
          }
          return { ...invitation, status: 'expired' as const };
        }
        
        return invitation;
      }),
    
    accept: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        // Get the invitation
        const [invitation] = await database.select().from(invitations)
          .where(eq(invitations.token, input.token));
        
        if (!invitation) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Invitation not found' });
        }
        
        if (invitation.status !== 'pending') {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: `This invitation has been ${invitation.status}` 
          });
        }
        
        // Check if expired
        if (new Date() > new Date(invitation.expiresAt)) {
          await database.update(invitations)
            .set({ status: 'expired' })
            .where(eq(invitations.id, invitation.id));
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'This invitation has expired' 
          });
        }
        
        // If user is logged in, update their role and mark invitation as accepted
        if (ctx.user) {
          await database.update(users)
            .set({ 
              role: invitation.role,
              companyId: invitation.companyId,
            })
            .where(eq(users.id, ctx.user.id));
          
          await database.update(invitations)
            .set({ 
              status: 'accepted',
              acceptedBy: ctx.user.id,
              acceptedAt: new Date(),
            })
            .where(eq(invitations.id, invitation.id));
          
          return { 
            success: true, 
            message: 'Invitation accepted. Your role has been updated.',
            requiresLogin: false
          };
        }
        
        // User not logged in - they need to sign in first
        return { 
          success: true, 
          message: 'Please sign in to accept this invitation.',
          requiresLogin: true,
          email: invitation.email,
          role: invitation.role
        };
      }),
  }),

  // ============================================
  // EXPORT (CSV/Excel)
  // ============================================
  export: router({
    shareholders: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .mutation(async ({ input }) => {
        const data = await db.getShareholdersByCompany(input.companyId);
        const csv = addBOM(generateShareholdersCSV(data as any));
        return { csv, filename: `shareholders_${input.companyId}_${Date.now()}.csv` };
      }),
    
    transactions: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .mutation(async ({ input }) => {
        const data = await db.getTransactionsByCompany(input.companyId);
        const csv = addBOM(generateTransactionsCSV(data as any));
        return { csv, filename: `transactions_${input.companyId}_${Date.now()}.csv` };
      }),
    
    holdings: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .mutation(async ({ input }) => {
        const data = await db.getHoldingsByCompany(input.companyId);
        const csv = addBOM(generateHoldingsCSV(data as any));
        return { csv, filename: `holdings_${input.companyId}_${Date.now()}.csv` };
      }),
    
    certificates: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .mutation(async ({ input }) => {
        const data = await db.getCertificatesByCompany(input.companyId);
        const csv = addBOM(generateCertificatesCSV(data as any));
        return { csv, filename: `certificates_${input.companyId}_${Date.now()}.csv` };
      }),
  }),
});

export type AppRouter = typeof appRouter;
