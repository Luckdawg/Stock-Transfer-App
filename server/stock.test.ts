import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@company.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@company.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthenticatedContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Stock Transfer Platform - Auth Router", () => {
  it("returns user info for authenticated users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.auth.me();
    
    expect(result).toBeDefined();
    expect(result?.email).toBe("admin@company.com");
    expect(result?.role).toBe("admin");
  });

  it("returns null for unauthenticated users", async () => {
    const ctx = createUnauthenticatedContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.auth.me();
    
    expect(result).toBeNull();
  });

  it("logout clears session cookie", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.auth.logout();
    
    expect(result).toEqual({ success: true });
    expect(ctx.res.clearCookie).toHaveBeenCalled();
  });
});

describe("Stock Transfer Platform - Company Router", () => {
  it("company.list requires authentication", async () => {
    const ctx = createUnauthenticatedContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.company.list()).rejects.toThrow();
  });

  it("company.list returns array for authenticated users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.company.list();
    
    expect(Array.isArray(result)).toBe(true);
  });

  it("company.create requires admin role", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.company.create({
        name: "Test Company",
        ticker: "TEST",
      })
    ).rejects.toThrow("Admin access required");
  });
});

describe("Stock Transfer Platform - Cap Table Router", () => {
  it("capTable.summary requires authentication", async () => {
    const ctx = createUnauthenticatedContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.capTable.summary({ companyId: 1 })
    ).rejects.toThrow();
  });

  it("capTable.shareClasses requires authentication", async () => {
    const ctx = createUnauthenticatedContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.capTable.shareClasses({ companyId: 1 })
    ).rejects.toThrow();
  });

  it("capTable.createShareClass requires admin role", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.capTable.createShareClass({
        companyId: 1,
        name: "Common Stock",
        authorizedShares: 100000000,
      })
    ).rejects.toThrow("Admin access required");
  });
});

describe("Stock Transfer Platform - Shareholder Router", () => {
  it("shareholder.list requires authentication", async () => {
    const ctx = createUnauthenticatedContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.shareholder.list({ companyId: 1 })
    ).rejects.toThrow();
  });

  it("shareholder.list returns array for authenticated users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.shareholder.list({ companyId: 1 });
    
    expect(Array.isArray(result)).toBe(true);
  });

  it("shareholder.create requires admin role", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.shareholder.create({
        companyId: 1,
        name: "John Doe",
        type: "individual",
      })
    ).rejects.toThrow("Admin access required");
  });
});

describe("Stock Transfer Platform - Transaction Router", () => {
  it("transaction.list requires authentication", async () => {
    const ctx = createUnauthenticatedContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.transaction.list({ companyId: 1 })
    ).rejects.toThrow();
  });

  it("transaction.list returns array for authenticated users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.transaction.list({ companyId: 1 });
    
    expect(Array.isArray(result)).toBe(true);
  });

  it("transaction.create requires admin role", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.transaction.create({
        companyId: 1,
        shareClassId: 1,
        type: "transfer",
        shares: 1000,
      })
    ).rejects.toThrow("Admin access required");
  });
});

describe("Stock Transfer Platform - Certificate Router", () => {
  it("certificate.list requires authentication", async () => {
    const ctx = createUnauthenticatedContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.certificate.list({ companyId: 1 })
    ).rejects.toThrow();
  });

  it("certificate.issue requires admin role", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.certificate.issue({
        companyId: 1,
        shareClassId: 1,
        holdingId: 1,
        shares: 1000,
      })
    ).rejects.toThrow("Admin access required");
  });
});

describe("Stock Transfer Platform - Corporate Actions Router", () => {
  it("corporateAction.list requires authentication", async () => {
    const ctx = createUnauthenticatedContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.corporateAction.list({ companyId: 1 })
    ).rejects.toThrow();
  });

  it("corporateAction.create requires admin role", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.corporateAction.create({
        companyId: 1,
        type: "stock_split",
        title: "2-for-1 Stock Split",
        recordDate: "2025-01-15",
      })
    ).rejects.toThrow("Admin access required");
  });
});

describe("Stock Transfer Platform - Dividend Router", () => {
  it("dividend.byShareholder requires authentication", async () => {
    const ctx = createUnauthenticatedContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.dividend.byShareholder({ shareholderId: 1 })
    ).rejects.toThrow();
  });

  it("dividend.byShareholder returns array for authenticated users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.dividend.byShareholder({ shareholderId: 1 });
    
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Stock Transfer Platform - Proxy Router", () => {
  it("proxy.events requires authentication", async () => {
    const ctx = createUnauthenticatedContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.proxy.events({ companyId: 1 })
    ).rejects.toThrow();
  });

  it("proxy.createEvent requires admin role", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.proxy.createEvent({
        companyId: 1,
        title: "Annual General Meeting 2025",
        type: "annual",
        meetingDate: "2025-03-15",
        recordDate: "2025-02-15",
      })
    ).rejects.toThrow("Admin access required");
  });
});

describe("Stock Transfer Platform - Equity Plans Router", () => {
  it("equity.plans requires authentication", async () => {
    const ctx = createUnauthenticatedContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.equity.plans({ companyId: 1 })
    ).rejects.toThrow();
  });

  it("equity.plans returns array for authenticated users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.equity.plans({ companyId: 1 });
    
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Stock Transfer Platform - Compliance Router", () => {
  it("compliance.alerts requires authentication", async () => {
    const ctx = createUnauthenticatedContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.compliance.alerts({ companyId: 1 })
    ).rejects.toThrow();
  });

  it("compliance.createAlert requires admin role", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.compliance.createAlert({
        companyId: 1,
        type: "filing_deadline",
        severity: "high",
        title: "1099-DIV Filing Due",
      })
    ).rejects.toThrow("Admin access required");
  });

  it("compliance.resolveAlert requires admin role", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.compliance.resolveAlert({ id: 1 })
    ).rejects.toThrow("Admin access required");
  });
});

describe("Stock Transfer Platform - Audit Router", () => {
  it("audit.log requires admin role", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.audit.log({ companyId: 1 })
    ).rejects.toThrow("Admin access required");
  });
});
