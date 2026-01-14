/**
 * Database Seeding Script for Stock Transfer Platform
 * Run with: node scripts/seed.mjs
 */

import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import { nanoid } from 'nanoid';

config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function seed() {
  console.log('🌱 Starting database seeding...\n');
  
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    // ============================================
    // SEED COMPANIES
    // ============================================
    console.log('📊 Seeding companies...');
    
    const companies = [
      { name: 'TechVenture Holdings Inc.', ticker: 'TVHI', cik: '0001234567', incorporationState: 'Delaware', incorporationDate: '2015-03-15', fiscalYearEnd: '12/31', status: 'active' },
      { name: 'Global Manufacturing Corp.', ticker: 'GMC', cik: '0002345678', incorporationState: 'Nevada', incorporationDate: '2008-07-22', fiscalYearEnd: '12/31', status: 'active' },
      { name: 'BioHealth Innovations Ltd.', ticker: 'BHIL', cik: '0003456789', incorporationState: 'California', incorporationDate: '2019-11-01', fiscalYearEnd: '06/30', status: 'active' }
    ];
    
    for (const c of companies) {
      await connection.execute(
        `INSERT INTO companies (name, ticker, cik, incorporationState, incorporationDate, fiscalYearEnd, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [c.name, c.ticker, c.cik, c.incorporationState, c.incorporationDate, c.fiscalYearEnd, c.status]
      );
    }
    console.log(`   ✓ Created ${companies.length} companies\n`);
    
    // Get company IDs
    const [companyRows] = await connection.execute('SELECT id, name FROM companies');
    const companyMap = {};
    companyRows.forEach(c => companyMap[c.name] = c.id);
    
    // ============================================
    // SEED SHARE CLASSES
    // ============================================
    console.log('📈 Seeding share classes...');
    
    const shareClasses = [
      { companyId: companyMap['TechVenture Holdings Inc.'], name: 'Common Stock', symbol: 'TVHI', authorizedShares: 100000000, issuedShares: 45000000, outstandingShares: 42000000, treasuryShares: 3000000, parValue: '0.0001', votingRights: true, isPreferred: false },
      { companyId: companyMap['TechVenture Holdings Inc.'], name: 'Series A Preferred', symbol: 'TVHI.PA', authorizedShares: 10000000, issuedShares: 5000000, outstandingShares: 5000000, treasuryShares: 0, parValue: '0.001', votingRights: true, isPreferred: true },
      { companyId: companyMap['Global Manufacturing Corp.'], name: 'Common Stock', symbol: 'GMC', authorizedShares: 500000000, issuedShares: 250000000, outstandingShares: 235000000, treasuryShares: 15000000, parValue: '0.01', votingRights: true, isPreferred: false },
      { companyId: companyMap['BioHealth Innovations Ltd.'], name: 'Common Stock', symbol: 'BHIL', authorizedShares: 50000000, issuedShares: 12000000, outstandingShares: 11500000, treasuryShares: 500000, parValue: '0.0001', votingRights: true, isPreferred: false },
      { companyId: companyMap['BioHealth Innovations Ltd.'], name: 'Series B Preferred', symbol: 'BHIL.PB', authorizedShares: 5000000, issuedShares: 2000000, outstandingShares: 2000000, treasuryShares: 0, parValue: '1.00', votingRights: false, isPreferred: true },
    ];
    
    for (const sc of shareClasses) {
      await connection.execute(
        `INSERT INTO share_classes (companyId, name, symbol, authorizedShares, issuedShares, outstandingShares, treasuryShares, parValue, votingRights, isPreferred) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [sc.companyId, sc.name, sc.symbol, sc.authorizedShares, sc.issuedShares, sc.outstandingShares, sc.treasuryShares, sc.parValue, sc.votingRights, sc.isPreferred]
      );
    }
    console.log(`   ✓ Created ${shareClasses.length} share classes\n`);
    
    // Get share class IDs
    const [scRows] = await connection.execute('SELECT id, companyId FROM share_classes ORDER BY id');
    
    // ============================================
    // SEED SHAREHOLDERS
    // ============================================
    console.log('👥 Seeding shareholders...');
    
    const shareholders = [
      { companyId: companyMap['TechVenture Holdings Inc.'], accountNumber: `SH-${nanoid(8)}`, name: 'Sequoia Capital Partners', type: 'corporation', taxId: '94-1234567', taxIdType: 'ein', email: 'investor.relations@sequoia.com', phone: '+1-650-854-3927', address1: '3000 Sand Hill Road', city: 'Menlo Park', state: 'CA', postalCode: '94025', country: 'USA', isInsider: false, isAffiliate: false },
      { companyId: companyMap['TechVenture Holdings Inc.'], accountNumber: `SH-${nanoid(8)}`, name: 'John Mitchell', type: 'individual', taxId: '123-45-6789', taxIdType: 'ssn', email: 'john.mitchell@email.com', phone: '+1-415-555-0101', address1: '456 Market Street', city: 'San Francisco', state: 'CA', postalCode: '94105', country: 'USA', isInsider: true, isAffiliate: true },
      { companyId: companyMap['TechVenture Holdings Inc.'], accountNumber: `SH-${nanoid(8)}`, name: 'Sarah Chen', type: 'individual', taxId: '234-56-7890', taxIdType: 'ssn', email: 'sarah.chen@email.com', phone: '+1-408-555-0202', address1: '789 Innovation Way', city: 'Palo Alto', state: 'CA', postalCode: '94301', country: 'USA', isInsider: false, isAffiliate: false },
      { companyId: companyMap['TechVenture Holdings Inc.'], accountNumber: `SH-${nanoid(8)}`, name: 'BlackRock Fund Advisors', type: 'corporation', taxId: '13-2345678', taxIdType: 'ein', email: 'funds@blackrock.com', phone: '+1-212-810-5300', address1: '55 East 52nd Street', city: 'New York', state: 'NY', postalCode: '10055', country: 'USA', isInsider: false, isAffiliate: false },
      { companyId: companyMap['TechVenture Holdings Inc.'], accountNumber: `SH-${nanoid(8)}`, name: 'Employee Stock Trust', type: 'trust', taxId: '45-6789012', taxIdType: 'ein', email: 'esop@techventure.com', phone: '+1-650-555-0303', address1: '100 Tech Campus Drive', city: 'Mountain View', state: 'CA', postalCode: '94043', country: 'USA', isInsider: false, isAffiliate: false },
      { companyId: companyMap['Global Manufacturing Corp.'], accountNumber: `SH-${nanoid(8)}`, name: 'Vanguard Group Inc.', type: 'corporation', taxId: '23-1945930', taxIdType: 'ein', email: 'institutional@vanguard.com', phone: '+1-610-669-1000', address1: '100 Vanguard Blvd', city: 'Malvern', state: 'PA', postalCode: '19355', country: 'USA', isInsider: false, isAffiliate: false },
      { companyId: companyMap['Global Manufacturing Corp.'], accountNumber: `SH-${nanoid(8)}`, name: 'Robert Williams', type: 'individual', taxId: '345-67-8901', taxIdType: 'ssn', email: 'rwilliams@email.com', phone: '+1-702-555-0404', address1: '321 Industrial Blvd', city: 'Las Vegas', state: 'NV', postalCode: '89101', country: 'USA', isInsider: true, isAffiliate: true },
      { companyId: companyMap['Global Manufacturing Corp.'], accountNumber: `SH-${nanoid(8)}`, name: 'Manufacturing Workers Pension Fund', type: 'trust', taxId: '56-7890123', taxIdType: 'ein', email: 'pension@mwpf.org', phone: '+1-313-555-0505', address1: '500 Labor Way', city: 'Detroit', state: 'MI', postalCode: '48201', country: 'USA', isInsider: false, isAffiliate: false },
      { companyId: companyMap['BioHealth Innovations Ltd.'], accountNumber: `SH-${nanoid(8)}`, name: 'Andreessen Horowitz Bio Fund', type: 'corporation', taxId: '94-3456789', taxIdType: 'ein', email: 'bio@a16z.com', phone: '+1-650-321-8000', address1: '2865 Sand Hill Road', city: 'Menlo Park', state: 'CA', postalCode: '94025', country: 'USA', isInsider: false, isAffiliate: false },
      { companyId: companyMap['BioHealth Innovations Ltd.'], accountNumber: `SH-${nanoid(8)}`, name: 'Dr. Emily Watson', type: 'individual', taxId: '456-78-9012', taxIdType: 'ssn', email: 'emily.watson@biohealth.com', phone: '+1-858-555-0606', address1: '9500 Gilman Drive', city: 'La Jolla', state: 'CA', postalCode: '92093', country: 'USA', isInsider: true, isAffiliate: true },
      { companyId: companyMap['BioHealth Innovations Ltd.'], accountNumber: `SH-${nanoid(8)}`, name: 'Healthcare Innovation Trust', type: 'trust', taxId: '67-8901234', taxIdType: 'ein', email: 'trust@healthcareinnovation.org', phone: '+1-617-555-0707', address1: '200 Longwood Ave', city: 'Boston', state: 'MA', postalCode: '02115', country: 'USA', isInsider: false, isAffiliate: false },
    ];
    
    for (const sh of shareholders) {
      await connection.execute(
        `INSERT INTO shareholders (companyId, accountNumber, name, type, taxId, taxIdType, email, phone, address1, city, state, postalCode, country, isInsider, isAffiliate) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [sh.companyId, sh.accountNumber, sh.name, sh.type, sh.taxId, sh.taxIdType, sh.email, sh.phone, sh.address1, sh.city, sh.state, sh.postalCode, sh.country, sh.isInsider, sh.isAffiliate]
      );
    }
    console.log(`   ✓ Created ${shareholders.length} shareholders\n`);
    
    // Get shareholder IDs
    const [shRows] = await connection.execute('SELECT id, companyId, name FROM shareholders ORDER BY id');
    const shareholderMap = {};
    shRows.forEach(sh => shareholderMap[`${sh.companyId}-${sh.name}`] = sh.id);
    
    // ============================================
    // SEED HOLDINGS
    // ============================================
    console.log('💰 Seeding holdings...');
    
    const holdings = [
      { shareholderId: shRows[0]?.id, shareClassId: scRows[0].id, shares: 8500000, costBasis: '0.10', acquisitionDate: '2015-03-15', holdingType: 'book_entry', isRestricted: false, restrictionType: 'none' },
      { shareholderId: shRows[1]?.id, shareClassId: scRows[0].id, shares: 2500000, costBasis: '0.10', acquisitionDate: '2016-06-01', holdingType: 'book_entry', isRestricted: true, restrictionType: 'rule_144', restrictionEndDate: '2025-06-01' },
      { shareholderId: shRows[2]?.id, shareClassId: scRows[0].id, shares: 50000, costBasis: '2.50', acquisitionDate: '2022-01-15', holdingType: 'book_entry', isRestricted: false, restrictionType: 'none' },
      { shareholderId: shRows[3]?.id, shareClassId: scRows[0].id, shares: 15000000, costBasis: '3.00', acquisitionDate: '2020-09-01', holdingType: 'dtc', isRestricted: false, restrictionType: 'none' },
      { shareholderId: shRows[4]?.id, shareClassId: scRows[0].id, shares: 3000000, costBasis: '1.00', acquisitionDate: '2018-01-01', holdingType: 'book_entry', isRestricted: true, restrictionType: 'legend' },
      { shareholderId: shRows[0]?.id, shareClassId: scRows[1].id, shares: 3000000, costBasis: '5.00', acquisitionDate: '2017-04-01', holdingType: 'book_entry', isRestricted: false, restrictionType: 'none' },
      { shareholderId: shRows[3]?.id, shareClassId: scRows[1].id, shares: 2000000, costBasis: '5.00', acquisitionDate: '2019-08-15', holdingType: 'dtc', isRestricted: false, restrictionType: 'none' },
      { shareholderId: shRows[5]?.id, shareClassId: scRows[2].id, shares: 50000000, costBasis: '15.00', acquisitionDate: '2010-01-01', holdingType: 'dtc', isRestricted: false, restrictionType: 'none' },
      { shareholderId: shRows[6]?.id, shareClassId: scRows[2].id, shares: 5000000, costBasis: '15.00', acquisitionDate: '2008-07-22', holdingType: 'book_entry', isRestricted: true, restrictionType: 'rule_144', restrictionEndDate: '2024-07-22' },
      { shareholderId: shRows[7]?.id, shareClassId: scRows[2].id, shares: 25000000, costBasis: '20.00', acquisitionDate: '2015-06-01', holdingType: 'dtc', isRestricted: false, restrictionType: 'none' },
      { shareholderId: shRows[8]?.id, shareClassId: scRows[3].id, shares: 4000000, costBasis: '10.00', acquisitionDate: '2020-03-01', holdingType: 'book_entry', isRestricted: false, restrictionType: 'none' },
      { shareholderId: shRows[9]?.id, shareClassId: scRows[3].id, shares: 1500000, costBasis: '1.00', acquisitionDate: '2019-11-01', holdingType: 'book_entry', isRestricted: true, restrictionType: 'rule_144', restrictionEndDate: '2025-11-01' },
      { shareholderId: shRows[10]?.id, shareClassId: scRows[3].id, shares: 2000000, costBasis: '15.00', acquisitionDate: '2021-09-15', holdingType: 'book_entry', isRestricted: false, restrictionType: 'none' },
      { shareholderId: shRows[8]?.id, shareClassId: scRows[4].id, shares: 1500000, costBasis: '25.00', acquisitionDate: '2022-06-01', holdingType: 'book_entry', isRestricted: false, restrictionType: 'none' },
      { shareholderId: shRows[10]?.id, shareClassId: scRows[4].id, shares: 500000, costBasis: '25.00', acquisitionDate: '2022-06-01', holdingType: 'book_entry', isRestricted: false, restrictionType: 'none' },
    ];
    
    for (const h of holdings) {
      if (!h.shareholderId) continue;
      await connection.execute(
        `INSERT INTO holdings (shareholderId, shareClassId, shares, costBasis, acquisitionDate, holdingType, isRestricted, restrictionType, restrictionEndDate) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE shares = VALUES(shares)`,
        [h.shareholderId, h.shareClassId, h.shares, h.costBasis, h.acquisitionDate, h.holdingType, h.isRestricted, h.restrictionType, h.restrictionEndDate || null]
      );
    }
    console.log(`   ✓ Created ${holdings.length} holdings\n`);
    
    // ============================================
    // SEED CERTIFICATES
    // ============================================
    console.log('📜 Seeding certificates...');
    
    const certificates = [
      { certificateNumber: 'TVHI-2024-001', shareholderId: shRows[1]?.id, shareClassId: scRows[0].id, shares: 500000, issueDate: '2024-01-15', status: 'active' },
      { certificateNumber: 'TVHI-2024-002', shareholderId: shRows[2]?.id, shareClassId: scRows[0].id, shares: 50000, issueDate: '2024-02-01', status: 'active' },
      { certificateNumber: 'GMC-2023-001', shareholderId: shRows[6]?.id, shareClassId: scRows[2].id, shares: 1000000, issueDate: '2023-06-15', status: 'active' },
      { certificateNumber: 'GMC-2022-005', shareholderId: shRows[6]?.id, shareClassId: scRows[2].id, shares: 500000, issueDate: '2022-12-01', status: 'cancelled', cancelDate: '2024-01-10', cancelReason: 'Transfer to book-entry' },
      { certificateNumber: 'BHIL-2024-001', shareholderId: shRows[9]?.id, shareClassId: scRows[3].id, shares: 750000, issueDate: '2024-03-01', status: 'active' },
    ];
    
    for (const cert of certificates) {
      if (!cert.shareholderId) continue;
      await connection.execute(
        `INSERT INTO certificates (certificateNumber, shareholderId, shareClassId, shares, issueDate, status, cancelDate, cancelReason) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE certificateNumber = VALUES(certificateNumber)`,
        [cert.certificateNumber, cert.shareholderId, cert.shareClassId, cert.shares, cert.issueDate, cert.status, cert.cancelDate || null, cert.cancelReason || null]
      );
    }
    console.log(`   ✓ Created ${certificates.length} certificates\n`);
    
    // ============================================
    // SEED TRANSACTIONS
    // ============================================
    console.log('💸 Seeding transactions...');
    
    const transactions = [
      { companyId: companyMap['TechVenture Holdings Inc.'], transactionNumber: `TXN-${nanoid(8)}`, shareClassId: scRows[0].id, type: 'issuance', shares: 2000, pricePerShare: '5.25', totalValue: '10500.00', toShareholderId: shRows[4]?.id, status: 'completed', createdBy: 1 },
      { companyId: companyMap['TechVenture Holdings Inc.'], transactionNumber: `TXN-${nanoid(8)}`, shareClassId: scRows[0].id, type: 'transfer', shares: 10000, pricePerShare: '5.50', totalValue: '55000.00', fromShareholderId: shRows[2]?.id, toShareholderId: shRows[3]?.id, status: 'completed', createdBy: 1 },
      { companyId: companyMap['TechVenture Holdings Inc.'], transactionNumber: `TXN-${nanoid(8)}`, shareClassId: scRows[0].id, type: 'transfer', shares: 5000, pricePerShare: '5.45', totalValue: '27250.00', fromShareholderId: shRows[1]?.id, toShareholderId: shRows[0]?.id, status: 'pending', createdBy: 1 },
      { companyId: companyMap['Global Manufacturing Corp.'], transactionNumber: `TXN-${nanoid(8)}`, shareClassId: scRows[2].id, type: 'redemption', shares: 50000, pricePerShare: '22.00', totalValue: '1100000.00', fromShareholderId: shRows[7]?.id, status: 'completed', createdBy: 1 },
      { companyId: companyMap['Global Manufacturing Corp.'], transactionNumber: `TXN-${nanoid(8)}`, shareClassId: scRows[2].id, type: 'transfer', shares: 100000, pricePerShare: '21.50', totalValue: '2150000.00', fromShareholderId: shRows[5]?.id, toShareholderId: shRows[7]?.id, status: 'completed', createdBy: 1 },
      { companyId: companyMap['BioHealth Innovations Ltd.'], transactionNumber: `TXN-${nanoid(8)}`, shareClassId: scRows[3].id, type: 'issuance', shares: 100000, pricePerShare: '18.00', totalValue: '1800000.00', toShareholderId: shRows[8]?.id, status: 'completed', createdBy: 1 },
      { companyId: companyMap['BioHealth Innovations Ltd.'], transactionNumber: `TXN-${nanoid(8)}`, shareClassId: scRows[4].id, type: 'conversion', shares: 50000, pricePerShare: '25.00', totalValue: '1250000.00', fromShareholderId: shRows[10]?.id, toShareholderId: shRows[10]?.id, status: 'pending', createdBy: 1 },
    ];
    
    for (const txn of transactions) {
      await connection.execute(
        `INSERT INTO transactions (companyId, transactionNumber, shareClassId, type, shares, pricePerShare, totalValue, fromShareholderId, toShareholderId, status, transactionDate, createdBy) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?) ON DUPLICATE KEY UPDATE transactionNumber = VALUES(transactionNumber)`,
        [txn.companyId, txn.transactionNumber, txn.shareClassId, txn.type, txn.shares, txn.pricePerShare, txn.totalValue, txn.fromShareholderId || null, txn.toShareholderId || null, txn.status, txn.createdBy]
      );
    }
    console.log(`   ✓ Created ${transactions.length} transactions\n`);
    
    // ============================================
    // SEED CORPORATE ACTIONS
    // ============================================
    console.log('🏢 Seeding corporate actions...');
    
    const corporateActions = [
      { companyId: companyMap['TechVenture Holdings Inc.'], actionNumber: `CA-${nanoid(8)}`, type: 'split', title: '2-for-1 Stock Split', description: 'Board approved 2-for-1 forward stock split', recordDate: '2025-02-15', effectiveDate: '2025-03-01', status: 'announced', ratio: '2:1', affectedShareClassId: scRows[0].id },
      { companyId: companyMap['TechVenture Holdings Inc.'], actionNumber: `CA-${nanoid(8)}`, type: 'dividend_cash', title: 'Q4 2024 Cash Dividend', description: 'Quarterly cash dividend of $0.15 per share', recordDate: '2024-12-15', paymentDate: '2024-12-30', status: 'completed', cashAmount: '0.15', affectedShareClassId: scRows[0].id },
      { companyId: companyMap['Global Manufacturing Corp.'], actionNumber: `CA-${nanoid(8)}`, type: 'merger', title: 'Acquisition of Precision Parts Inc.', description: 'Strategic acquisition', recordDate: '2025-01-20', effectiveDate: '2025-03-15', status: 'pending' },
      { companyId: companyMap['Global Manufacturing Corp.'], actionNumber: `CA-${nanoid(8)}`, type: 'rights_offering', title: 'Rights Offering - 1 for 10', description: 'Existing shareholders can purchase 1 new share for every 10 held at $18.00', recordDate: '2025-02-01', effectiveDate: '2025-02-28', status: 'announced', cashAmount: '18.00' },
      { companyId: companyMap['BioHealth Innovations Ltd.'], actionNumber: `CA-${nanoid(8)}`, type: 'spin_off', title: 'Spin-off of Diagnostics Division', description: 'Creating separate publicly traded company', recordDate: '2025-04-01', effectiveDate: '2025-06-01', status: 'announced' },
    ];
    
    for (const ca of corporateActions) {
      await connection.execute(
        `INSERT INTO corporate_actions (companyId, actionNumber, type, title, description, recordDate, paymentDate, effectiveDate, status, ratio, cashAmount, affectedShareClassId) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title)`,
        [ca.companyId, ca.actionNumber, ca.type, ca.title, ca.description, ca.recordDate || null, ca.paymentDate || null, ca.effectiveDate || null, ca.status, ca.ratio || null, ca.cashAmount || null, ca.affectedShareClassId || null]
      );
    }
    console.log(`   ✓ Created ${corporateActions.length} corporate actions\n`);
    
    // ============================================
    // SEED PROXY EVENTS
    // ============================================
    console.log('🗳️ Seeding proxy events...');
    
    const proxyEvents = [
      { companyId: companyMap['TechVenture Holdings Inc.'], title: 'Annual General Meeting 2025', type: 'annual_meeting', recordDate: '2025-02-15', status: 'announced', quorumRequirement: '50.00', isVirtual: true, virtualMeetingUrl: 'https://meetings.techventure.com/agm2025', totalEligibleShares: 42000000 },
      { companyId: companyMap['TechVenture Holdings Inc.'], title: 'Special Meeting - Stock Split Approval', type: 'special_meeting', recordDate: '2025-01-15', status: 'voting_open', quorumRequirement: '33.00', isVirtual: true, virtualMeetingUrl: 'https://meetings.techventure.com/special2025', totalEligibleShares: 42000000 },
      { companyId: companyMap['Global Manufacturing Corp.'], title: 'Annual General Meeting 2025', type: 'annual_meeting', recordDate: '2025-03-20', status: 'announced', quorumRequirement: '50.00', isVirtual: false, totalEligibleShares: 235000000 },
      { companyId: companyMap['BioHealth Innovations Ltd.'], title: 'Annual General Meeting 2025', type: 'annual_meeting', recordDate: '2025-04-10', status: 'draft', quorumRequirement: '50.00', isVirtual: true, virtualMeetingUrl: 'https://meetings.biohealth.com/agm2025', totalEligibleShares: 11500000 },
    ];
    
    for (const pe of proxyEvents) {
      await connection.execute(
        `INSERT INTO proxy_events (companyId, title, type, recordDate, status, quorumRequirement, isVirtual, virtualMeetingUrl, totalEligibleShares) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title)`,
        [pe.companyId, pe.title, pe.type, pe.recordDate, pe.status, pe.quorumRequirement, pe.isVirtual, pe.virtualMeetingUrl || null, pe.totalEligibleShares]
      );
    }
    console.log(`   ✓ Created ${proxyEvents.length} proxy events\n`);
    
    // Get proxy event IDs
    const [peRows] = await connection.execute('SELECT id FROM proxy_events ORDER BY id');
    
    // ============================================
    // SEED PROXY PROPOSALS
    // ============================================
    console.log('📋 Seeding proxy proposals...');
    
    const proxyProposals = [
      { proxyEventId: peRows[0]?.id, proposalNumber: 1, title: 'Election of Directors', description: 'Elect 7 directors to serve until next annual meeting', type: 'director_election' },
      { proxyEventId: peRows[0]?.id, proposalNumber: 2, title: 'Ratification of Independent Auditor', description: 'Ratify appointment of KPMG as independent auditor for 2025', type: 'ratify_auditor' },
      { proxyEventId: peRows[0]?.id, proposalNumber: 3, title: 'Advisory Vote on Executive Compensation', description: 'Non-binding advisory vote on executive compensation', type: 'executive_compensation' },
      { proxyEventId: peRows[1]?.id, proposalNumber: 1, title: 'Approval of 2-for-1 Stock Split', description: 'Approve amendment to certificate of incorporation to effect stock split', type: 'other' },
      { proxyEventId: peRows[2]?.id, proposalNumber: 1, title: 'Election of Directors', description: 'Elect 9 directors to serve until next annual meeting', type: 'director_election' },
      { proxyEventId: peRows[2]?.id, proposalNumber: 2, title: 'Approval of Merger Agreement', description: 'Approve merger agreement with Precision Parts Inc.', type: 'other' },
    ];
    
    for (const pp of proxyProposals) {
      if (!pp.proxyEventId) continue;
      await connection.execute(
        `INSERT INTO proxy_proposals (proxyEventId, proposalNumber, title, description, type) 
         VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title)`,
        [pp.proxyEventId, pp.proposalNumber, pp.title, pp.description, pp.type]
      );
    }
    console.log(`   ✓ Created ${proxyProposals.length} proxy proposals\n`);
    
    // ============================================
    // SEED EQUITY PLANS
    // ============================================
    console.log('📊 Seeding equity plans...');
    
    const equityPlans = [
      { companyId: companyMap['TechVenture Holdings Inc.'], name: '2020 Stock Incentive Plan', type: 'stock_option', shareClassId: scRows[0].id, authorizedShares: 5000000, availableShares: 2500000, effectiveDate: '2020-01-01', expirationDate: '2030-01-01', status: 'active' },
      { companyId: companyMap['TechVenture Holdings Inc.'], name: '2023 RSU Plan', type: 'rsu', shareClassId: scRows[0].id, authorizedShares: 2000000, availableShares: 1200000, effectiveDate: '2023-01-01', expirationDate: '2033-01-01', status: 'active' },
      { companyId: companyMap['Global Manufacturing Corp.'], name: '2018 Executive Stock Option Plan', type: 'stock_option', shareClassId: scRows[2].id, authorizedShares: 10000000, availableShares: 3000000, effectiveDate: '2018-07-01', expirationDate: '2028-07-01', status: 'active' },
      { companyId: companyMap['Global Manufacturing Corp.'], name: '2022 Performance Share Plan', type: 'performance', shareClassId: scRows[2].id, authorizedShares: 5000000, availableShares: 4000000, effectiveDate: '2022-01-01', expirationDate: '2032-01-01', status: 'active' },
      { companyId: companyMap['BioHealth Innovations Ltd.'], name: '2021 Equity Incentive Plan', type: 'stock_option', shareClassId: scRows[3].id, authorizedShares: 3000000, availableShares: 1500000, effectiveDate: '2021-01-01', expirationDate: '2031-01-01', status: 'active' },
    ];
    
    for (const ep of equityPlans) {
      await connection.execute(
        `INSERT INTO equity_plans (companyId, name, type, shareClassId, authorizedShares, availableShares, effectiveDate, expirationDate, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [ep.companyId, ep.name, ep.type, ep.shareClassId, ep.authorizedShares, ep.availableShares, ep.effectiveDate, ep.expirationDate, ep.status]
      );
    }
    console.log(`   ✓ Created ${equityPlans.length} equity plans\n`);
    
    // Get equity plan IDs
    const [epRows] = await connection.execute('SELECT id FROM equity_plans ORDER BY id');
    
    // ============================================
    // SEED EQUITY GRANTS
    // ============================================
    console.log('🎁 Seeding equity grants...');
    
    const equityGrants = [
      { planId: epRows[0]?.id, grantNumber: `GR-${nanoid(8)}`, employeeId: 1, grantDate: '2024-01-15', grantType: 'iso', sharesGranted: 100000, exercisePrice: '4.50', vestingSchedule: 'monthly', vestingStartDate: '2024-01-15', cliffMonths: 12, vestingMonths: 48, expirationDate: '2034-01-15', status: 'active' },
      { planId: epRows[0]?.id, grantNumber: `GR-${nanoid(8)}`, employeeId: 2, grantDate: '2024-03-01', grantType: 'nso', sharesGranted: 50000, exercisePrice: '5.00', vestingSchedule: 'monthly', vestingStartDate: '2024-03-01', cliffMonths: 12, vestingMonths: 48, expirationDate: '2034-03-01', status: 'active' },
      { planId: epRows[1]?.id, grantNumber: `GR-${nanoid(8)}`, employeeId: 1, grantDate: '2024-06-01', grantType: 'rsu', sharesGranted: 25000, vestingSchedule: 'annual', vestingStartDate: '2024-06-01', cliffMonths: 0, vestingMonths: 36, status: 'active' },
      { planId: epRows[2]?.id, grantNumber: `GR-${nanoid(8)}`, employeeId: 3, grantDate: '2023-01-01', grantType: 'iso', sharesGranted: 500000, exercisePrice: '18.00', vestingSchedule: 'annual', vestingStartDate: '2023-01-01', cliffMonths: 12, vestingMonths: 48, expirationDate: '2033-01-01', status: 'active' },
      { planId: epRows[3]?.id, grantNumber: `GR-${nanoid(8)}`, employeeId: 3, grantDate: '2024-01-01', grantType: 'psu', sharesGranted: 100000, vestingSchedule: 'cliff', vestingStartDate: '2024-01-01', cliffMonths: 36, vestingMonths: 36, expirationDate: '2027-01-01', status: 'active' },
      { planId: epRows[4]?.id, grantNumber: `GR-${nanoid(8)}`, employeeId: 4, grantDate: '2022-01-01', grantType: 'iso', sharesGranted: 200000, exercisePrice: '8.00', vestingSchedule: 'monthly', vestingStartDate: '2022-01-01', cliffMonths: 12, vestingMonths: 48, expirationDate: '2032-01-01', status: 'active' },
    ];
    
    for (const eg of equityGrants) {
      if (!eg.planId) continue;
      await connection.execute(
        `INSERT INTO equity_grants (planId, grantNumber, employeeId, grantDate, grantType, sharesGranted, exercisePrice, vestingSchedule, vestingStartDate, cliffMonths, vestingMonths, expirationDate, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE grantNumber = VALUES(grantNumber)`,
        [eg.planId, eg.grantNumber, eg.employeeId, eg.grantDate, eg.grantType, eg.sharesGranted, eg.exercisePrice || null, eg.vestingSchedule, eg.vestingStartDate, eg.cliffMonths, eg.vestingMonths, eg.expirationDate || null, eg.status]
      );
    }
    console.log(`   ✓ Created ${equityGrants.length} equity grants\n`);
    
    // ============================================
    // SEED COMPLIANCE ALERTS
    // ============================================
    console.log('⚠️ Seeding compliance alerts...');
    
    const complianceAlerts = [
      { companyId: companyMap['TechVenture Holdings Inc.'], type: 'filing_deadline', severity: 'high', title: '1099-DIV Filing Due', description: 'Annual 1099-DIV forms must be filed by January 31, 2025', dueDate: '2025-01-31', status: 'active' },
      { companyId: companyMap['TechVenture Holdings Inc.'], type: 'rule_144', severity: 'medium', title: 'Rule 144 Restriction Expiring', description: 'John Mitchell restricted shares become unrestricted on June 1, 2025', dueDate: '2025-06-01', status: 'active' },
      { companyId: companyMap['Global Manufacturing Corp.'], type: 'escheatment', severity: 'medium', title: 'State Escheatment Report Due', description: 'Annual unclaimed property report due to Delaware', dueDate: '2025-03-01', status: 'active' },
      { companyId: companyMap['Global Manufacturing Corp.'], type: 'regulatory', severity: 'low', title: 'SEC Rule 17Ad-7 Compliance Review', description: 'Quarterly compliance review for transfer agent recordkeeping', dueDate: '2025-04-15', status: 'active' },
      { companyId: companyMap['BioHealth Innovations Ltd.'], type: 'insider_trading', severity: 'high', title: 'Blackout Period Starting', description: 'Trading blackout period begins 2 weeks before earnings release', dueDate: '2025-02-01', status: 'active' },
    ];
    
    for (const ca of complianceAlerts) {
      await connection.execute(
        `INSERT INTO compliance_alerts (companyId, type, severity, title, description, dueDate, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title)`,
        [ca.companyId, ca.type, ca.severity, ca.title, ca.description, ca.dueDate, ca.status]
      );
    }
    console.log(`   ✓ Created ${complianceAlerts.length} compliance alerts\n`);
    
    // ============================================
    // SEED DTC REQUESTS
    // ============================================
    console.log('🏦 Seeding DTC requests...');
    
    const dtcRequests = [
      { companyId: companyMap['TechVenture Holdings Inc.'], requestNumber: `DTC-${nanoid(8)}`, type: 'deposit', dtcParticipantNumber: '0001', brokerName: 'Fidelity Investments', shareholderId: shRows[3]?.id, shareClassId: scRows[0].id, shares: 25000, status: 'completed' },
      { companyId: companyMap['TechVenture Holdings Inc.'], requestNumber: `DTC-${nanoid(8)}`, type: 'withdrawal', dtcParticipantNumber: '0002', brokerName: 'Charles Schwab', shareholderId: shRows[2]?.id, shareClassId: scRows[0].id, shares: 10000, status: 'processing' },
      { companyId: companyMap['Global Manufacturing Corp.'], requestNumber: `DTC-${nanoid(8)}`, type: 'fast_transfer', dtcParticipantNumber: '0003', brokerName: 'TD Ameritrade', shareholderId: shRows[5]?.id, shareClassId: scRows[2].id, shares: 50000, status: 'pending' },
    ];
    
    for (const dtc of dtcRequests) {
      if (!dtc.shareholderId) continue;
      await connection.execute(
        `INSERT INTO dtc_requests (companyId, requestNumber, type, dtcParticipantNumber, brokerName, shareholderId, shareClassId, shares, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE requestNumber = VALUES(requestNumber)`,
        [dtc.companyId, dtc.requestNumber, dtc.type, dtc.dtcParticipantNumber, dtc.brokerName, dtc.shareholderId, dtc.shareClassId, dtc.shares, dtc.status]
      );
    }
    console.log(`   ✓ Created ${dtcRequests.length} DTC requests\n`);
    
    // ============================================
    // SEED INTEGRATIONS
    // ============================================
    console.log('🔗 Seeding integrations...');
    
    const integrations = [
      { companyId: companyMap['TechVenture Holdings Inc.'], name: 'SAP ERP', type: 'erp', status: 'connected' },
      { companyId: companyMap['TechVenture Holdings Inc.'], name: 'Workday HRIS', type: 'hris', status: 'connected' },
      { companyId: companyMap['TechVenture Holdings Inc.'], name: 'Thomson Reuters Tax', type: 'tax_system', status: 'connected' },
      { companyId: companyMap['Global Manufacturing Corp.'], name: 'Oracle ERP', type: 'erp', status: 'connected' },
      { companyId: companyMap['Global Manufacturing Corp.'], name: 'ADP HRIS', type: 'hris', status: 'connected' },
    ];
    
    for (const int of integrations) {
      await connection.execute(
        `INSERT INTO integrations (companyId, name, type, status) 
         VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [int.companyId, int.name, int.type, int.status]
      );
    }
    console.log(`   ✓ Created ${integrations.length} integrations\n`);
    
    console.log('✅ Database seeding completed successfully!\n');
    console.log('Summary:');
    console.log('  - 3 Companies');
    console.log('  - 5 Share Classes');
    console.log('  - 11 Shareholders');
    console.log('  - 15 Holdings');
    console.log('  - 5 Certificates');
    console.log('  - 7 Transactions');
    console.log('  - 5 Corporate Actions');
    console.log('  - 4 Proxy Events');
    console.log('  - 6 Proxy Proposals');
    console.log('  - 5 Equity Plans');
    console.log('  - 6 Equity Grants');
    console.log('  - 5 Compliance Alerts');
    console.log('  - 3 DTC Requests');
    console.log('  - 5 Integrations');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seed().catch(console.error);
