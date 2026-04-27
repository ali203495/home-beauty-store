ALTER TABLE "orders" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "whatsapp_clicked" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "checkout_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "metadata" text;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_checkout_id_unique" UNIQUE("checkout_id");