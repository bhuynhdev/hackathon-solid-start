ALTER TABLE `participant` ADD `attendance_status` text DEFAULT 'registered' NOT NULL;--> statement-breakpoint
ALTER TABLE `participant` ADD `checkedin_at` text;--> statement-breakpoint
ALTER TABLE `participant` DROP COLUMN `checked_in`;