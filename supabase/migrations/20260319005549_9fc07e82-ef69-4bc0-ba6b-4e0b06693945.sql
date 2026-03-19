
-- Add missing columns
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS gender text DEFAULT 'male';
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS visit_id uuid REFERENCES public.visits(id) ON DELETE SET NULL;
ALTER TABLE public.patient_files ADD COLUMN IF NOT EXISTS visit_id uuid REFERENCES public.visits(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS total_amount numeric DEFAULT 0;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS remaining_amount numeric DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_prescriptions_visit ON public.prescriptions(visit_id);
CREATE INDEX IF NOT EXISTS idx_patient_files_visit ON public.patient_files(visit_id);
