CREATE TABLE `mail_campaign` (
	`id` integer PRIMARY KEY NOT NULL,
	`template` text NOT NULL,
	`created_at` text NOT NULL,
	`recipient_count` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mail_log` (
	`id` integer PRIMARY KEY NOT NULL,
	`mail_campaign_id` integer NOT NULL,
	`recipient_id` integer NOT NULL,
	`created_at` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	FOREIGN KEY (`mail_campaign_id`) REFERENCES `mail_campaign`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recipient_id`) REFERENCES `participant`(`id`) ON UPDATE no action ON DELETE no action
);
