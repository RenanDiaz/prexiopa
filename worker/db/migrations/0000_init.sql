CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`gtin` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_user_gtin_uq` ON `products` (`user_id`,`gtin`);--> statement-breakpoint
CREATE TABLE `purchase_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_id` text NOT NULL,
	`line_no` integer NOT NULL,
	`store_item_id` text NOT NULL,
	`description` text NOT NULL,
	`quantity` real NOT NULL,
	`list_price_cents` integer NOT NULL,
	`discount_cents` integer DEFAULT 0 NOT NULL,
	`line_total_cents` integer NOT NULL,
	`tax_rate_bp` integer DEFAULT 0 NOT NULL,
	`tax_cents` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`purchase_id`) REFERENCES `purchases`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`store_item_id`) REFERENCES `store_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `purchase_lines_purchase_idx` ON `purchase_lines` (`purchase_id`);--> statement-breakpoint
CREATE INDEX `purchase_lines_store_item_idx` ON `purchase_lines` (`store_item_id`);--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`store_id` text NOT NULL,
	`source` text NOT NULL,
	`cufe` text,
	`issued_at` text NOT NULL,
	`branch_address` text,
	`subtotal_cents` integer NOT NULL,
	`tax_cents` integer DEFAULT 0 NOT NULL,
	`discount_cents` integer DEFAULT 0 NOT NULL,
	`total_cents` integer NOT NULL,
	`paid_cents` integer,
	`source_url` text,
	`raw_json` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `purchases_user_cufe_uq` ON `purchases` (`user_id`,`cufe`);--> statement-breakpoint
CREATE INDEX `purchases_user_issued_idx` ON `purchases` (`user_id`,`issued_at`);--> statement-breakpoint
CREATE TABLE `store_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`store_id` text NOT NULL,
	`code` text,
	`description` text NOT NULL,
	`product_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_items_user_store_code_uq` ON `store_items` (`user_id`,`store_id`,`code`);--> statement-breakpoint
CREATE INDEX `store_items_product_idx` ON `store_items` (`product_id`);--> statement-breakpoint
CREATE TABLE `stores` (
	`id` text PRIMARY KEY NOT NULL,
	`ruc` text,
	`dv` text,
	`legal_name` text NOT NULL,
	`display_name` text,
	`code_format` text DEFAULT 'internal' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stores_ruc_unique` ON `stores` (`ruc`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);