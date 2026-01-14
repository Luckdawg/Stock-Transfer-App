ALTER TABLE `certificates` MODIFY COLUMN `issueDate` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `certificates` MODIFY COLUMN `cancelDate` varchar(20);--> statement-breakpoint
ALTER TABLE `companies` MODIFY COLUMN `incorporationDate` varchar(20);--> statement-breakpoint
ALTER TABLE `compliance_alerts` MODIFY COLUMN `dueDate` varchar(20);--> statement-breakpoint
ALTER TABLE `corporate_actions` MODIFY COLUMN `recordDate` varchar(20);--> statement-breakpoint
ALTER TABLE `corporate_actions` MODIFY COLUMN `exDate` varchar(20);--> statement-breakpoint
ALTER TABLE `corporate_actions` MODIFY COLUMN `paymentDate` varchar(20);--> statement-breakpoint
ALTER TABLE `corporate_actions` MODIFY COLUMN `effectiveDate` varchar(20);--> statement-breakpoint
ALTER TABLE `dividends` MODIFY COLUMN `paymentDate` varchar(20);--> statement-breakpoint
ALTER TABLE `equity_grants` MODIFY COLUMN `grantDate` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `equity_grants` MODIFY COLUMN `vestingStartDate` varchar(20);--> statement-breakpoint
ALTER TABLE `equity_grants` MODIFY COLUMN `expirationDate` varchar(20);--> statement-breakpoint
ALTER TABLE `equity_plans` MODIFY COLUMN `effectiveDate` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `equity_plans` MODIFY COLUMN `expirationDate` varchar(20);--> statement-breakpoint
ALTER TABLE `holdings` MODIFY COLUMN `acquisitionDate` varchar(20);--> statement-breakpoint
ALTER TABLE `holdings` MODIFY COLUMN `restrictionEndDate` varchar(20);--> statement-breakpoint
ALTER TABLE `proxy_events` MODIFY COLUMN `recordDate` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `settlementDate` varchar(20);--> statement-breakpoint
ALTER TABLE `vesting_events` MODIFY COLUMN `vestingDate` varchar(20) NOT NULL;