CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"at" varchar(40) NOT NULL,
	"who" varchar(160) NOT NULL,
	"role" varchar(60) NOT NULL,
	"action" varchar(200) NOT NULL,
	"target" varchar(200) NOT NULL,
	"sensitive" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ref" varchar(40) NOT NULL,
	"project_name" varchar(200) NOT NULL,
	"client_name" varchar(160) NOT NULL,
	"model" varchar(20) NOT NULL,
	"quantity_label" varchar(40) NOT NULL,
	"amount_label" varchar(40) NOT NULL,
	"status" varchar(40) NOT NULL,
	CONSTRAINT "invoices_ref_unique" UNIQUE("ref")
);
