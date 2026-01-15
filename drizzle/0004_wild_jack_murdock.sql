ALTER TABLE `companies` ADD `ein` varchar(20);--> statement-breakpoint
ALTER TABLE `companies` ADD `industry` varchar(100);--> statement-breakpoint
ALTER TABLE `companies` ADD `sector` varchar(100);--> statement-breakpoint
ALTER TABLE `companies` ADD `address1` varchar(255);--> statement-breakpoint
ALTER TABLE `companies` ADD `address2` varchar(255);--> statement-breakpoint
ALTER TABLE `companies` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `companies` ADD `state` varchar(50);--> statement-breakpoint
ALTER TABLE `companies` ADD `postalCode` varchar(20);--> statement-breakpoint
ALTER TABLE `companies` ADD `country` varchar(100) DEFAULT 'USA';--> statement-breakpoint
ALTER TABLE `companies` ADD `phone` varchar(50);--> statement-breakpoint
ALTER TABLE `companies` ADD `email` varchar(320);--> statement-breakpoint
ALTER TABLE `companies` ADD `website` varchar(255);--> statement-breakpoint
ALTER TABLE `companies` ADD `description` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `logoUrl` varchar(500);