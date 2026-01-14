CREATE TABLE `audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`companyId` int,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(100) NOT NULL,
	`entityId` int,
	`oldValues` json,
	`newValues` json,
	`ipAddress` varchar(50),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`certificateNumber` varchar(50) NOT NULL,
	`shareholderId` int NOT NULL,
	`shareClassId` int NOT NULL,
	`shares` bigint NOT NULL,
	`issueDate` date NOT NULL,
	`status` enum('active','cancelled','transferred','lost','stolen','replaced') DEFAULT 'active',
	`cancelDate` date,
	`cancelReason` text,
	`replacementCertId` int,
	`indemnityBondNumber` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `certificates_certificateNumber_unique` UNIQUE(`certificateNumber`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`ticker` varchar(10),
	`cik` varchar(20),
	`incorporationState` varchar(50),
	`incorporationDate` date,
	`fiscalYearEnd` varchar(10),
	`status` enum('active','inactive','suspended') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compliance_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`type` enum('filing_deadline','escheatment','rule_144','insider_trading','regulatory','audit') NOT NULL,
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`title` varchar(255) NOT NULL,
	`description` text,
	`dueDate` date,
	`status` enum('active','acknowledged','resolved','dismissed') DEFAULT 'active',
	`resolvedAt` timestamp,
	`resolvedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `compliance_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `corporate_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`actionNumber` varchar(50) NOT NULL,
	`type` enum('dividend_cash','dividend_stock','split','reverse_split','merger','acquisition','spin_off','rights_offering','tender_offer','consolidation','name_change','symbol_change') NOT NULL,
	`status` enum('announced','pending','processing','completed','cancelled') DEFAULT 'announced',
	`title` varchar(255) NOT NULL,
	`description` text,
	`recordDate` date,
	`exDate` date,
	`paymentDate` date,
	`effectiveDate` date,
	`ratio` varchar(50),
	`cashAmount` decimal(15,4),
	`currency` varchar(10) DEFAULT 'USD',
	`affectedShareClassId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `corporate_actions_id` PRIMARY KEY(`id`),
	CONSTRAINT `corporate_actions_actionNumber_unique` UNIQUE(`actionNumber`)
);
--> statement-breakpoint
CREATE TABLE `dividends` (
	`id` int AUTO_INCREMENT NOT NULL,
	`corporateActionId` int NOT NULL,
	`shareholderId` int NOT NULL,
	`shares` bigint NOT NULL,
	`grossAmount` decimal(15,4) NOT NULL,
	`withholdingTax` decimal(15,4) DEFAULT '0',
	`netAmount` decimal(15,4) NOT NULL,
	`currency` varchar(10) DEFAULT 'USD',
	`paymentMethod` enum('check','ach','wire','reinvest') DEFAULT 'check',
	`paymentStatus` enum('pending','processing','paid','returned','escheated') DEFAULT 'pending',
	`paymentDate` date,
	`checkNumber` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dividends_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dtc_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`requestNumber` varchar(50) NOT NULL,
	`type` enum('deposit','withdrawal','fast_transfer') NOT NULL,
	`dtcParticipantNumber` varchar(20) NOT NULL,
	`brokerName` varchar(255),
	`shareholderId` int NOT NULL,
	`shareClassId` int NOT NULL,
	`shares` bigint NOT NULL,
	`status` enum('pending','processing','completed','rejected') DEFAULT 'pending',
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dtc_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `dtc_requests_requestNumber_unique` UNIQUE(`requestNumber`)
);
--> statement-breakpoint
CREATE TABLE `equity_grants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`grantNumber` varchar(50) NOT NULL,
	`employeeId` int NOT NULL,
	`grantDate` date NOT NULL,
	`grantType` enum('iso','nso','rsu','psu','sar','restricted_stock') NOT NULL,
	`sharesGranted` bigint NOT NULL,
	`sharesVested` bigint DEFAULT 0,
	`sharesExercised` bigint DEFAULT 0,
	`sharesCancelled` bigint DEFAULT 0,
	`exercisePrice` decimal(15,4),
	`fairMarketValue` decimal(15,4),
	`vestingSchedule` enum('cliff','monthly','quarterly','annual','custom') DEFAULT 'monthly',
	`vestingStartDate` date,
	`cliffMonths` int DEFAULT 12,
	`vestingMonths` int DEFAULT 48,
	`expirationDate` date,
	`status` enum('active','fully_vested','exercised','cancelled','expired') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `equity_grants_id` PRIMARY KEY(`id`),
	CONSTRAINT `equity_grants_grantNumber_unique` UNIQUE(`grantNumber`)
);
--> statement-breakpoint
CREATE TABLE `equity_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('stock_option','rsu','performance','sar','espp','phantom') NOT NULL,
	`shareClassId` int NOT NULL,
	`authorizedShares` bigint NOT NULL,
	`availableShares` bigint NOT NULL,
	`effectiveDate` date NOT NULL,
	`expirationDate` date,
	`status` enum('active','frozen','terminated') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `equity_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `holdings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shareholderId` int NOT NULL,
	`shareClassId` int NOT NULL,
	`shares` bigint NOT NULL,
	`costBasis` decimal(15,4),
	`acquisitionDate` date,
	`holdingType` enum('book_entry','certificated','drs','dtc') DEFAULT 'book_entry',
	`isRestricted` boolean DEFAULT false,
	`restrictionType` enum('rule_144','rule_144a','reg_s','legend','none') DEFAULT 'none',
	`restrictionEndDate` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `holdings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` enum('erp','hris','tax_system','banking','dtc','custom') NOT NULL,
	`status` enum('connected','disconnected','error') DEFAULT 'disconnected',
	`lastSyncAt` timestamp,
	`config` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('transaction','dividend','proxy','compliance','system','grant') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`isRead` boolean DEFAULT false,
	`link` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proxy_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` enum('annual_meeting','special_meeting','written_consent') DEFAULT 'annual_meeting',
	`recordDate` date NOT NULL,
	`meetingDate` timestamp,
	`meetingLocation` varchar(255),
	`isVirtual` boolean DEFAULT false,
	`virtualMeetingUrl` varchar(500),
	`quorumRequirement` decimal(5,2) DEFAULT '50.00',
	`status` enum('draft','announced','materials_sent','voting_open','closed','certified') DEFAULT 'draft',
	`totalEligibleShares` bigint,
	`totalVotedShares` bigint DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proxy_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proxy_proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proxyEventId` int NOT NULL,
	`proposalNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('director_election','ratify_auditor','executive_compensation','shareholder_proposal','other') DEFAULT 'other',
	`votesFor` bigint DEFAULT 0,
	`votesAgainst` bigint DEFAULT 0,
	`votesAbstain` bigint DEFAULT 0,
	`result` enum('pending','passed','failed') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proxy_proposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proxy_votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proxyEventId` int NOT NULL,
	`proposalId` int NOT NULL,
	`shareholderId` int NOT NULL,
	`shares` bigint NOT NULL,
	`vote` enum('for','against','abstain','withhold') NOT NULL,
	`voteMethod` enum('online','mail','phone','in_person') DEFAULT 'online',
	`votedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `proxy_votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `share_classes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`symbol` varchar(20),
	`authorizedShares` bigint NOT NULL,
	`issuedShares` bigint DEFAULT 0,
	`outstandingShares` bigint DEFAULT 0,
	`treasuryShares` bigint DEFAULT 0,
	`parValue` decimal(10,4) DEFAULT '0.0001',
	`votingRights` boolean DEFAULT true,
	`dividendRate` decimal(10,4),
	`liquidationPreference` decimal(15,2),
	`conversionRatio` decimal(10,4),
	`isPreferred` boolean DEFAULT false,
	`isRestricted` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `share_classes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shareholders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`userId` int,
	`accountNumber` varchar(50) NOT NULL,
	`type` enum('individual','joint','trust','corporation','partnership','ira','custodian') DEFAULT 'individual',
	`name` varchar(255) NOT NULL,
	`taxId` varchar(50),
	`taxIdType` enum('ssn','ein','itin','foreign'),
	`address1` varchar(255),
	`address2` varchar(255),
	`city` varchar(100),
	`state` varchar(50),
	`postalCode` varchar(20),
	`country` varchar(100) DEFAULT 'USA',
	`email` varchar(320),
	`phone` varchar(50),
	`status` enum('active','inactive','deceased','escheated') DEFAULT 'active',
	`isInsider` boolean DEFAULT false,
	`isAffiliate` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shareholders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tax_forms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`shareholderId` int NOT NULL,
	`taxYear` int NOT NULL,
	`formType` enum('1099_div','1099_b','1099_misc','1042_s','w8_ben','w9') NOT NULL,
	`grossAmount` decimal(15,4),
	`taxWithheld` decimal(15,4),
	`status` enum('draft','generated','sent','corrected') DEFAULT 'draft',
	`generatedAt` timestamp,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tax_forms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`transactionNumber` varchar(50) NOT NULL,
	`type` enum('issuance','transfer','cancellation','split','reverse_split','dividend','conversion','redemption','repurchase','gift','inheritance','dtc_deposit','dtc_withdrawal','drs_transfer') NOT NULL,
	`status` enum('pending','approved','processing','completed','rejected','cancelled') DEFAULT 'pending',
	`fromShareholderId` int,
	`toShareholderId` int,
	`shareClassId` int NOT NULL,
	`shares` bigint NOT NULL,
	`pricePerShare` decimal(15,4),
	`totalValue` decimal(20,4),
	`transactionDate` timestamp NOT NULL,
	`settlementDate` date,
	`notes` text,
	`approvedBy` int,
	`approvedAt` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_transactionNumber_unique` UNIQUE(`transactionNumber`)
);
--> statement-breakpoint
CREATE TABLE `vesting_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`grantId` int NOT NULL,
	`vestingDate` date NOT NULL,
	`sharesVesting` bigint NOT NULL,
	`status` enum('scheduled','vested','cancelled') DEFAULT 'scheduled',
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vesting_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','issuer','shareholder','employee') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `companyId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `securityLevel` enum('low','medium','high') DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE `users` ADD `mfaEnabled` boolean DEFAULT false;