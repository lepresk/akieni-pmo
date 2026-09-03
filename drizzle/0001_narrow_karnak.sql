CREATE TABLE "plan_load" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"week_code" varchar(8) NOT NULL,
	"week_index" integer NOT NULL,
	"pct" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "plan_load" ADD CONSTRAINT "plan_load_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;