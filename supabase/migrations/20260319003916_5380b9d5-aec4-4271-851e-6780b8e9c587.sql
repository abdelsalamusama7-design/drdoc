
-- Create visits table
CREATE TABLE IF NOT EXISTS public.visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id),
  date date NOT NULL DEFAULT CURRENT_DATE,
  time time DEFAULT now()::time,
  visit_type text DEFAULT 'diagnostic',
  payment_type text DEFAULT 'paid',
  status text DEFAULT 'pending',
  doctor_notes text,
  diagnosis text,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view visits" ON public.visits
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert visits" ON public.visits
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update visits" ON public.visits
  FOR UPDATE TO authenticated USING (true);

-- Create visit_services junction table
CREATE TABLE IF NOT EXISTS public.visit_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id),
  quantity integer DEFAULT 1,
  price numeric DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.visit_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view visit_services" ON public.visit_services
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert visit_services" ON public.visit_services
  FOR INSERT TO authenticated WITH CHECK (true);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  payment_method text DEFAULT 'cash',
  notes text,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view payments" ON public.payments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Accountant or Admin can insert payments" ON public.payments
  FOR INSERT TO authenticated WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'accountant') OR
    has_role(auth.uid(), 'doctor')
  );
CREATE POLICY "Accountant or Admin can update payments" ON public.payments
  FOR UPDATE TO authenticated USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'accountant')
  );

-- Create therapy_sessions table
CREATE TABLE IF NOT EXISTS public.therapy_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid REFERENCES public.visits(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  session_number integer DEFAULT 1,
  total_sessions integer DEFAULT 1,
  session_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'scheduled',
  notes text,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.therapy_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view therapy_sessions" ON public.therapy_sessions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert therapy_sessions" ON public.therapy_sessions
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update therapy_sessions" ON public.therapy_sessions
  FOR UPDATE TO authenticated USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.visits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
