import { eq, desc, and, sql, gte, lte, count, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, companies, shareClasses, shareholders, holdings,
  certificates, transactions, dtcRequests, corporateActions, dividends,
  proxyEvents, proxyProposals, proxyVotes, equityPlans, equityGrants,
  vestingEvents, taxForms, complianceAlerts, auditLog, notifications, integrations
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================
// USER QUERIES
// ============================================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// COMPANY QUERIES
// ============================================
export async function getCompanies() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companies).orderBy(desc(companies.createdAt));
}

export async function getCompanyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return result[0];
}

// ============================================
// SHARE CLASS QUERIES
// ============================================
export async function getShareClassesByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(shareClasses).where(eq(shareClasses.companyId, companyId));
}

export async function getCapTableSummary(companyId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const classes = await db.select({
    totalIssued: sum(shareClasses.issuedShares),
    totalOutstanding: sum(shareClasses.outstandingShares),
    totalTreasury: sum(shareClasses.treasuryShares),
  }).from(shareClasses).where(eq(shareClasses.companyId, companyId));
  
  return classes[0];
}

// ============================================
// SHAREHOLDER QUERIES
// ============================================
export async function getShareholdersByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(shareholders).where(eq(shareholders.companyId, companyId));
}

export async function getShareholderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(shareholders).where(eq(shareholders.id, id)).limit(1);
  return result[0];
}

export async function getShareholderCount(companyId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(shareholders)
    .where(and(eq(shareholders.companyId, companyId), eq(shareholders.status, 'active')));
  return result[0]?.count ?? 0;
}

// ============================================
// HOLDINGS QUERIES
// ============================================
export async function getHoldingsByShareholder(shareholderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(holdings).where(eq(holdings.shareholderId, shareholderId));
}

// ============================================
// TRANSACTION QUERIES
// ============================================
export async function getTransactionsByCompany(companyId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transactions)
    .where(eq(transactions.companyId, companyId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

export async function getPendingTransactions(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transactions)
    .where(and(eq(transactions.companyId, companyId), eq(transactions.status, 'pending')))
    .orderBy(desc(transactions.createdAt));
}

export async function getTransactionStats(companyId: number) {
  const db = await getDb();
  if (!db) return { bookEntry: 0, certificates: 0, drs: 0, dtc: 0 };
  
  const stats = await db.select({
    type: transactions.type,
    count: count(),
  }).from(transactions)
    .where(eq(transactions.companyId, companyId))
    .groupBy(transactions.type);
  
  return {
    bookEntry: stats.find(s => s.type === 'transfer')?.count ?? 0,
    certificates: stats.find(s => s.type === 'issuance')?.count ?? 0,
    drs: stats.find(s => s.type === 'drs_transfer')?.count ?? 0,
    dtc: stats.find(s => s.type === 'dtc_deposit')?.count ?? 0,
  };
}

// ============================================
// CERTIFICATE QUERIES
// ============================================
export async function getCertificatesByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(certificates)
    .innerJoin(shareholders, eq(certificates.shareholderId, shareholders.id))
    .where(eq(shareholders.companyId, companyId));
}

export async function getActiveCertificateCount(companyId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(certificates)
    .innerJoin(shareholders, eq(certificates.shareholderId, shareholders.id))
    .where(and(eq(shareholders.companyId, companyId), eq(certificates.status, 'active')));
  return result[0]?.count ?? 0;
}

// ============================================
// DTC/DWAC QUERIES
// ============================================
export async function getDtcRequestsByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dtcRequests)
    .where(eq(dtcRequests.companyId, companyId))
    .orderBy(desc(dtcRequests.submittedAt));
}

export async function getPendingDtcRequests(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dtcRequests)
    .where(and(eq(dtcRequests.companyId, companyId), eq(dtcRequests.status, 'pending')));
}

// ============================================
// CORPORATE ACTION QUERIES
// ============================================
export async function getCorporateActionsByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(corporateActions)
    .where(eq(corporateActions.companyId, companyId))
    .orderBy(desc(corporateActions.createdAt));
}

export async function getUpcomingCorporateActions(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  const today = new Date().toISOString().split('T')[0];
  return db.select().from(corporateActions)
    .where(and(
      eq(corporateActions.companyId, companyId),
      sql`${corporateActions.effectiveDate} >= ${today}`
    ))
    .orderBy(corporateActions.effectiveDate);
}

// ============================================
// DIVIDEND QUERIES
// ============================================
export async function getDividendsByShareholder(shareholderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dividends)
    .where(eq(dividends.shareholderId, shareholderId))
    .orderBy(desc(dividends.paymentDate));
}

// ============================================
// PROXY EVENT QUERIES
// ============================================
export async function getProxyEventsByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(proxyEvents)
    .where(eq(proxyEvents.companyId, companyId))
    .orderBy(desc(proxyEvents.meetingDate));
}

