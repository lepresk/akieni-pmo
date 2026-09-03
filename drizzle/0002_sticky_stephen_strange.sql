CREATE TYPE "public"."approval_status" AS ENUM('pending', 'validated', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."expense_nature" AS ENUM('achat', 'mission');--> statement-breakpoint
CREATE TYPE "public"."expense_state" AS ENUM('engage', 'facture', 'paye');--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nature" "expense_nature" NOT NULL,
	"project_name" varchar(200) NOT NULL,
	"sub" varchar(160),
	"poste" varchar(120),
	"label" varchar(200) NOT NULL,
	"supplier" varchar(160),
	"amount" integer NOT NULL,
	"state" "expense_state" NOT NULL,
	"billable" boolean DEFAULT false NOT NULL,
	"date_label" varchar(40)
);
--> statement-breakpoint
CREATE TABLE "leaves" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid,
	"person_name" varchar(160) NOT NULL,
	"type" varchar(60) NOT NULL,
	"from_label" varchar(40) NOT NULL,
	"to_label" varchar(40) NOT NULL,
	"days" real NOT NULL,
	"status" "approval_status" DEFAULT 'pending' NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid,
	"person_name" varchar(160) NOT NULL,
	"department" varchar(120),
	"manager_name" varchar(160),
	"week_label" varchar(60) NOT NULL,
	"hours" real NOT NULL,
	"billable" real NOT NULL,
	"status" "approval_status" DEFAULT 'pending' NOT NULL,
	"motif" text,
	"flags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"lines" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;