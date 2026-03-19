
-- Subscriptions table to track clinic subscriptions
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  plan text NOT NULL DEFAULT 'starter',
  status text NOT NULL DEFAULT 'active',
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  auto_renew boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (is_clinic_member(auth.uid(), clinic_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR EXISTS (SELECT 1 FROM clinics WHERE id = clinic_id AND owner_id = auth.uid()))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR EXISTS (SELECT 1 FROM clinics WHERE id = clinic_id AND owner_id = auth.uid()));

-- Invoices table
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  subscription_id uuid REFERENCES public.subscriptions(id),
  amount numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'EGP',
  status text NOT NULL DEFAULT 'pending',
  due_date date,
  paid_at timestamptz,
  payment_method text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (is_clinic_member(auth.uid(), clinic_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage invoices" ON public.invoices
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR EXISTS (SELECT 1 FROM clinics WHERE id = clinic_id AND owner_id = auth.uid()))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR EXISTS (SELECT 1 FROM clinics WHERE id = clinic_id AND owner_id = auth.uid()));

-- Medical alerts table for Phase 2
CREATE TABLE public.medical_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  clinic_id uuid REFERENCES public.clinics(id),
  alert_type text NOT NULL DEFAULT 'allergy',
  severity text NOT NULL DEFAULT 'medium',
  title text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.medical_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view alerts" ON public.medical_alerts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can manage alerts" ON public.medical_alerts
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'doctor'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'doctor'::app_role));
