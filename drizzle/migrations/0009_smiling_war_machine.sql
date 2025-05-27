ALTER TABLE `project` ADD `status` text DEFAULT 'created' NOT NULL;--> statement-breakpoint
ALTER TABLE `project` ADD `disqualify_reason` text;