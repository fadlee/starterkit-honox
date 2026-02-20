CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`difficulty_level` text DEFAULT 'beginner' NOT NULL,
	`visibility` text DEFAULT 'public' NOT NULL,
	`featured_image` text DEFAULT '' NOT NULL,
	`pricing_model` text DEFAULT 'free' NOT NULL,
	`categories_json` text DEFAULT '[]' NOT NULL,
	`tags_json` text DEFAULT '[]' NOT NULL,
	`author` text DEFAULT '' NOT NULL,
	`is_scheduled` integer DEFAULT false NOT NULL,
	`schedule_date` text,
	`is_public_course` integer DEFAULT true NOT NULL,
	`max_students` integer DEFAULT 0 NOT NULL,
	`certificate` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `courses_slug_unique` ON `courses` (`slug`);--> statement-breakpoint
CREATE TABLE `enrollment_completed_lessons` (
	`enrollment_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`completed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`enrollment_id`, `lesson_id`),
	FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `enrollment_completed_lessons_lesson_idx` ON `enrollment_completed_lessons` (`lesson_id`);--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`course_id` text NOT NULL,
	`enrolled_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `enrollments_user_course_unique` ON `enrollments` (`user_id`,`course_id`);--> statement-breakpoint
CREATE TABLE `lesson_notes` (
	`enrollment_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`enrollment_id`, `lesson_id`),
	FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`topic_id` text NOT NULL,
	`course_id` text NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`featured_image` text DEFAULT '' NOT NULL,
	`video_url` text DEFAULT '' NOT NULL,
	`video_playback_hours` integer DEFAULT 0 NOT NULL,
	`video_playback_minutes` integer DEFAULT 0 NOT NULL,
	`video_playback_seconds` integer DEFAULT 0 NOT NULL,
	`exercise_files_json` text DEFAULT '[]' NOT NULL,
	`is_preview` integer DEFAULT false NOT NULL,
	`preview_type` text DEFAULT 'free' NOT NULL,
	`sort_order` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lessons_topic_order_unique` ON `lessons` (`topic_id`,`sort_order`);--> statement-breakpoint
CREATE UNIQUE INDEX `lessons_course_slug_unique` ON `lessons` (`course_id`,`slug`);--> statement-breakpoint
CREATE INDEX `lessons_topic_order_idx` ON `lessons` (`topic_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at_ms` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_expires_at_ms_idx` ON `sessions` (`expires_at_ms`);--> statement-breakpoint
CREATE TABLE `topics` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`title` text NOT NULL,
	`sort_order` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `topics_course_order_unique` ON `topics` (`course_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `topics_course_order_idx` ON `topics` (`course_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`username_normalized` text NOT NULL,
	`display_name` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_normalized_unique` ON `users` (`username_normalized`);