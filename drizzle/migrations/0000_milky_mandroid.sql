CREATE TABLE `event` (
	`id` integer PRIMARY KEY NOT NULL,
	`timestamp` text NOT NULL,
	`description` text NOT NULL,
	`performed_by` integer,
	`target_participant_id` integer,
	`target_user_id` integer,
	`extra_info` text,
	FOREIGN KEY (`performed_by`) REFERENCES `participant`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`target_participant_id`) REFERENCES `participant`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`target_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "only_one_target" CHECK(("event"."target_participant_id" IS NOT NULL and "event"."target_user_id" IS NULL)
          OR ("event"."target_participant_id" IS NULL and "event"."target_user_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE `participant` (
	`id` integer PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`checked_in` integer DEFAULT false NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`age` integer NOT NULL,
	`gender` text NOT NULL,
	`school` text NOT NULL,
	`graduation_year` integer NOT NULL,
	`level_of_study` text NOT NULL,
	`country` text NOT NULL,
	`major` text NOT NULL,
	`diet_restrictions` text DEFAULT '' NOT NULL,
	`resume_url` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text,
	`deleted_at` text,
	`name_email` text GENERATED ALWAYS AS (lower("first_name" || ' ' || "last_name" || ' ' || "email")) VIRTUAL NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `participant`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text,
	`name` text NOT NULL,
	`is_disabled` integer DEFAULT false NOT NULL,
	`is_admin` integer DEFAULT false NOT NULL,
	`is_judge` integer DEFAULT false NOT NULL
);
