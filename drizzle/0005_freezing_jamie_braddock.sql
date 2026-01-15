CREATE TABLE `invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`token` varchar(64) NOT NULL,
	`role` enum('user','admin','issuer','shareholder','employee') NOT NULL DEFAULT 'user',
	`companyId` int,
	`status` enum('pending','accepted','expired','revoked') NOT NULL DEFAULT 'pending',
	`invitedBy` int NOT NULL,
	`acceptedBy` int,
	`message` text,
	`expiresAt` timestamp NOT NULL,
	`acceptedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `invitations_token_unique` UNIQUE(`token`)
);
