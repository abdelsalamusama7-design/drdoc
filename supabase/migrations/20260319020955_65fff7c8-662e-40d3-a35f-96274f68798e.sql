
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'confirmation_status') THEN
    ALTER TABLE public.appointments ADD COLUMN confirmation_status text DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'reminder_sent') THEN
    ALTER TABLE public.appointments ADD COLUMN reminder_sent boolean DEFAULT false;
  END IF;
END $$;
