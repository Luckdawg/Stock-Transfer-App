import { describe, expect, it } from "vitest";
import { generateCertificateHTML, generate1099DivHTML, CertificateData, Form1099DivData } from "./pdfGenerator";

describe("PDF Generator - Stock Certificate", () => {
  it("generates certificate HTML with all required fields", () => {
    const certificateData: CertificateData = {
      certificateNumber: "CERT-001234",
      companyName: "Acme Corporation",
      companyTicker: "ACME",
      shareholderName: "John Smith",
      shareholderAddress: "123 Main St, New York, NY 10001",
      shareClassName: "Common Stock",
      shares: 10000,
      issueDate: "2024-01-15",
      cusip: "123456789",
      parValue: "0.01",
      isRestricted: false,
    };

    const html = generateCertificateHTML(certificateData);

    expect(html).toContain("CERT-001234");
    expect(html).toContain("Acme Corporation");
    expect(html).toContain("John Smith");
    expect(html).toContain("10,000");
    expect(html).toContain("Common Stock");
    expect(html).toContain("2024-01-15");
    expect(html).toContain("123456789");
  });

  it("formats share numbers with commas", () => {
    const certificateData: CertificateData = {
      certificateNumber: "CERT-001",
      companyName: "Test Corp",
      companyTicker: "TEST",
      shareholderName: "Test User",
      shareholderAddress: "456 Oak Ave",
      shareClassName: "Common",
      shares: 1000000,
      issueDate: "2024-01-01",
      parValue: "0.001",
      isRestricted: false,
    };

    const html = generateCertificateHTML(certificateData);
    expect(html).toContain("1,000,000");
  });

  it("includes restriction legend for restricted shares", () => {
    const certificateData: CertificateData = {
      certificateNumber: "CERT-002",
      companyName: "Test Corp",
      companyTicker: "TEST",
      shareholderName: "Test User",
      shareholderAddress: "789 Pine St",
      shareClassName: "Preferred",
      shares: 5000,
      issueDate: "2024-02-01",
      parValue: "1.00",
      isRestricted: true,
      restrictionLegend: "Custom restriction text",
    };

    const html = generateCertificateHTML(certificateData);
    expect(html).toBeDefined();
    expect(html).toContain("RESTRICTIVE LEGEND");
    expect(html).toContain("Custom restriction text");
  });
});

describe("PDF Generator - 1099-DIV Tax Form", () => {
  it("generates 1099-DIV HTML with all required fields", () => {
    const taxFormData: Form1099DivData = {
      payerName: "Acme Corporation",
      payerTIN: "12-3456789",
      payerAddress: "123 Main St, New York, NY 10001",
      recipientName: "John Smith",
      recipientTIN: "***-**-1234",
      recipientAddress: "456 Oak Ave, Los Angeles, CA 90001",
      taxYear: 2024,
      totalOrdinaryDividends: 1500.00,
      qualifiedDividends: 1200.00,
      totalCapitalGainDistribution: 500.00,
      unrecaptured1250Gain: 0,
      section1202Gain: 0,
      collectiblesGain: 0,
      nondividendDistributions: 0,
      federalIncomeTaxWithheld: 150.00,
      section199ADividends: 0,
      investmentExpenses: 0,
      foreignTaxPaid: 0,
      foreignCountry: "",
      cashLiquidationDistributions: 0,
      noncashLiquidationDistributions: 0,
      exemptInterestDividends: 0,
      specifiedPrivateActivityBondInterest: 0,
      stateId: "NY",
      stateTaxWithheld: 50.00,
    };

    const html = generate1099DivHTML(taxFormData);

    expect(html).toContain("Acme Corporation");
    expect(html).toContain("12-3456789");
    expect(html).toContain("John Smith");
    expect(html).toContain("2024");
    expect(html).toContain("1500.00");
    expect(html).toContain("1200.00");
  });

  it("handles zero values correctly", () => {
    const taxFormData: Form1099DivData = {
      payerName: "Test Corp",
      payerTIN: "00-0000000",
      payerAddress: "Test Address",
      recipientName: "Test User",
      recipientTIN: "***-**-0000",
      recipientAddress: "Test Address",
      taxYear: 2024,
      totalOrdinaryDividends: 0,
      qualifiedDividends: 0,
      totalCapitalGainDistribution: 0,
      unrecaptured1250Gain: 0,
      section1202Gain: 0,
      collectiblesGain: 0,
      nondividendDistributions: 0,
      federalIncomeTaxWithheld: 0,
      section199ADividends: 0,
      investmentExpenses: 0,
      foreignTaxPaid: 0,
      foreignCountry: "",
      cashLiquidationDistributions: 0,
      noncashLiquidationDistributions: 0,
      exemptInterestDividends: 0,
      specifiedPrivateActivityBondInterest: 0,
      stateId: "",
      stateTaxWithheld: 0,
    };

    const html = generate1099DivHTML(taxFormData);
    expect(html).toBeDefined();
    expect(html).toContain("0.00");
  });
});
