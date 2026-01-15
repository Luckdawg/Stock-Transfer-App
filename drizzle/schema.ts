import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, bigint, json } from "drizzle-orm/mysql-core";

// ============================================
// USERS & AUTHENTICATION
// ============================================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "issuer", "shareholder", "employee"]).default("user").notNull(),
  companyId: int("companyId"),
  securityLevel: mysqlEnum("securityLevel", ["low", "medium", "high"]).default("medium"),
  mfaEnabled: boolean("mfaEnabled").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// ============================================
// USER INVITATIONS
// ============================================
export const invitations = mysqlTable("invitations", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  role: mysqlEnum("role", ["user", "admin", "issuer", "shareholder", "employee"]).default("user").notNull(),
  companyId: int("companyId"),
  status: mysqlEnum("status", ["pending", "accepted", "expired", "revoked"]).default("pending").notNull(),
  invitedBy: int("invitedBy").notNull(),
  acceptedBy: int("acceptedBy"),
  message: text("message"),
  expiresAt: timestamp("expiresAt").notNull(),
  acceptedAt: timestamp("acceptedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// COMPANIES / ISSUERS
// ============================================
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  ticker: varchar("ticker", { length: 10 }),
  cik: varchar("cik", { length: 20 }),
  ein: varchar("ein", { length: 20 }),
  incorporationState: varchar("incorporationState", { length: 50 }),
  incorporationDate: varchar("incorporationDate", { length: 20 }),
  fiscalYearEnd: varchar("fiscalYearEnd", { length: 10 }),
  industry: varchar("industry", { length: 100 }),
  sector: varchar("sector", { length: 100 }),
  address1: varchar("address1", { length: 255 }),
  address2: varchar("address2", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  postalCode: varchar("postalCode", { length: 20 }),
  country: varchar("country", { length: 100 }).default("USA"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 255 }),
  description: text("description"),
  logoUrl: varchar("logoUrl", { length: 500 }),
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// SHARE CLASSES
// ============================================
export const shareClasses = mysqlTable("share_classes", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 20 }),
  authorizedShares: bigint("authorizedShares", { mode: "number" }).notNull(),
  issuedShares: bigint("issuedShares", { mode: "number" }).default(0),
  outstandingShares: bigint("outstandingShares", { mode: "number" }).default(0),
  treasuryShares: bigint("treasuryShares", { mode: "number" }).default(0),
  parValue: decimal("parValue", { precision: 10, scale: 4 }).default("0.0001"),
  votingRights: boolean("votingRights").default(true),
  dividendRate: decimal("dividendRate", { precision: 10, scale: 4 }),
  liquidationPreference: decimal("liquidationPreference", { precision: 15, scale: 2 }),
  conversionRatio: decimal("conversionRatio", { precision: 10, scale: 4 }),
  isPreferred: boolean("isPreferred").default(false),
  isRestricted: boolean("isRestricted").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// SHAREHOLDERS
// ============================================
export const shareholders = mysqlTable("shareholders", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  userId: int("userId"),
  accountNumber: varchar("accountNumber", { length: 50 }).notNull(),
  type: mysqlEnum("type", ["individual", "joint", "trust", "corporation", "partnership", "ira", "custodian"]).default("individual"),
  name: varchar("name", { length: 255 }).notNull(),
  taxId: varchar("taxId", { length: 50 }),
  taxIdType: mysqlEnum("taxIdType", ["ssn", "ein", "itin", "foreign"]),
  address1: varchar("address1", { length: 255 }),
  address2: varchar("address2", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  postalCode: varchar("postalCode", { length: 20 }),
  country: varchar("country", { length: 100 }).default("USA"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  status: mysqlEnum("status", ["active", "inactive", "deceased", "escheated"]).default("active"),
  isInsider: boolean("isInsider").default(false),
  isAffiliate: boolean("isAffiliate").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// HOLDINGS (SHARE LEDGER)
// ============================================
export const holdings = mysqlTable("holdings", {
  id: int("id").autoincrement().primaryKey(),
  shareholderId: int("shareholderId").notNull(),
  shareClassId: int("shareClassId").notNull(),
  shares: bigint("shares", { mode: "number" }).notNull(),
  costBasis: decimal("costBasis", { precision: 15, scale: 4 }),
  acquisitionDate: varchar("acquisitionDate", { length: 20 }),
  holdingType: mysqlEnum("holdingType", ["book_entry", "certificated", "drs", "dtc"]).default("book_entry"),
  isRestricted: boolean("isRestricted").default(false),
  restrictionType: mysqlEnum("restrictionType", ["rule_144", "rule_144a", "reg_s", "legend", "none"]).default("none"),
  restrictionEndDate: varchar("restrictionEndDate", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// CERTIFICATES
// ============================================
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  certificateNumber: varchar("certificateNumber", { length: 50 }).notNull().unique(),
  shareholderId: int("shareholderId").notNull(),
  shareClassId: int("shareClassId").notNull(),
  shares: bigint("shares", { mode: "number" }).notNull(),
  issueDate: varchar("issueDate", { length: 20 }).notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "transferred", "lost", "stolen", "replaced"]).default("active"),
  cancelDate: varchar("cancelDate", { length: 20 }),
  cancelReason: text("cancelReason"),
  replacementCertId: int("replacementCertId"),
  indemnityBondNumber: varchar("indemnityBondNumber", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// TRANSACTIONS
// ============================================
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  transactionNumber: varchar("transactionNumber", { length: 50 }).notNull().unique(),
  type: mysqlEnum("type", [
    "issuance", "transfer", "cancellation", "split", "reverse_split",
    "dividend", "conversion", "redemption", "repurchase", "gift",
    "inheritance", "dtc_deposit", "dtc_withdrawal", "drs_transfer"
  ]).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "processing", "completed", "rejected", "cancelled"]).default("pending"),
  fromShareholderId: int("fromShareholderId"),
  toShareholderId: int("toShareholderId"),
  shareClassId: int("shareClassId").notNull(),
  shares: bigint("shares", { mode: "number" }).notNull(),
  pricePerShare: decimal("pricePerShare", { precision: 15, scale: 4 }),
  totalValue: decimal("totalValue", { precision: 20, scale: 4 }),
  transactionDate: timestamp("transactionDate").notNull(),
  settlementDate: varchar("settlementDate", { length: 20 }),
  notes: text("notes"),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// DTC/DWAC REQUESTS
// ============================================
export const dtcRequests = mysqlTable("dtc_requests", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  requestNumber: varchar("requestNumber", { length: 50 }).notNull().unique(),
  type: mysqlEnum("type", ["deposit", "withdrawal", "fast_transfer"]).notNull(),
  dtcParticipantNumber: varchar("dtcParticipantNumber", { length: 20 }).notNull(),
  brokerName: varchar("brokerName", { length: 255 }),
  shareholderId: int("shareholderId").notNull(),
  shareClassId: int("shareClassId").notNull(),
  shares: bigint("shares", { mode: "number" }).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "rejected"]).default("pending"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// CORPORATE ACTIONS
// ============================================
export const corporateActions = mysqlTable("corporate_actions", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  actionNumber: varchar("actionNumber", { length: 50 }).notNull().unique(),
  type: mysqlEnum("type", [
    "dividend_cash", "dividend_stock", "split", "reverse_split",
    "merger", "acquisition", "spin_off", "rights_offering",
    "tender_offer", "consolidation", "name_change", "symbol_change"
  ]).notNull(),
  status: mysqlEnum("status", ["announced", "pending", "processing", "completed", "cancelled"]).default("announced"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  recordDate: varchar("recordDate", { length: 20 }),
  exDate: varchar("exDate", { length: 20 }),
  paymentDate: varchar("paymentDate", { length: 20 }),
  effectiveDate: varchar("effectiveDate", { length: 20 }),
  ratio: varchar("ratio", { length: 50 }),
  cashAmount: decimal("cashAmount", { precision: 15, scale: 4 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  affectedShareClassId: int("affectedShareClassId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// DIVIDENDS
// ============================================
export const dividends = mysqlTable("dividends", {
  id: int("id").autoincrement().primaryKey(),
  corporateActionId: int("corporateActionId").notNull(),
  shareholderId: int("shareholderId").notNull(),
  shares: bigint("shares", { mode: "number" }).notNull(),
  grossAmount: decimal("grossAmount", { precision: 15, scale: 4 }).notNull(),
  withholdingTax: decimal("withholdingTax", { precision: 15, scale: 4 }).default("0"),
  netAmount: decimal("netAmount", { precision: 15, scale: 4 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  paymentMethod: mysqlEnum("paymentMethod", ["check", "ach", "wire", "reinvest"]).default("check"),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "processing", "paid", "returned", "escheated"]).default("pending"),
  paymentDate: varchar("paymentDate", { length: 20 }),
  checkNumber: varchar("checkNumber", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// PROXY EVENTS
// ============================================
export const proxyEvents = mysqlTable("proxy_events", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["annual_meeting", "special_meeting", "written_consent"]).default("annual_meeting"),
  recordDate: varchar("recordDate", { length: 20 }).notNull(),
  meetingDate: timestamp("meetingDate"),
  meetingLocation: varchar("meetingLocation", { length: 255 }),
  isVirtual: boolean("isVirtual").default(false),
  virtualMeetingUrl: varchar("virtualMeetingUrl", { length: 500 }),
  quorumRequirement: decimal("quorumRequirement", { precision: 5, scale: 2 }).default("50.00"),
  status: mysqlEnum("status", ["draft", "announced", "materials_sent", "voting_open", "closed", "certified"]).default("draft"),
  totalEligibleShares: bigint("totalEligibleShares", { mode: "number" }),
  totalVotedShares: bigint("totalVotedShares", { mode: "number" }).default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// PROXY PROPOSALS
// ============================================
export const proxyProposals = mysqlTable("proxy_proposals", {
  id: int("id").autoincrement().primaryKey(),
  proxyEventId: int("proxyEventId").notNull(),
  proposalNumber: int("proposalNumber").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["director_election", "ratify_auditor", "executive_compensation", "shareholder_proposal", "other"]).default("other"),
  votesFor: bigint("votesFor", { mode: "number" }).default(0),
  votesAgainst: bigint("votesAgainst", { mode: "number" }).default(0),
  votesAbstain: bigint("votesAbstain", { mode: "number" }).default(0),
  result: mysqlEnum("result", ["pending", "passed", "failed"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// PROXY VOTES
// ============================================
export const proxyVotes = mysqlTable("proxy_votes", {
  id: int("id").autoincrement().primaryKey(),
  proxyEventId: int("proxyEventId").notNull(),
  proposalId: int("proposalId").notNull(),
  shareholderId: int("shareholderId").notNull(),
  shares: bigint("shares", { mode: "number" }).notNull(),
  vote: mysqlEnum("vote", ["for", "against", "abstain", "withhold"]).notNull(),
  voteMethod: mysqlEnum("voteMethod", ["online", "mail", "phone", "in_person"]).default("online"),
  votedAt: timestamp("votedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================
// EQUITY PLANS
// ============================================
export const equityPlans = mysqlTable("equity_plans", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["stock_option", "rsu", "performance", "sar", "espp", "phantom"]).notNull(),
  shareClassId: int("shareClassId").notNull(),
  authorizedShares: bigint("authorizedShares", { mode: "number" }).notNull(),
  availableShares: bigint("availableShares", { mode: "number" }).notNull(),
  effectiveDate: varchar("effectiveDate", { length: 20 }).notNull(),
  expirationDate: varchar("expirationDate", { length: 20 }),
  status: mysqlEnum("status", ["active", "frozen", "terminated"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// EQUITY GRANTS
// ============================================
export const equityGrants = mysqlTable("equity_grants", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").notNull(),
  grantNumber: varchar("grantNumber", { length: 50 }).notNull().unique(),
  employeeId: int("employeeId").notNull(),
  grantDate: varchar("grantDate", { length: 20 }).notNull(),
  grantType: mysqlEnum("grantType", ["iso", "nso", "rsu", "psu", "sar", "restricted_stock"]).notNull(),
  sharesGranted: bigint("sharesGranted", { mode: "number" }).notNull(),
  sharesVested: bigint("sharesVested", { mode: "number" }).default(0),
  sharesExercised: bigint("sharesExercised", { mode: "number" }).default(0),
  sharesCancelled: bigint("sharesCancelled", { mode: "number" }).default(0),
  exercisePrice: decimal("exercisePrice", { precision: 15, scale: 4 }),
  fairMarketValue: decimal("fairMarketValue", { precision: 15, scale: 4 }),
  vestingSchedule: mysqlEnum("vestingSchedule", ["cliff", "monthly", "quarterly", "annual", "custom"]).default("monthly"),
  vestingStartDate: varchar("vestingStartDate", { length: 20 }),
  cliffMonths: int("cliffMonths").default(12),
  vestingMonths: int("vestingMonths").default(48),
  expirationDate: varchar("expirationDate", { length: 20 }),
  status: mysqlEnum("status", ["active", "fully_vested", "exercised", "cancelled", "expired"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// VESTING EVENTS
// ============================================
export const vestingEvents = mysqlTable("vesting_events", {
  id: int("id").autoincrement().primaryKey(),
  grantId: int("grantId").notNull(),
  vestingDate: varchar("vestingDate", { length: 20 }).notNull(),
  sharesVesting: bigint("sharesVesting", { mode: "number" }).notNull(),
  status: mysqlEnum("status", ["scheduled", "vested", "cancelled"]).default("scheduled"),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================
// TAX FORMS
// ============================================
export const taxForms = mysqlTable("tax_forms", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  shareholderId: int("shareholderId").notNull(),
  taxYear: int("taxYear").notNull(),
  formType: mysqlEnum("formType", ["1099_div", "1099_b", "1099_misc", "1042_s", "w8_ben", "w9"]).notNull(),
  grossAmount: decimal("grossAmount", { precision: 15, scale: 4 }),
  taxWithheld: decimal("taxWithheld", { precision: 15, scale: 4 }),
  status: mysqlEnum("status", ["draft", "generated", "sent", "corrected"]).default("draft"),
  generatedAt: timestamp("generatedAt"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// COMPLIANCE ALERTS
// ============================================
export const complianceAlerts = mysqlTable("compliance_alerts", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  type: mysqlEnum("type", ["filing_deadline", "escheatment", "rule_144", "insider_trading", "regulatory", "audit"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: varchar("dueDate", { length: 20 }),
  status: mysqlEnum("status", ["active", "acknowledged", "resolved", "dismissed"]).default("active"),
  resolvedAt: timestamp("resolvedAt"),
  resolvedBy: int("resolvedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// AUDIT LOG
// ============================================
export const auditLog = mysqlTable("audit_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  companyId: int("companyId"),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 100 }).notNull(),
  entityId: int("entityId"),
  oldValues: json("oldValues"),
  newValues: json("newValues"),
  ipAddress: varchar("ipAddress", { length: 50 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================
// NOTIFICATIONS
// ============================================
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["transaction", "dividend", "proxy", "compliance", "system", "grant"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  isRead: boolean("isRead").default(false),
  link: varchar("link", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================
// SYSTEM INTEGRATIONS
// ============================================
export const integrations = mysqlTable("integrations", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  type: mysqlEnum("type", ["erp", "hris", "tax_system", "banking", "dtc", "custom"]).notNull(),
  status: mysqlEnum("status", ["connected", "disconnected", "error"]).default("disconnected"),
  lastSyncAt: timestamp("lastSyncAt"),
  config: json("config"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// DOCUMENTS / ATTACHMENTS
// ============================================
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  entityType: mysqlEnum("entityType", ["transaction", "corporate_action", "certificate", "shareholder", "dividend", "proxy_event"]).notNull(),
  entityId: int("entityId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 1000 }).notNull(),
  fileSize: int("fileSize").notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  description: text("description"),
  uploadedBy: int("uploadedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Company = typeof companies.$inferSelect;
export type ShareClass = typeof shareClasses.$inferSelect;
export type Shareholder = typeof shareholders.$inferSelect;
export type Holding = typeof holdings.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type DtcRequest = typeof dtcRequests.$inferSelect;
export type CorporateAction = typeof corporateActions.$inferSelect;
export type Dividend = typeof dividends.$inferSelect;
export type ProxyEvent = typeof proxyEvents.$inferSelect;
export type ProxyProposal = typeof proxyProposals.$inferSelect;
export type ProxyVote = typeof proxyVotes.$inferSelect;
export type EquityPlan = typeof equityPlans.$inferSelect;
export type EquityGrant = typeof equityGrants.$inferSelect;
export type VestingEvent = typeof vestingEvents.$inferSelect;
export type TaxForm = typeof taxForms.$inferSelect;
export type ComplianceAlert = typeof complianceAlerts.$inferSelect;
export type AuditLogEntry = typeof auditLog.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Integration = typeof integrations.$inferSelect;
export type Document = typeof documents.$inferSelect;
