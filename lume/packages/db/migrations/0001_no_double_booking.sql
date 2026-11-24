-- Doppelbuchungen auf Datenbankebene ausschließen: Eine Mitarbeiterin kann nicht
-- zwei aktive Termine haben, deren Zeiten (inklusive Puffer) sich überschneiden.
CREATE EXTENSION IF NOT EXISTS btree_gist;
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_no_overlap"
  EXCLUDE USING gist ("staff_id" WITH =, tstzrange("starts_at", "blocked_until") WITH &&)
  WHERE ("status" NOT IN ('cancelled', 'no_show'));
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_time_order"
  CHECK ("starts_at" < "ends_at" AND "ends_at" <= "blocked_until");
--> statement-breakpoint
ALTER TABLE "working_hours" ADD CONSTRAINT "working_hours_valid"
  CHECK ("weekday" BETWEEN 1 AND 7 AND "start_time" < "end_time");
--> statement-breakpoint
ALTER TABLE "time_off" ADD CONSTRAINT "time_off_valid" CHECK ("starts_at" < "ends_at");
--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_valid"
  CHECK ("duration_min" > 0 AND "buffer_after_min" >= 0 AND "price_cents" >= 0);
