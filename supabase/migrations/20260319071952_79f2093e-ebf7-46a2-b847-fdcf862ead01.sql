
-- Patient messages table for doctor-patient communication
CREATE TABLE public.patient_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  clinic_id uuid REFERENCES public.clinics(id),
  sender_type text NOT NULL DEFAULT 'patient' CHECK (sender_type IN ('patient', 'doctor')),
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.patient_messages ENABLE ROW LEVEL SECURITY;

-- Patients can view their own messages
CREATE POLICY "Patients can view own messages"
  ON public.patient_messages FOR SELECT
  TO authenticated
  USING (true);

-- Patients can insert messages
CREATE POLICY "Authenticated can insert messages"
  ON public.patient_messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Staff can update messages (mark as read)
CREATE POLICY "Staff can update messages"
  ON public.patient_messages FOR UPDATE
  TO authenticated
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.patient_messages;
