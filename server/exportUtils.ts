/**
 * CSV Export Utilities
 * Generates CSV files for shareholders, transactions, holdings, and certificates
 */

// Helper to escape CSV values
export function escapeCSV(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  // If the value contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Helper to format date for CSV
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

// Helper to format currency
export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toFixed(2);
}

export interface ShareholderExportRow {
  id: number;
  accountNumber: string | null;
  name: string;
  type: string | null;
  status: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  taxId: string | null;
  createdAt: Date;
}

export function generateShareholdersCSV(shareholders: ShareholderExportRow[]): string {
  const headers = [
    'ID',
    'Account Number',
    'Name',
    'Type',
    'Status',
    'Email',
    'Phone',
    'Address',
    'City',
    'State',
    'Zip Code',
    'Country',
    'Tax ID',
    'Created Date'
  ];

  const rows = shareholders.map(s => [
    escapeCSV(s.id),
    escapeCSV(s.accountNumber),
    escapeCSV(s.name),
    escapeCSV(s.type),
    escapeCSV(s.status),
    escapeCSV(s.email),
    escapeCSV(s.phone),
    escapeCSV(s.address),
    escapeCSV(s.city),
    escapeCSV(s.state),
    escapeCSV(s.zipCode),
    escapeCSV(s.country),
    escapeCSV(s.taxId),
    escapeCSV(formatDate(s.createdAt))
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

export interface TransactionExportRow {
  id: number;
  transactionNumber: string | null;
  type: string | null;
  status: string | null;
  fromShareholderId: number | null;
  toShareholderId: number | null;
  shareClassId: number | null;
  shares: number | string | null;
  pricePerShare: number | string | null;
  totalValue: number | string | null;
  transactionDate: string | null;
  settlementDate: string | null;
  notes: string | null;
  createdAt: Date;
}

export function generateTransactionsCSV(transactions: TransactionExportRow[]): string {
  const headers = [
    'ID',
    'Transaction Number',
    'Type',
    'Status',
    'From Shareholder ID',
    'To Shareholder ID',
    'Share Class ID',
    'Shares',
    'Price Per Share',
    'Total Value',
    'Transaction Date',
    'Settlement Date',
    'Notes',
    'Created Date'
  ];

  const rows = transactions.map(t => [
    escapeCSV(t.id),
    escapeCSV(t.transactionNumber),
    escapeCSV(t.type),
    escapeCSV(t.status),
    escapeCSV(t.fromShareholderId),
    escapeCSV(t.toShareholderId),
    escapeCSV(t.shareClassId),
    escapeCSV(t.shares),
    escapeCSV(formatCurrency(t.pricePerShare)),
    escapeCSV(formatCurrency(t.totalValue)),
    escapeCSV(t.transactionDate),
    escapeCSV(t.settlementDate),
    escapeCSV(t.notes),
    escapeCSV(formatDate(t.createdAt))
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

export interface HoldingExportRow {
  id: number;
  shareholderId: number;
  shareClassId: number | null;
  shares: number | string;
  costBasis: number | string | null;
  acquisitionDate: string | null;
  certificateNumber: string | null;
  isRestricted: boolean | number | null;
  restrictionType: string | null;
  createdAt: Date;
}

export function generateHoldingsCSV(holdings: HoldingExportRow[]): string {
  const headers = [
    'ID',
    'Shareholder ID',
    'Share Class ID',
    'Shares',
    'Cost Basis',
    'Acquisition Date',
    'Certificate Number',
    'Is Restricted',
    'Restriction Type',
    'Created Date'
  ];

  const rows = holdings.map(h => [
    escapeCSV(h.id),
    escapeCSV(h.shareholderId),
    escapeCSV(h.shareClassId),
    escapeCSV(h.shares),
    escapeCSV(formatCurrency(h.costBasis)),
    escapeCSV(h.acquisitionDate),
    escapeCSV(h.certificateNumber),
    escapeCSV(h.isRestricted ? 'Yes' : 'No'),
    escapeCSV(h.restrictionType),
    escapeCSV(formatDate(h.createdAt))
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

export interface CertificateExportRow {
  id: number;
  certificateNumber: string;
  shareholderId: number;
  shareClassId: number | null;
  shares: number | string;
  issueDate: string | null;
  status: string | null;
  cancelDate: string | null;
  cancelReason: string | null;
  replacementCertId: number | null;
  createdAt: Date;
}

export function generateCertificatesCSV(certificates: CertificateExportRow[]): string {
  const headers = [
    'ID',
    'Certificate Number',
    'Shareholder ID',
    'Share Class ID',
    'Shares',
    'Issue Date',
    'Status',
    'Cancel Date',
    'Cancel Reason',
    'Replacement Cert ID',
    'Created Date'
  ];

  const rows = certificates.map(c => [
    escapeCSV(c.id),
    escapeCSV(c.certificateNumber),
    escapeCSV(c.shareholderId),
    escapeCSV(c.shareClassId),
    escapeCSV(c.shares),
    escapeCSV(c.issueDate),
    escapeCSV(c.status),
    escapeCSV(c.cancelDate),
    escapeCSV(c.cancelReason),
    escapeCSV(c.replacementCertId),
    escapeCSV(formatDate(c.createdAt))
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

// Excel-compatible CSV with BOM for proper UTF-8 encoding
export function addBOM(csv: string): string {
  return '\uFEFF' + csv;
}
