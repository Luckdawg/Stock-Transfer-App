/**
 * PDF Generation Service for Stock Transfer Platform
 * Generates stock certificates and tax forms (1099-DIV, 1099-B)
 */

import { getDb } from "./db";
import { shareholders, shareClasses, certificates, companies, dividends, corporateActions, taxForms } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

// Certificate template data structure
export interface CertificateData {
  certificateNumber: string;
  companyName: string;
  companyTicker: string;
  shareholderName: string;
  shareholderAddress: string;
  shareClassName: string;
  shares: number;
  issueDate: string;
  cusip?: string;
  parValue: string;
  isRestricted: boolean;
  restrictionLegend?: string;
}

// 1099-DIV form data structure
export interface Form1099DivData {
  taxYear: number;
  payerName: string;
  payerTIN: string;
  payerAddress: string;
  recipientName: string;
  recipientTIN: string;
  recipientAddress: string;
  totalOrdinaryDividends: number;
  qualifiedDividends: number;
  totalCapitalGainDistribution: number;
  unrecaptured1250Gain: number;
  section1202Gain: number;
  collectiblesGain: number;
  nondividendDistributions: number;
  federalIncomeTaxWithheld: number;
  section199ADividends: number;
  investmentExpenses: number;
  foreignTaxPaid: number;
  foreignCountry: string;
  cashLiquidationDistributions: number;
  noncashLiquidationDistributions: number;
  exemptInterestDividends: number;
  specifiedPrivateActivityBondInterest: number;
  stateId: string;
  stateTaxWithheld: number;
}

// 1099-B form data structure
export interface Form1099BData {
  taxYear: number;
  payerName: string;
  payerTIN: string;
  payerAddress: string;
  recipientName: string;
  recipientTIN: string;
  recipientAddress: string;
  transactions: Array<{
    description: string;
    dateAcquired: string;
    dateSold: string;
    proceeds: number;
    costBasis: number;
    shortTermGainLoss: number;
    longTermGainLoss: number;
    washSaleDisallowed: number;
    federalIncomeTaxWithheld: number;
  }>;
  totalProceeds: number;
  totalCostBasis: number;
  totalFederalWithheld: number;
}

/**
 * Generate HTML for a stock certificate
 */
