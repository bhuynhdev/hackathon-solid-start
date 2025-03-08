CREATE TABLE `category` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `category_name_unique` ON `category` (`name`);