
-- Payment Plans (installments)
CREATE TABLE public.payment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  clinic_id uuid REFERENCES public.clinics(id),
  visit_id uuid REFERENCES public.visits(id),
  total_amount numeric NOT NULL DEFAULT 0,
  down_payment numeric NOT NULL DEFAULT 0,
  num_installments integer NOT NULL DEFAULT 3,
  installment_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view payment_plans" ON public.payment_plans
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can insert payment_plans" ON public.payment_plans
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'doctor'::app_role) OR 
    has_role(auth.uid(), 'receptionist'::app_role) OR
    has_role(auth.uid(), 'accountant'::app_role)
  );

CREATE POLICY "Staff can update payment_plans" ON public.payment_plans
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'receptionist'::app_role) OR
    has_role(auth.uid(), 'accountant'::app_role)
  );

-- Installment payments
CREATE TABLE public.installment_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.payment_plans(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id),
  clinic_id uuid REFERENCES public.clinics(id),
  installment_number integer NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  due_date date NOT NULL,
  paid_date date,
  status text NOT NULL DEFAULT 'pending',
  payment_method text DEFAULT 'cash',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.installment_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view installments" ON public.installment_payments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can insert installments" ON public.installment_payments
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'doctor'::app_role) OR 
    has_role(auth.uid(), 'receptionist'::app_role) OR
    has_role(auth.uid(), 'accountant'::app_role)
  );

CREATE POLICY "Staff can update installments" ON public.installment_payments
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'receptionist'::app_role) OR
    has_role(auth.uid(), 'accountant'::app_role)
  );

-- Trigger: notify patient and admin when installment is due
CREATE OR REPLACE FUNCTION public.notify_installment_due()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _patient_phone text;
  _patient_name text;
  _user_id uuid;
  _clinic_id uuid;
  _plan_clinic_id uuid;
  _admin_ids uuid[];
BEGIN
  -- Get patient info
  SELECT phone, name, clinic_id INTO _patient_phone, _patient_name, _plan_clinic_id
  FROM public.patients WHERE id = NEW.patient_id;

  IF _patient_phone IS NULL THEN RETURN NEW; END IF;

  -- Find patient's user account
  SELECT id INTO _user_id FROM public.profiles WHERE phone = _patient_phone LIMIT 1;

  -- Notify patient
  IF _user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, clinic_id, title, body, type, reference_id, reference_type)
    VALUES (
      _user_id,
      NEW.clinic_id,
      'قسط مستحق',
      'لديك قسط بقيمة ' || NEW.amount || ' ج.م مستحق بتاريخ ' || NEW.due_date::text,
      'installment',
      NEW.id,
      'installment'
    );
  END IF;

  -- Notify all admins and receptionists in the clinic
  SELECT array_agg(cm.user_id) INTO _admin_ids
  FROM public.clinic_members cm
  WHERE cm.clinic_id = NEW.clinic_id 
    AND cm.is_active = true 
    AND cm.role IN ('admin', 'receptionist', 'accountant');

  IF _admin_ids IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, clinic_id, title, body, type, reference_id, reference_type)
    SELECT 
      unnest(_admin_ids),
      NEW.clinic_id,
      'قسط مستحق للمريض ' || _patient_name,
      'قسط رقم ' || NEW.installment_number || ' بقيمة ' || NEW.amount || ' ج.م مستحق بتاريخ ' || NEW.due_date::text,
      'installment',
      NEW.id,
      'installment';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_installment_created
  AFTER INSERT ON public.installment_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_installment_due();

-- Enable realtime for installment tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.installment_payments;
