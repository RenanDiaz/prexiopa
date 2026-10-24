ALTER TABLE `purchase_lines` ADD `quantity_source` text DEFAULT 'invoice' NOT NULL;--> statement-breakpoint
ALTER TABLE `store_items` ADD `link_source` text;--> statement-breakpoint
ALTER TABLE `store_items` ADD `is_weighed` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `store_items` ADD `weighed_by_user` integer;--> statement-breakpoint
ALTER TABLE `stores` ADD `quantities` text DEFAULT 'reliable' NOT NULL;--> statement-breakpoint
ALTER TABLE `stores` ADD `configured_by_user` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `catalog_version` integer DEFAULT 0 NOT NULL;