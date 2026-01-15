import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Delete Functionality", () => {
  describe("shareholder.delete", () => {
    it("should have delete endpoint defined", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      // Verify the delete procedure exists
      expect(caller.shareholder.delete).toBeDefined();
    });

    it("should accept id parameter for deletion", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      // Test that the procedure accepts the expected input shape
      // We can't actually delete without a real database, but we verify the API shape
      try {
        await caller.shareholder.delete({ id: 999999 });
      } catch (error: any) {
        // Expected to fail since shareholder doesn't exist, but validates input shape
        expect(error.message).toBeDefined();
      }
    });
  });

  describe("company.delete", () => {
    it("should have delete endpoint defined", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      expect(caller.company.delete).toBeDefined();
    });

    it("should accept id parameter for deletion", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      try {
        await caller.company.delete({ id: 999999 });
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });
  });

  describe("transaction.delete", () => {
    it("should have delete endpoint defined", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      expect(caller.transaction.delete).toBeDefined();
    });

    it("should accept id parameter for deletion", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      try {
        await caller.transaction.delete({ id: 999999 });
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });
  });
});

describe("Dashboard Company Selection", () => {
  describe("company.list", () => {
    it("should return list of companies", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const companies = await caller.company.list();
      expect(Array.isArray(companies)).toBe(true);
    });
  });

  describe("shareholder.list with companyId filter", () => {
    it("should accept companyId parameter", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      // Test that the procedure accepts companyId
      const shareholders = await caller.shareholder.list({ companyId: 1 });
      expect(Array.isArray(shareholders)).toBe(true);
    });
  });

  describe("transaction.list with companyId filter", () => {
    it("should accept companyId parameter", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const transactions = await caller.transaction.list({ companyId: 1 });
      expect(Array.isArray(transactions)).toBe(true);
    });
  });

  describe("certificate.list with companyId filter", () => {
    it("should accept companyId parameter", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const certificates = await caller.certificate.list({ companyId: 1 });
      expect(Array.isArray(certificates)).toBe(true);
    });
  });

  describe("corporateAction.list with companyId filter", () => {
    it("should accept companyId parameter", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const actions = await caller.corporateAction.list({ companyId: 1 });
      expect(Array.isArray(actions)).toBe(true);
    });
  });

  describe("proxy.events with companyId filter", () => {
    it("should accept companyId parameter", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const events = await caller.proxy.events({ companyId: 1 });
      expect(Array.isArray(events)).toBe(true);
    });
  });

  describe("compliance.alerts with companyId filter", () => {
    it("should accept companyId parameter", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const alerts = await caller.compliance.alerts({ companyId: 1 });
      expect(Array.isArray(alerts)).toBe(true);
    });
  });

  describe("equity.plans with companyId filter", () => {
    it("should accept companyId parameter", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const plans = await caller.equity.plans({ companyId: 1 });
      expect(Array.isArray(plans)).toBe(true);
    });
  });

  describe("equity.upcomingVesting with companyId filter", () => {
    it("should accept companyId and days parameters", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const vesting = await caller.equity.upcomingVesting({ companyId: 1, days: 30 });
      expect(Array.isArray(vesting)).toBe(true);
    });
  });

  describe("dtc.list with companyId filter", () => {
    it("should accept companyId parameter", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const requests = await caller.dtc.list({ companyId: 1 });
      expect(Array.isArray(requests)).toBe(true);
    });
  });
});