export async function getActiveProxyEvent(companyId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(proxyEvents)
    .where(and(
      eq(proxyEvents.companyId, companyId),
      eq(proxyEvents.status, 'voting_open')
    ))
    .limit(1);
  return result[0];
}

export async function getProxyProposals(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(proxyProposals)
    .where(eq(proxyProposals.proxyEventId, eventId))
    .orderBy(proxyProposals.proposalNumber);
}

export async function getProxyVoteStats(eventId: number) {
  const db = await getDb();
  if (!db) return { for: 0, against: 0, abstain: 0 };
  
  const stats = await db.select({
    vote: proxyVotes.vote,
    totalShares: sum(proxyVotes.shares),
  }).from(proxyVotes)
    .where(eq(proxyVotes.proxyEventId, eventId))
    .groupBy(proxyVotes.vote);
  
  return {
    for: Number(stats.find(s => s.vote === 'for')?.totalShares ?? 0),
    against: Number(stats.find(s => s.vote === 'against')?.totalShares ?? 0),
    abstain: Number(stats.find(s => s.vote === 'abstain')?.totalShares ?? 0),
  };
}

// ============================================
// EQUITY PLAN QUERIES
// ============================================
export async function getEquityPlansByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(equityPlans)
    .where(eq(equityPlans.companyId, companyId));
}

export async function getEquityGrantsByEmployee(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(equityGrants)
    .where(eq(equityGrants.employeeId, employeeId))
    .orderBy(desc(equityGrants.grantDate));
}

export async function getUpcomingVestingEvents(companyId: number, days = 30) {
  const db = await getDb();
  if (!db) return [];
  const today = new Date();
  const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  
  return db.select().from(vestingEvents)
    .innerJoin(equityGrants, eq(vestingEvents.grantId, equityGrants.id))
    .innerJoin(equityPlans, eq(equityGrants.planId, equityPlans.id))
    .where(and(
      eq(equityPlans.companyId, companyId),
      eq(vestingEvents.status, 'scheduled'),
      sql`${vestingEvents.vestingDate} <= ${futureDate.toISOString().split('T')[0]}`
    ))
    .orderBy(vestingEvents.vestingDate);
}

// ============================================
// TAX FORM QUERIES
// ============================================
export async function getTaxFormsByCompany(companyId: number, taxYear?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (taxYear) {
    return db.select().from(taxForms)
      .where(and(eq(taxForms.companyId, companyId), eq(taxForms.taxYear, taxYear)));
  }
  return db.select().from(taxForms).where(eq(taxForms.companyId, companyId));
}

// ============================================
// COMPLIANCE QUERIES
// ============================================
export async function getComplianceAlerts(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(complianceAlerts)
    .where(and(eq(complianceAlerts.companyId, companyId), eq(complianceAlerts.status, 'active')))
    .orderBy(complianceAlerts.dueDate);
}

export async function getComplianceScore(companyId: number) {
  const db = await getDb();
  if (!db) return 100;
  
  const alerts = await db.select({ count: count() }).from(complianceAlerts)
    .where(and(eq(complianceAlerts.companyId, companyId), eq(complianceAlerts.status, 'active')));
  
  const activeAlerts = alerts[0]?.count ?? 0;
  return Math.max(0, 100 - (activeAlerts * 5));
}

// ============================================
// AUDIT LOG QUERIES
// ============================================
export async function getAuditLog(companyId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLog)
    .where(eq(auditLog.companyId, companyId))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);
}

export async function createAuditEntry(entry: {
  userId?: number;
  companyId?: number;
  action: string;
  entityType: string;
  entityId?: number;
  oldValues?: unknown;
  newValues?: unknown;
  ipAddress?: string;
  userAgent?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLog).values(entry);
}

// ============================================
// NOTIFICATION QUERIES
// ============================================
export async function getNotificationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return result[0]?.count ?? 0;
}

// ============================================
// INTEGRATION QUERIES
// ============================================
export async function getIntegrationsByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(integrations).where(eq(integrations.companyId, companyId));
}

// ============================================
// DASHBOARD STATS
// ============================================
export async function getDashboardStats(companyId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [capTable, shareholderCnt, pendingTx, complianceScore] = await Promise.all([
    getCapTableSummary(companyId),
    getShareholderCount(companyId),
    getPendingTransactions(companyId),
    getComplianceScore(companyId),
  ]);
  
  return {
    capTable,
    shareholderCount: shareholderCnt,
    pendingTransactions: pendingTx.length,
    complianceScore,
  };
}

// ============================================
// EXPORT QUERIES (for CSV/Excel export)
// ============================================
export async function getHoldingsByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(holdings)
    .innerJoin(shareholders, eq(holdings.shareholderId, shareholders.id))
    .where(eq(shareholders.companyId, companyId))
    .orderBy(desc(holdings.createdAt));
}
