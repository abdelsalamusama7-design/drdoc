
-- Allow anonymous users to insert appointments (for public booking)
CREATE POLICY "Anonymous users can insert appointments for booking"
ON public.appointments FOR INSERT TO anon
WITH CHECK (true);

-- Allow anonymous users to view appointments for booking
CREATE POLICY "Anonymous users can view appointments for booking"
ON public.appointments FOR SELECT TO anon
USING (true);

-- Add patient_segment column for CRM
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS segment text DEFAULT 'new';

-- Add visit_count for tracking
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS visit_count integer DEFAULT 0;
