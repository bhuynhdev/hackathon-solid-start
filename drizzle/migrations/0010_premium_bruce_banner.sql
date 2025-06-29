CREATE TABLE `assignment` (
	`submission_id` integer NOT NULL,
	`judge_group_id` integer NOT NULL,
	PRIMARY KEY(`judge_group_id`, `submission_id`),
	FOREIGN KEY (`submission_id`) REFERENCES `project_submission`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`judge_group_id`) REFERENCES `judge_group`(`id`) ON UPDATE no action ON DELETE cascade
);
