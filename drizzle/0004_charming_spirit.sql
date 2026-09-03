CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"sub" varchar(160),
	"poste" varchar(120) NOT NULL,
	"name" varchar(200) NOT NULL,
	"responsible" varchar(160),
	"from_week" integer DEFAULT 0 NOT NULL,
	"to_week" integer DEFAULT 0 NOT NULL,
	"days" integer DEFAULT 0 NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "amendments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"ref" varchar(20) NOT NULL,
	"target" varchar(20) NOT NULL,
	"poste" varchar(120),
	"reason" varchar(240) NOT NULL,
	"days" integer DEFAULT 0 NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"asker" varchar(160),
	"date_label" varchar(40)
);
--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"sub" varchar(160),
	"employee_name" varchar(160) NOT NULL,
	"allocation_pct" integer DEFAULT 0 NOT NULL,
	"project_tjm" integer,
	"seniority" varchar(40)
);
--> statement-breakpoint
CREATE TABLE "project_envelopes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"sub" varchar(160),
	"mo" integer DEFAULT 0 NOT NULL,
	"achats" integer DEFAULT 0 NOT NULL,
	"mission" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"pm_name" varchar(160),
	"budget_days" integer DEFAULT 0 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "amendments" ADD CONSTRAINT "amendments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_envelopes" ADD CONSTRAINT "project_envelopes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_nodes" ADD CONSTRAINT "project_nodes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;