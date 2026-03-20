
ALTER TABLE public.patient_messages 
ADD COLUMN IF NOT EXISTS recipient_type text DEFAULT 'doctor',
ADD COLUMN IF NOT EXISTS recipient_name text DEFAULT NULL;
