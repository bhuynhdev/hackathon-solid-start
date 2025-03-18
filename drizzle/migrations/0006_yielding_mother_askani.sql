CREATE TABLE `project` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `project_submission` (
	`id` integer PRIMARY KEY NOT NULL,
	`project_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `project_and_category` ON `project_submission` (`project_id`,`category_id`);