export function generateCertificateHTML(data: CertificateData): string {
  const formattedShares = data.shares.toLocaleString();
  const restrictionText = data.isRestricted ? `
    <div class="restriction-legend">
      <h4>RESTRICTIVE LEGEND</h4>
      <p>${data.restrictionLegend || 'THE SHARES REPRESENTED BY THIS CERTIFICATE HAVE NOT BEEN REGISTERED UNDER THE SECURITIES ACT OF 1933, AS AMENDED, OR APPLICABLE STATE SECURITIES LAWS. THESE SHARES MAY NOT BE SOLD, TRANSFERRED, PLEDGED OR HYPOTHECATED UNLESS REGISTERED UNDER SUCH ACT AND LAWS OR UNLESS AN EXEMPTION FROM REGISTRATION IS AVAILABLE.'}</p>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Stock Certificate - ${data.certificateNumber}</title>
  <style>
    @page {
      size: 11in 8.5in landscape;
      margin: 0.5in;
    }
    body {
      font-family: 'Times New Roman', serif;
      margin: 0;
      padding: 0;
      background: #fff;
    }
    .certificate {
      border: 8px double #1a365d;
      padding: 40px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      position: relative;
      min-height: 600px;
    }
    .certificate::before {
      content: '';
      position: absolute;
      top: 15px;
      left: 15px;
      right: 15px;
      bottom: 15px;
      border: 2px solid #1a365d;
      pointer-events: none;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .company-name {
      font-size: 32px;
      font-weight: bold;
      color: #1a365d;
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-bottom: 5px;
    }
    .ticker {
      font-size: 18px;
      color: #4a5568;
      margin-bottom: 20px;
    }
    .title {
      font-size: 24px;
      font-weight: bold;
      color: #2d3748;
      border-bottom: 2px solid #1a365d;
      border-top: 2px solid #1a365d;
      padding: 10px 0;
      margin: 20px 0;
    }
    .certificate-number {
      position: absolute;
      top: 30px;
      right: 50px;
      font-size: 14px;
      color: #4a5568;
    }
    .shares-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 30px 0;
    }
    .shares-box {
      background: #1a365d;
      color: white;
      padding: 20px 40px;
      text-align: center;
      border-radius: 5px;
    }
    .shares-number {
      font-size: 36px;
      font-weight: bold;
    }
    .shares-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .main-text {
      text-align: center;
      font-size: 16px;
      line-height: 2;
      margin: 30px 50px;
    }
    .shareholder-name {
      font-size: 24px;
      font-weight: bold;
      color: #1a365d;
      border-bottom: 1px solid #1a365d;
      display: inline-block;
      padding: 0 20px;
    }
    .share-class {
      font-weight: bold;
      color: #2d3748;
    }
    .details {
      display: flex;
      justify-content: space-around;
      margin: 40px 0;
      font-size: 14px;
    }
    .detail-item {
      text-align: center;
    }
    .detail-label {
      color: #718096;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 1px;
    }
    .detail-value {
      font-weight: bold;
      color: #2d3748;
      margin-top: 5px;
    }
    .signatures {
      display: flex;
      justify-content: space-around;
      margin-top: 50px;
    }
    .signature-line {
      width: 200px;
      text-align: center;
    }
    .signature-line hr {
      border: none;
      border-top: 1px solid #1a365d;
      margin-bottom: 5px;
    }
    .signature-title {
      font-size: 12px;
      color: #4a5568;
    }
    .restriction-legend {
      margin-top: 30px;
      padding: 15px;
      border: 2px solid #c53030;
      background: #fff5f5;
      font-size: 10px;
    }
    .restriction-legend h4 {
      color: #c53030;
      margin: 0 0 10px 0;
      text-align: center;
    }
    .restriction-legend p {
      margin: 0;
      line-height: 1.5;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 120px;
      color: rgba(26, 54, 93, 0.05);
      font-weight: bold;
      pointer-events: none;
      z-index: 0;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="watermark">${data.companyTicker || 'STOCK'}</div>
    <div class="certificate-number">Certificate No. ${data.certificateNumber}</div>
    
    <div class="header">
      <div class="company-name">${data.companyName}</div>
      ${data.companyTicker ? `<div class="ticker">${data.companyTicker}</div>` : ''}
      <div class="title">STOCK CERTIFICATE</div>
    </div>
    
    <div class="shares-section">
      <div class="shares-box">
        <div class="shares-number">${formattedShares}</div>
        <div class="shares-label">Shares</div>
      </div>
      <div style="flex: 1; text-align: center;">
        <div class="share-class">${data.shareClassName}</div>
        <div style="font-size: 12px; color: #718096;">Par Value: $${data.parValue}</div>
      </div>
      <div class="shares-box">
        <div class="shares-number">${formattedShares}</div>
        <div class="shares-label">Shares</div>
      </div>
    </div>
    
    <div class="main-text">
      This certifies that<br>
      <span class="shareholder-name">${data.shareholderName}</span><br>
      is the registered holder of<br>
      <strong>${formattedShares}</strong> shares of <span class="share-class">${data.shareClassName}</span><br>
      of <strong>${data.companyName}</strong><br>
      transferable only on the books of the Corporation by the holder hereof in person or by duly authorized attorney upon surrender of this Certificate properly endorsed.
    </div>
    
    <div class="details">
      <div class="detail-item">
        <div class="detail-label">Issue Date</div>
        <div class="detail-value">${data.issueDate}</div>
      </div>
      ${data.cusip ? `
      <div class="detail-item">
        <div class="detail-label">CUSIP</div>
        <div class="detail-value">${data.cusip}</div>
      </div>
      ` : ''}
      <div class="detail-item">
        <div class="detail-label">Shareholder Address</div>
        <div class="detail-value">${data.shareholderAddress}</div>
      </div>
    </div>
    
    <div class="signatures">
      <div class="signature-line">
        <hr>
        <div class="signature-title">Corporate Secretary</div>
      </div>
      <div class="signature-line">
        <hr>
        <div class="signature-title">Chief Executive Officer</div>
      </div>
    </div>
    
    ${restrictionText}
  </div>
</body>
</html>
`;
}

/**
 * Generate HTML for 1099-DIV form
 */
