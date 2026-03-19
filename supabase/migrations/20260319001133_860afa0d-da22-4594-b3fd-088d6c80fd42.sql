
-- Patients table
CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  age integer,
  address text,
  marital_status text DEFAULT 'single',
  medical_history text,
  previous_surgeries text,
  allergies text[] DEFAULT '{}',
  current_medications text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  last_visit timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Appointments table
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name text NOT NULL,
  phone text,
  doctor text,
  visit_type text DEFAULT 'consultation',
  notes text,
  date date NOT NULL,
  time time NOT NULL,
  status text DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Services table
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  notes text,
  category text,
  created_at timestamptz DEFAULT now()
);

-- Prescriptions table
CREATE TABLE public.prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name text NOT NULL,
  date date DEFAULT CURRENT_DATE,
  doctor_notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Prescription medications table
CREATE TABLE public.prescription_medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id uuid REFERENCES public.prescriptions(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  dosage text,
  duration text,
  notes text
);

-- Expenses table
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  date date DEFAULT CURRENT_DATE,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Patient files (lab results, radiology, etc.)
CREATE TABLE public.patient_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text DEFAULT 'other',
  notes text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Doctor notes / timeline events
CREATE TABLE public.doctor_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  type text DEFAULT 'note',
  title text NOT NULL,
  description text,
  date date DEFAULT CURRENT_DATE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Follow-ups
CREATE TABLE public.follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  follow_up_date date NOT NULL,
  reason text,
  status text DEFAULT 'pending',
  notified boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Patient ratings
CREATE TABLE public.patient_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  rating integer NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Storage bucket for patient files
INSERT INTO storage.buckets (id, name, public) VALUES ('patient-files', 'patient-files', false);

-- Enable RLS on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Authenticated users can CRUD all clinic data
CREATE POLICY "Authenticated users can view patients" ON public.patients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert patients" ON public.patients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update patients" ON public.patients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete patients" ON public.patients FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view appointments" ON public.appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update appointments" ON public.appointments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete appointments" ON public.appointments FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view services" ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage services" ON public.services FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'doctor')) WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'doctor'));

CREATE POLICY "Authenticated users can view prescriptions" ON public.prescriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert prescriptions" ON public.prescriptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update prescriptions" ON public.prescriptions FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view prescription_medications" ON public.prescription_medications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert prescription_medications" ON public.prescription_medications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete prescription_medications" ON public.prescription_medications FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view expenses" ON public.expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage expenses" ON public.expenses FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'doctor')) WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'doctor'));

CREATE POLICY "Authenticated users can view patient_files" ON public.patient_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert patient_files" ON public.patient_files FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete patient_files" ON public.patient_files FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'doctor'));

CREATE POLICY "Authenticated users can view doctor_notes" ON public.doctor_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert doctor_notes" ON public.doctor_notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update doctor_notes" ON public.doctor_notes FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view follow_ups" ON public.follow_ups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert follow_ups" ON public.follow_ups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update follow_ups" ON public.follow_ups FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Anyone can insert ratings" ON public.patient_ratings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can view ratings" ON public.patient_ratings FOR SELECT TO authenticated USING (true);

-- Storage RLS policies
CREATE POLICY "Authenticated users can upload patient files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'patient-files');
CREATE POLICY "Authenticated users can view patient files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'patient-files');
CREATE POLICY "Admins can delete patient files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'patient-files');
