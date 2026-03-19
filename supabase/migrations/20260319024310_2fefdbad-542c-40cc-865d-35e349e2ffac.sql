
-- Demo requests / contact forms
CREATE TABLE IF NOT EXISTS public.demo_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name text NOT NULL,
  contact_name text NOT NULL,
  phone text,
  email text,
  specialty text,
  patient_count text,
  message text,
  request_type text DEFAULT 'demo',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon can insert demo requests" ON public.demo_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Auth can insert demo requests" ON public.demo_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can view demo requests" ON public.demo_requests FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Clinic referrals
CREATE TABLE IF NOT EXISTS public.clinic_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  referred_clinic_name text NOT NULL,
  referred_contact text NOT NULL,
  referred_phone text,
  referred_email text,
  status text DEFAULT 'pending',
  reward_type text DEFAULT 'free_month',
  reward_applied boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.clinic_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view own referrals" ON public.clinic_referrals FOR SELECT TO authenticated USING (is_clinic_member(auth.uid(), referrer_clinic_id));
CREATE POLICY "Members can insert referrals" ON public.clinic_referrals FOR INSERT TO authenticated WITH CHECK (is_clinic_member(auth.uid(), referrer_clinic_id));

-- Clinic satisfaction surveys
CREATE TABLE IF NOT EXISTS public.clinic_satisfaction (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id uuid,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category text DEFAULT 'general',
  comment text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.clinic_satisfaction ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can insert satisfaction" ON public.clinic_satisfaction FOR INSERT TO authenticated WITH CHECK (is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Members can view satisfaction" ON public.clinic_satisfaction FOR SELECT TO authenticated USING (is_clinic_member(auth.uid(), clinic_id));

-- Onboarding progress
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE UNIQUE,
  completed_steps jsonb DEFAULT '[]'::jsonb,
  current_step integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can manage onboarding" ON public.onboarding_progress FOR ALL TO authenticated USING (is_clinic_member(auth.uid(), clinic_id)) WITH CHECK (is_clinic_member(auth.uid(), clinic_id));
