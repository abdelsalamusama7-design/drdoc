
-- Drug index table (common medications database)
CREATE TABLE public.drug_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  category text DEFAULT 'general',
  default_dosage text,
  default_duration text,
  notes text,
  clinic_id uuid REFERENCES public.clinics(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.drug_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view drugs" ON public.drug_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage drugs" ON public.drug_index FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'doctor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'doctor'));

-- Medication templates (groups of meds/labs)
CREATE TABLE public.medication_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  template_type text DEFAULT 'medication',
  items jsonb DEFAULT '[]'::jsonb,
  clinic_id uuid REFERENCES public.clinics(id),
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.medication_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view templates" ON public.medication_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage templates" ON public.medication_templates FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'doctor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'doctor'));

-- Lab/test index
CREATE TABLE public.lab_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  category text DEFAULT 'general',
  notes text,
  clinic_id uuid REFERENCES public.clinics(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.lab_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view labs" ON public.lab_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage labs" ON public.lab_index FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'doctor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'doctor'));
