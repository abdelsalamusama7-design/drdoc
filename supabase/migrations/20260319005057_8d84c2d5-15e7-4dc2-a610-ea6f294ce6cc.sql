
-- 1. Create clinics table
CREATE TABLE public.clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  slug text UNIQUE NOT NULL,
  logo_url text,
  phone text,
  email text,
  address text,
  subscription_plan text DEFAULT 'starter',
  subscription_status text DEFAULT 'active',
  max_users integer DEFAULT 3,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create clinic_members junction table
CREATE TABLE public.clinic_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'staff',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(clinic_id, user_id)
);

-- 3. Add clinic_id to all data tables
ALTER TABLE public.patients ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.appointments ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.visits ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.services ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.prescriptions ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.expenses ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.payments ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.doctor_notes ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.follow_ups ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.patient_files ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.patient_ratings ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.therapy_sessions ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.visit_services ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;

-- 4. Create a default clinic and assign all existing data
INSERT INTO public.clinics (id, name, name_en, slug, subscription_plan, max_users)
VALUES ('00000000-0000-0000-0000-000000000001', 'العيادة الافتراضية', 'Default Clinic', 'default-clinic', 'premium', 999);

-- 5. Assign all existing data to default clinic
UPDATE public.patients SET clinic_id = '00000000-0000-0000-0000-000000000001' WHERE clinic_id IS NULL;
UPDATE public.appointments SET clinic_id = '00000000-0000-0000-0000-000000000001' WHERE clinic_id IS NULL;
UPDATE public.visits SET clinic_id = '00000000-0000-0000-0000-000000000001' WHERE clinic_id IS NULL;
UPDATE public.services SET clinic_id = '00000000-0000-0000-0000-000000000001' WHERE clinic_id IS NULL;
UPDATE public.prescriptions SET clinic_id = '00000000-0000-0000-0000-000000000001' WHERE clinic_id IS NULL;
UPDATE public.expenses SET clinic_id = '00000000-0000-0000-0000-000000000001' WHERE clinic_id IS NULL;
UPDATE public.payments SET clinic_id = '00000000-0000-0000-0000-000000000001' WHERE clinic_id IS NULL;
UPDATE public.doctor_notes SET clinic_id = '00000000-0000-0000-0000-000000000001' WHERE clinic_id IS NULL;
UPDATE public.follow_ups SET clinic_id = '00000000-0000-0000-0000-000000000001' WHERE clinic_id IS NULL;
UPDATE public.patient_files SET clinic_id = '00000000-0000-0000-0000-000000000001' WHERE clinic_id IS NULL;
UPDATE public.patient_ratings SET clinic_id = '00000000-0000-0000-0000-000000000001' WHERE clinic_id IS NULL;
UPDATE public.therapy_sessions SET clinic_id = '00000000-0000-0000-0000-000000000001' WHERE clinic_id IS NULL;
UPDATE public.visit_services SET clinic_id = '00000000-0000-0000-0000-000000000001' WHERE clinic_id IS NULL;

-- 6. Function to get user's clinic_id
CREATE OR REPLACE FUNCTION public.get_user_clinic_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id FROM public.clinic_members WHERE user_id = _user_id AND is_active = true LIMIT 1
$$;

-- 7. Function to check clinic membership
CREATE OR REPLACE FUNCTION public.is_clinic_member(_user_id uuid, _clinic_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinic_members WHERE user_id = _user_id AND clinic_id = _clinic_id AND is_active = true
  )
$$;

-- 8. Enable RLS on new tables
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_members ENABLE ROW LEVEL SECURITY;

-- 9. RLS for clinics
CREATE POLICY "Members can view their clinic"
  ON public.clinics FOR SELECT TO authenticated
  USING (is_clinic_member(auth.uid(), id) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can update their clinic"
  ON public.clinics FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can insert clinics"
  ON public.clinics FOR INSERT TO authenticated
  WITH CHECK (true);

-- 10. RLS for clinic_members
CREATE POLICY "Members can view clinic members"
  ON public.clinic_members FOR SELECT TO authenticated
  USING (is_clinic_member(auth.uid(), clinic_id) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins or owners can manage members"
  ON public.clinic_members FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR EXISTS(SELECT 1 FROM public.clinics WHERE id = clinic_id AND owner_id = auth.uid()))
  WITH CHECK (has_role(auth.uid(), 'admin') OR EXISTS(SELECT 1 FROM public.clinics WHERE id = clinic_id AND owner_id = auth.uid()));

-- 11. Add super_admin to role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

-- 12. Create indexes for performance
CREATE INDEX idx_patients_clinic ON public.patients(clinic_id);
CREATE INDEX idx_appointments_clinic ON public.appointments(clinic_id);
CREATE INDEX idx_visits_clinic ON public.visits(clinic_id);
CREATE INDEX idx_payments_clinic ON public.payments(clinic_id);
CREATE INDEX idx_expenses_clinic ON public.expenses(clinic_id);
CREATE INDEX idx_clinic_members_user ON public.clinic_members(user_id);
CREATE INDEX idx_clinic_members_clinic ON public.clinic_members(clinic_id);
