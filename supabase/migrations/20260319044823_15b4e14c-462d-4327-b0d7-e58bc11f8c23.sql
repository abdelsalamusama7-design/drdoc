
-- Insurance Companies
CREATE TABLE public.insurance_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id),
  name text NOT NULL,
  name_en text,
  contact_person text,
  phone text,
  email text,
  address text,
  contract_start date,
  contract_end date,
  discount_percentage numeric DEFAULT 0,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.insurance_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view insurance companies" ON public.insurance_companies
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage insurance companies" ON public.insurance_companies
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'accountant'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'accountant'::app_role));

-- Insurance Claims
CREATE TABLE public.insurance_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id),
  insurance_company_id uuid REFERENCES public.insurance_companies(id) NOT NULL,
  patient_id uuid REFERENCES public.patients(id) NOT NULL,
  visit_id uuid REFERENCES public.visits(id),
  claim_number text,
  claim_date date DEFAULT CURRENT_DATE,
  total_amount numeric DEFAULT 0,
  approved_amount numeric DEFAULT 0,
  patient_share numeric DEFAULT 0,
  status text DEFAULT 'pending',
  rejection_reason text,
  notes text,
  submitted_at timestamptz,
  resolved_at timestamptz,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view claims" ON public.insurance_claims
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can insert claims" ON public.insurance_claims
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Staff can update claims" ON public.insurance_claims
  FOR UPDATE TO authenticated USING (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'accountant'::app_role)
  );

-- Insurance Invoices
CREATE TABLE public.insurance_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id),
  insurance_company_id uuid REFERENCES public.insurance_companies(id) NOT NULL,
  invoice_number text,
  invoice_date date DEFAULT CURRENT_DATE,
  due_date date,
  total_amount numeric DEFAULT 0,
  paid_amount numeric DEFAULT 0,
  status text DEFAULT 'draft',
  notes text,
  sent_at timestamptz,
  paid_at timestamptz,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.insurance_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view insurance invoices" ON public.insurance_invoices
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage insurance invoices" ON public.insurance_invoices
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'accountant'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'accountant'::app_role));

-- Link claims to invoices
CREATE TABLE public.insurance_invoice_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES public.insurance_invoices(id) ON DELETE CASCADE NOT NULL,
  claim_id uuid REFERENCES public.insurance_claims(id) NOT NULL,
  amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.insurance_invoice_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view invoice claims" ON public.insurance_invoice_claims
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage invoice claims" ON public.insurance_invoice_claims
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'accountant'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'accountant'::app_role));

-- Add insurance fields to patients table
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS insurance_company_id uuid REFERENCES public.insurance_companies(id);
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS insurance_number text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS insurance_expiry date;