export function generate1099DivHTML(data: Form1099DivData): string {
  const formatCurrency = (amount: number) => amount.toFixed(2);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Form 1099-DIV ${data.taxYear}</title>
  <style>
    @page {
      size: 8.5in 11in;
      margin: 0.5in;
    }
    body {
      font-family: 'Courier New', monospace;
      font-size: 10px;
      margin: 0;
      padding: 20px;
    }
    .form-container {
      border: 2px solid #000;
      padding: 10px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .form-title {
      font-size: 14px;
      font-weight: bold;
    }
    .tax-year {
      font-size: 24px;
      font-weight: bold;
      color: #c00;
    }
    .form-number {
      font-size: 12px;
      font-weight: bold;
    }
    .section {
      display: flex;
      margin-bottom: 10px;
    }
    .payer-section, .recipient-section {
      flex: 1;
      border: 1px solid #000;
      padding: 10px;
      margin-right: 10px;
    }
    .recipient-section {
      margin-right: 0;
    }
    .section-title {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 8px;
      margin-bottom: 5px;
    }
    .field {
      margin-bottom: 5px;
    }
    .field-label {
      font-size: 8px;
      color: #666;
    }
    .field-value {
      font-weight: bold;
    }
    .amounts-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 5px;
      border: 1px solid #000;
      padding: 10px;
    }
    .amount-box {
      border: 1px solid #ccc;
      padding: 5px;
      text-align: right;
    }
    .amount-label {
      font-size: 7px;
      color: #666;
      text-align: left;
    }
    .amount-value {
      font-size: 12px;
      font-weight: bold;
    }
    .box-number {
      font-size: 8px;
      font-weight: bold;
      color: #000;
    }
    .footer {
      margin-top: 10px;
      font-size: 8px;
      text-align: center;
      color: #666;
    }
    .copy-label {
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 10px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="form-container">
    <div class="header">
      <div>
        <div class="form-number">Form 1099-DIV</div>
        <div style="font-size: 8px;">Department of the Treasury - Internal Revenue Service</div>
      </div>
      <div style="text-align: center;">
        <div class="tax-year">${data.taxYear}</div>
        <div class="form-title">Dividends and Distributions</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 8px;">Copy B</div>
        <div style="font-size: 8px;">For Recipient</div>
        <div style="font-size: 8px;">OMB No. 1545-0110</div>
      </div>
    </div>
    
    <div class="section">
      <div class="payer-section">
        <div class="section-title">Payer's Information</div>
        <div class="field">
          <div class="field-label">PAYER'S name, street address, city or town, state or province, country, ZIP or foreign postal code</div>
          <div class="field-value">${data.payerName}<br>${data.payerAddress}</div>
        </div>
        <div class="field">
          <div class="field-label">PAYER'S TIN</div>
          <div class="field-value">${data.payerTIN}</div>
        </div>
      </div>
      <div class="recipient-section">
        <div class="section-title">Recipient's Information</div>
        <div class="field">
          <div class="field-label">RECIPIENT'S name</div>
          <div class="field-value">${data.recipientName}</div>
        </div>
        <div class="field">
          <div class="field-label">Street address (including apt. no.)</div>
          <div class="field-value">${data.recipientAddress}</div>
        </div>
        <div class="field">
          <div class="field-label">RECIPIENT'S TIN</div>
          <div class="field-value">${data.recipientTIN}</div>
        </div>
      </div>
    </div>
    
    <div class="amounts-grid">
      <div class="amount-box">
        <div class="box-number">1a</div>
        <div class="amount-label">Total ordinary dividends</div>
        <div class="amount-value">$${formatCurrency(data.totalOrdinaryDividends)}</div>
      </div>
      <div class="amount-box">
        <div class="box-number">1b</div>
        <div class="amount-label">Qualified dividends</div>
        <div class="amount-value">$${formatCurrency(data.qualifiedDividends)}</div>
      </div>
      <div class="amount-box">
        <div class="box-number">2a</div>
        <div class="amount-label">Total capital gain distr.</div>
        <div class="amount-value">$${formatCurrency(data.totalCapitalGainDistribution)}</div>
      </div>
      <div class="amount-box">
        <div class="box-number">2b</div>
        <div class="amount-label">Unrecap. Sec. 1250 gain</div>
        <div class="amount-value">$${formatCurrency(data.unrecaptured1250Gain)}</div>
      </div>
      <div class="amount-box">
        <div class="box-number">2c</div>
        <div class="amount-label">Section 1202 gain</div>
        <div class="amount-value">$${formatCurrency(data.section1202Gain)}</div>
      </div>
      <div class="amount-box">
        <div class="box-number">2d</div>
        <div class="amount-label">Collectibles (28%) gain</div>
        <div class="amount-value">$${formatCurrency(data.collectiblesGain)}</div>
      </div>
      <div class="amount-box">
        <div class="box-number">3</div>
        <div class="amount-label">Nondividend distributions</div>
        <div class="amount-value">$${formatCurrency(data.nondividendDistributions)}</div>
      </div>
      <div class="amount-box">
        <div class="box-number">4</div>
        <div class="amount-label">Federal income tax withheld</div>
        <div class="amount-value">$${formatCurrency(data.federalIncomeTaxWithheld)}</div>
      </div>
      <div class="amount-box">
        <div class="box-number">5</div>
        <div class="amount-label">Section 199A dividends</div>
        <div class="amount-value">$${formatCurrency(data.section199ADividends)}</div>
      </div>
      <div class="amount-box">
        <div class="box-number">6</div>
        <div class="amount-label">Investment expenses</div>
        <div class="amount-value">$${formatCurrency(data.investmentExpenses)}</div>
      </div>
      <div class="amount-box">
        <div class="box-number">7</div>
        <div class="amount-label">Foreign tax paid</div>
        <div class="amount-value">$${formatCurrency(data.foreignTaxPaid)}</div>
      </div>
      <div class="amount-box">
        <div class="box-number">8</div>
        <div class="amount-label">Foreign country or U.S. possession</div>
        <div class="amount-value">${data.foreignCountry || 'N/A'}</div>
      </div>
      <div class="amount-box">
        <div class="box-number">9</div>
        <div class="amount-label">Cash liquidation distributions</div>
        <div class="amount-value">$${formatCurrency(data.cashLiquidationDistributions)}</div>
      </div>
      <div class="amount-box">
        <div class="box-number">10</div>
        <div class="amount-label">Noncash liquidation distributions</div>
        <div class="amount-value">$${formatCurrency(data.noncashLiquidationDistributions)}</div>
      </div>
      <div class="amount-box">
        <div class="box-number">12</div>
        <div class="amount-label">Exempt-interest dividends</div>
        <div class="amount-value">$${formatCurrency(data.exemptInterestDividends)}</div>
      </div>
      <div class="amount-box">
        <div class="box-number">13</div>
        <div class="amount-label">Specified private activity bond interest dividends</div>
        <div class="amount-value">$${formatCurrency(data.specifiedPrivateActivityBondInterest)}</div>
      </div>
      <div class="amount-box">
        <div class="box-number">15</div>
        <div class="amount-label">State/Payer's state no.</div>
        <div class="amount-value">${data.stateId || 'N/A'}</div>
      </div>
      <div class="amount-box">
        <div class="box-number">16</div>
        <div class="amount-label">State tax withheld</div>
        <div class="amount-value">$${formatCurrency(data.stateTaxWithheld)}</div>
      </div>
    </div>
    
    <div class="footer">
      <p>This is important tax information and is being furnished to the IRS. If you are required to file a return, a negligence penalty or other sanction may be imposed on you if this income is taxable and the IRS determines that it has not been reported.</p>
      <p>Form 1099-DIV (Rev. 1-${data.taxYear}) Cat. No. 14415N</p>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Generate HTML for 1099-B form
 */
export function generate1099BHTML(data: Form1099BData): string {
  const formatCurrency = (amount: number) => amount.toFixed(2);
  
  const transactionRows = data.transactions.map((t, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${t.description}</td>
      <td>${t.dateAcquired}</td>
      <td>${t.dateSold}</td>
      <td style="text-align: right;">$${formatCurrency(t.proceeds)}</td>
      <td style="text-align: right;">$${formatCurrency(t.costBasis)}</td>
      <td style="text-align: right;">$${formatCurrency(t.shortTermGainLoss)}</td>
      <td style="text-align: right;">$${formatCurrency(t.longTermGainLoss)}</td>
    </tr>
  `).join('');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Form 1099-B ${data.taxYear}</title>
  <style>
    @page {
      size: 8.5in 11in;
      margin: 0.5in;
    }
    body {
      font-family: 'Courier New', monospace;
      font-size: 10px;
      margin: 0;
      padding: 20px;
    }
    .form-container {
      border: 2px solid #000;
      padding: 10px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .form-title {
      font-size: 14px;
      font-weight: bold;
    }
    .tax-year {
      font-size: 24px;
      font-weight: bold;
      color: #c00;
    }
    .section {
      display: flex;
      margin-bottom: 10px;
    }
    .payer-section, .recipient-section {
      flex: 1;
      border: 1px solid #000;
      padding: 10px;
      margin-right: 10px;
    }
    .recipient-section {
      margin-right: 0;
    }
    .section-title {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 8px;
      margin-bottom: 5px;
    }
    .field {
      margin-bottom: 5px;
    }
    .field-label {
      font-size: 8px;
      color: #666;
    }
    .field-value {
      font-weight: bold;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 9px;
    }
    th, td {
      border: 1px solid #000;
      padding: 5px;
      text-align: left;
    }
    th {
      background: #f0f0f0;
      font-size: 8px;
    }
    .totals {
      margin-top: 10px;
      display: flex;
      justify-content: flex-end;
      gap: 20px;
    }
    .total-box {
      border: 1px solid #000;
      padding: 10px;
      text-align: right;
    }
    .total-label {
      font-size: 8px;
      color: #666;
    }
    .total-value {
      font-size: 14px;
      font-weight: bold;
    }
    .footer {
      margin-top: 10px;
      font-size: 8px;
      text-align: center;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="form-container">
    <div class="header">
      <div>
        <div style="font-size: 12px; font-weight: bold;">Form 1099-B</div>
        <div style="font-size: 8px;">Department of the Treasury - Internal Revenue Service</div>
      </div>
      <div style="text-align: center;">
        <div class="tax-year">${data.taxYear}</div>
        <div class="form-title">Proceeds From Broker and Barter Exchange Transactions</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 8px;">Copy B</div>
        <div style="font-size: 8px;">For Recipient</div>
        <div style="font-size: 8px;">OMB No. 1545-0715</div>
      </div>
    </div>
    
    <div class="section">
      <div class="payer-section">
        <div class="section-title">Payer's Information</div>
        <div class="field">
          <div class="field-label">PAYER'S name, street address, city or town, state or province, country, ZIP</div>
          <div class="field-value">${data.payerName}<br>${data.payerAddress}</div>
        </div>
        <div class="field">
          <div class="field-label">PAYER'S TIN</div>
          <div class="field-value">${data.payerTIN}</div>
        </div>
      </div>
      <div class="recipient-section">
        <div class="section-title">Recipient's Information</div>
        <div class="field">
          <div class="field-label">RECIPIENT'S name</div>
          <div class="field-value">${data.recipientName}</div>
        </div>
        <div class="field">
          <div class="field-label">Street address</div>
          <div class="field-value">${data.recipientAddress}</div>
        </div>
        <div class="field">
          <div class="field-label">RECIPIENT'S TIN</div>
          <div class="field-value">${data.recipientTIN}</div>
        </div>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Description of Property</th>
          <th>Date Acquired</th>
          <th>Date Sold</th>
          <th>Proceeds</th>
          <th>Cost Basis</th>
          <th>Short-term Gain/Loss</th>
          <th>Long-term Gain/Loss</th>
        </tr>
      </thead>
      <tbody>
        ${transactionRows}
      </tbody>
    </table>
    
    <div class="totals">
      <div class="total-box">
        <div class="total-label">Total Proceeds</div>
        <div class="total-value">$${formatCurrency(data.totalProceeds)}</div>
      </div>
      <div class="total-box">
        <div class="total-label">Total Cost Basis</div>
        <div class="total-value">$${formatCurrency(data.totalCostBasis)}</div>
      </div>
      <div class="total-box">
        <div class="total-label">Federal Tax Withheld</div>
        <div class="total-value">$${formatCurrency(data.totalFederalWithheld)}</div>
      </div>
    </div>
    
    <div class="footer">
      <p>This is important tax information and is being furnished to the IRS. If you are required to file a return, a negligence penalty or other sanction may be imposed on you if this income is taxable and the IRS determines that it has not been reported.</p>
      <p>Form 1099-B (Rev. 1-${data.taxYear}) Cat. No. 14411V</p>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Get certificate data from database
 */
export async function getCertificateData(certificateId: number): Promise<CertificateData | null> {
  const database = await getDb();
  if (!database) return null;
  
  const result = await database
    .select({
      certificateNumber: certificates.certificateNumber,
      shares: certificates.shares,
      issueDate: certificates.issueDate,
      shareholderName: shareholders.name,
      shareholderAddress: shareholders.address1,
      shareholderCity: shareholders.city,
      shareholderState: shareholders.state,
      shareholderPostalCode: shareholders.postalCode,
      shareClassName: shareClasses.name,
      parValue: shareClasses.parValue,
      isRestricted: shareClasses.isRestricted,
      companyName: companies.name,
      companyTicker: companies.ticker,
    })
    .from(certificates)
    .innerJoin(shareholders, eq(certificates.shareholderId, shareholders.id))
    .innerJoin(shareClasses, eq(certificates.shareClassId, shareClasses.id))
    .innerJoin(companies, eq(shareClasses.companyId, companies.id))
    .where(eq(certificates.id, certificateId))
    .limit(1);
  
  if (result.length === 0) return null;
  
  const cert = result[0];
  return {
    certificateNumber: cert.certificateNumber,
    companyName: cert.companyName,
    companyTicker: cert.companyTicker || '',
    shareholderName: cert.shareholderName || 'Unknown',
    shareholderAddress: `${cert.shareholderCity || ''}, ${cert.shareholderState || ''} ${cert.shareholderPostalCode || ''}`,
    shareClassName: cert.shareClassName,
    shares: cert.shares,
    issueDate: cert.issueDate || new Date().toISOString().split('T')[0],
    parValue: cert.parValue || '0.0001',
    isRestricted: cert.isRestricted || false,
  };
}

/**
 * Get 1099-DIV data for a shareholder
 */
export async function get1099DivData(shareholderId: number, taxYear: number): Promise<Form1099DivData | null> {
  const database = await getDb();
  if (!database) return null;
  
  // Get shareholder info
  const shareholderResult = await database
    .select()
    .from(shareholders)
    .where(eq(shareholders.id, shareholderId))
    .limit(1);
  
  if (shareholderResult.length === 0) return null;
  const shareholder = shareholderResult[0];
  
  // Get company info
  const companyResult = await database
    .select()
    .from(companies)
    .where(eq(companies.id, shareholder.companyId))
    .limit(1);
  
  if (companyResult.length === 0) return null;
  const company = companyResult[0];
  
  // Get dividend payments for the year
  const dividendResult = await database
    .select({
      grossAmount: dividends.grossAmount,
      withholdingTax: dividends.withholdingTax,
      netAmount: dividends.netAmount,
    })
    .from(dividends)
    .where(eq(dividends.shareholderId, shareholderId));
  
  const totalDividends = dividendResult.reduce((sum, d) => sum + parseFloat(d.grossAmount || '0'), 0);
  const totalWithheld = dividendResult.reduce((sum, d) => sum + parseFloat(d.withholdingTax || '0'), 0);
  
  return {
    taxYear,
    payerName: company.name,
    payerTIN: company.cik || '00-0000000',
    payerAddress: `${company.incorporationState || 'Delaware'}`,
    recipientName: shareholder.name || 'Unknown',
    recipientTIN: shareholder.taxId || '000-00-0000',
    recipientAddress: `${shareholder.address1 || ''}, ${shareholder.city || ''}, ${shareholder.state || ''} ${shareholder.postalCode || ''}`,
    totalOrdinaryDividends: totalDividends,
    qualifiedDividends: totalDividends * 0.8, // Assume 80% qualified
    totalCapitalGainDistribution: 0,
    unrecaptured1250Gain: 0,
    section1202Gain: 0,
    collectiblesGain: 0,
    nondividendDistributions: 0,
    federalIncomeTaxWithheld: totalWithheld,
    section199ADividends: 0,
    investmentExpenses: 0,
    foreignTaxPaid: 0,
    foreignCountry: '',
    cashLiquidationDistributions: 0,
    noncashLiquidationDistributions: 0,
    exemptInterestDividends: 0,
    specifiedPrivateActivityBondInterest: 0,
    stateId: shareholder.state || '',
    stateTaxWithheld: 0,
  };
}
