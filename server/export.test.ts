import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { escapeCSV, formatDate, formatCurrency, generateShareholdersCSV, generateTransactionsCSV } from "./exportUtils";
import type { TrpcContext } from "./_core/context";

// Mock authenticated user context
function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Export Utilities", () => {
  describe("escapeCSV", () => {
    it("should return empty string for null", () => {
      expect(escapeCSV(null)).toBe("");
    });

    it("should return empty string for undefined", () => {
      expect(escapeCSV(undefined)).toBe("");
    });

    it("should return string as-is if no special characters", () => {
      expect(escapeCSV("Hello")).toBe("Hello");
    });

    it("should escape commas in values", () => {
      expect(escapeCSV("Value, with comma")).toBe('"Value, with comma"');
    });

    it("should escape quotes in values", () => {
      expect(escapeCSV('Value with "quotes"')).toBe('"Value with ""quotes"""');
    });

    it("should escape newlines in values", () => {
      expect(escapeCSV("Line1\nLine2")).toBe('"Line1\nLine2"');
    });
  });

  describe("formatDate", () => {
    it("should format date string correctly", () => {
      const result = formatDate("2024-01-15T00:00:00.000Z");
      expect(result).toBe("2024-01-15");
    });

    it("should format Date object correctly", () => {
      const result = formatDate(new Date("2024-01-15T00:00:00.000Z"));
      expect(result).toBe("2024-01-15");
    });

    it("should handle null values", () => {
      const result = formatDate(null);
      expect(result).toBe("");
    });

    it("should handle undefined values", () => {
      const result = formatDate(undefined);
      expect(result).toBe("");
    });
  });

  describe("formatCurrency", () => {
    it("should format currency correctly", () => {
      const result = formatCurrency(1234.56);
      expect(result).toBe("1234.56");
    });

    it("should handle null values", () => {
      const result = formatCurrency(null);
      expect(result).toBe("");
    });

    it("should handle undefined values", () => {
      const result = formatCurrency(undefined);
      expect(result).toBe("");
    });

    it("should handle string values", () => {
      const result = formatCurrency("1234.56");
      expect(result).toBe("1234.56");
    });
  });

  describe("generateShareholdersCSV", () => {
    it("should generate CSV with headers", () => {
      const csv = generateShareholdersCSV([]);
      expect(csv).toContain("ID,Account Number,Name,Type,Status");
    });

    it("should include shareholder data", () => {
      const shareholders = [{
        id: 1,
        accountNumber: "ACC001",
        name: "John Doe",
        type: "individual",
        status: "active",
        email: "john@example.com",
        phone: "555-1234",
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
        taxId: "XXX-XX-1234",
        createdAt: new Date("2024-01-15"),
      }];
      
      const csv = generateShareholdersCSV(shareholders);
      expect(csv).toContain("John Doe");
      expect(csv).toContain("ACC001");
      expect(csv).toContain("john@example.com");
    });
  });

  describe("generateTransactionsCSV", () => {
    it("should generate CSV with headers", () => {
      const csv = generateTransactionsCSV([]);
      expect(csv).toContain("ID,Transaction Number,Type,Status");
    });

    it("should include transaction data", () => {
      const transactions = [{
        id: 1,
        transactionNumber: "TXN001",
        type: "transfer",
        status: "completed",
        fromShareholderId: 1,
        toShareholderId: 2,
        shareClassId: 1,
        shares: 100,
        pricePerShare: 10.50,
        totalValue: 1050.00,
        transactionDate: "2024-01-15",
        settlementDate: "2024-01-17",
        notes: "Test transaction",
        createdAt: new Date("2024-01-15"),
      }];
      
      const csv = generateTransactionsCSV(transactions);
      expect(csv).toContain("TXN001");
      expect(csv).toContain("transfer");
      expect(csv).toContain("completed");
    });
  });
});

describe("Export Router", () => {
  describe("export.shareholders", () => {
    it("should have shareholders export endpoint defined", () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.export.shareholders).toBeDefined();
    });

    it("should accept companyId parameter", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      // This should not throw - the endpoint exists and accepts the parameter
      const result = await caller.export.shareholders({ companyId: 1 });
      expect(result).toHaveProperty("csv");
      expect(result).toHaveProperty("filename");
      expect(result.filename).toContain("shareholders");
      expect(result.filename).toContain(".csv");
    });
  });

  describe("export.transactions", () => {
    it("should have transactions export endpoint defined", () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.export.transactions).toBeDefined();
    });

    it("should accept companyId parameter", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.export.transactions({ companyId: 1 });
      expect(result).toHaveProperty("csv");
      expect(result).toHaveProperty("filename");
      expect(result.filename).toContain("transactions");
      expect(result.filename).toContain(".csv");
    });
  });

  describe("export.holdings", () => {
    it("should have holdings export endpoint defined", () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.export.holdings).toBeDefined();
    });

    it("should accept companyId parameter", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.export.holdings({ companyId: 1 });
      expect(result).toHaveProperty("csv");
      expect(result).toHaveProperty("filename");
      expect(result.filename).toContain("holdings");
      expect(result.filename).toContain(".csv");
    });
  });

  describe("export.certificates", () => {
    it("should have certificates export endpoint defined", () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.export.certificates).toBeDefined();
    });

    it("should accept companyId parameter", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.export.certificates({ companyId: 1 });
      expect(result).toHaveProperty("csv");
      expect(result).toHaveProperty("filename");
      expect(result.filename).toContain("certificates");
      expect(result.filename).toContain(".csv");
    });
  });
});
