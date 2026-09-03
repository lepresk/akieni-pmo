CREATE TYPE "public"."project_model" AS ENUM('regie', 'forfait', 'non_billable');--> statement-breakpoint
CREATE TYPE "public"."project_nature" AS ENUM('program', 'simple');--> statement-breakpoint
CREATE TYPE "public"."segment" AS ENUM('public', 'private', 'internal');--> statement-breakpoint
CREATE TYPE "public"."seniority" AS ENUM('junior', 'confirmed', 'senior', 'lead', 'manager');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('staff', 'pm', 'pmo', 'manager', 'finance', 'rh', 'direction', 'admin');--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clients_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "departments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"initials" varchar(8),
	"full_name" varchar(160) NOT NULL,
	"first_name" varchar(80),
	"department_id" uuid,
	"seniority" "seniority",
	"manager_id" uuid,
	"default_tjm" integer,
	"reference_tjm" integer,
	"salary_gross" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(200) NOT NULL,
	"role" "user_role" NOT NULL,
	"employee_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "cost_centers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"label" varchar(120) NOT NULL,
	"billable" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" varchar(200) NOT NULL,
	"client_id" uuid,
	"segment" "segment" NOT NULL,
	"model" "project_model" NOT NULL,
	"nature" "project_nature" NOT NULL,
	"budget_days" integer DEFAULT 0 NOT NULL,
	"spent_days" integer DEFAULT 0 NOT NULL,
	"description" text,
	"pm_employee_id" uuid,
	"cost_load" numeric(5, 3),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "cost_center_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" varchar(120) NOT NULL,
	"billable" boolean DEFAULT true NOT NULL,
	CONSTRAINT "cost_center_catalog_label_unique" UNIQUE("label")
);
--> statement-breakpoint
CREATE TABLE "holidays" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" varchar(120) NOT NULL,
	"observed_on" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_grid" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seniority" "seniority" NOT NULL,
	"cost_per_day" integer NOT NULL,
	"sell_per_day" integer NOT NULL,
	"effective_from" date NOT NULL,
	"is_current" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_manager_id_employees_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_pm_employee_id_employees_id_fk" FOREIGN KEY ("pm_employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;