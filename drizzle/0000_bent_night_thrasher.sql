CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`icon` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE INDEX `idx_categories_name` ON `categories` (`name`);--> statement-breakpoint
CREATE TABLE `food_nutrients` (
	`food_id` integer NOT NULL,
	`nutrient_id` integer NOT NULL,
	`value` real,
	`is_trace` integer DEFAULT false,
	PRIMARY KEY(`food_id`, `nutrient_id`),
	FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`nutrient_id`) REFERENCES `nutrient_definitions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_food_nutrients_food_id` ON `food_nutrients` (`food_id`);--> statement-breakpoint
CREATE TABLE `foods` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`original_id` text,
	`category_id` integer,
	`name` text NOT NULL,
	`scientific_name` text,
	`english_name` text,
	`url` text,
	`information` text,
	`edible_part_percentage` real,
	`portion_value` real,
	`portion_unit` text,
	`samples_count` integer,
	`scraped_at` text,
	`energy_kcal` real,
	`protein_g` real,
	`fat_g` real,
	`carbohydrates_g` real,
	`sugar_g` real,
	`fiber_g` real,
	`sodium_mg` real,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_foods_name` ON `foods` (`name`);--> statement-breakpoint
CREATE INDEX `idx_foods_original_id` ON `foods` (`original_id`);--> statement-breakpoint
CREATE TABLE `nutrient_definitions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`unit` text
);
--> statement-breakpoint
CREATE INDEX `idx_nutrient_definitions_unique` ON `nutrient_definitions` (`name`,`unit`);--> statement-breakpoint
CREATE TABLE `user_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`icon` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_categories_name_unique` ON `user_categories` (`name`);--> statement-breakpoint
CREATE INDEX `idx_user_categories_name` ON `user_categories` (`name`);--> statement-breakpoint
CREATE TABLE `user_foods` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category_id` integer,
	`is_category_custom` integer DEFAULT false,
	`source_food_id` integer,
	`name` text NOT NULL,
	`scientific_name` text,
	`english_name` text,
	`information` text,
	`edible_part_percentage` real,
	`portion_value` real,
	`portion_unit` text,
	`energy_kcal` real,
	`protein_g` real,
	`fat_g` real,
	`carbohydrates_g` real,
	`sugar_g` real,
	`fiber_g` real,
	`sodium_mg` real,
	FOREIGN KEY (`source_food_id`) REFERENCES `foods`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_user_foods_name` ON `user_foods` (`name`);