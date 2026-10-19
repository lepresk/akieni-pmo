CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'validated', 'issued', 'cancelled');--> statement-breakpoint
CREATE TABLE "leave_balances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"acquired_days" real NOT NULL,
	"taken_days" real NOT NULL,
	CONSTRAINT "leave_balances_employee_year" UNIQUE("employee_id","year")
);
--> statement-breakpoint
CREATE TABLE "notification_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"key" varchar(80) NOT NULL,
	"label" varchar(160) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	CONSTRAINT "notification_rules_user_key" UNIQUE("user_id","key")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text NOT NULL,
	"channel" varchar(40) NOT NULL,
	"href" varchar(240),
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cost_center_catalog" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "expense_date" date;--> statement-breakpoint
ALTER TABLE "leaves" ADD COLUMN "from_date" date;--> statement-breakpoint
ALTER TABLE "leaves" ADD COLUMN "to_date" date;--> statement-breakpoint
UPDATE "leaves" SET "from_date" = CURRENT_DATE WHERE "from_date" IS NULL;--> statement-breakpoint
UPDATE "leaves" SET "to_date" = CURRENT_DATE WHERE "to_date" IS NULL;--> statement-breakpoint
ALTER TABLE "leaves" ALTER COLUMN "from_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "leaves" ALTER COLUMN "to_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "week_start" date;--> statement-breakpoint
UPDATE "submissions" SET "week_start" = CURRENT_DATE WHERE "week_start" IS NULL;--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "week_start" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "status_new" "invoice_status" DEFAULT 'draft';--> statement-breakpoint
UPDATE "invoices" SET "status_new" = CASE
  WHEN "status" IN ('Brouillon', 'draft') THEN 'draft'::invoice_status
  WHEN "status" IN ('À valider', 'Validée', 'validated') THEN 'validated'::invoice_status
  WHEN "status" IN ('Envoyée', 'Émise', 'issued') THEN 'issued'::invoice_status
  WHEN "status" IN ('Annulée', 'cancelled') THEN 'cancelled'::invoice_status
  ELSE 'draft'::invoice_status
END;--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "invoices" RENAME COLUMN "status_new" TO "status";--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "status" SET DEFAULT 'draft'::invoice_status;--> statement-breakpoint
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_rules" ADD CONSTRAINT "notification_rules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
