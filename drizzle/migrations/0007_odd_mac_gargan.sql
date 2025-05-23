CREATE TABLE `judge_group` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category_id` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_judge` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`category_id` integer NOT NULL,
	`judge_group_id` integer,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`judge_group_id`) REFERENCES `judge_group`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_judge`("id", "email", "name", "category_id", "judge_group_id") SELECT "id", "email", "name", "category_id", NULL FROM `judge`;--> statement-breakpoint
DROP TABLE `judge`;--> statement-breakpoint
ALTER TABLE `__new_judge` RENAME TO `judge`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `judge_email_unique` ON `judge` (`email`);
