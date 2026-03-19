
CREATE TABLE public.subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  plan text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'instapay',
  sender_name text,
  sender_phone text,
  receipt_path text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  confirmed_by uuid
);

ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert subscription payments"
  ON public.subscription_payments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own payments"
  ON public.subscription_payments FOR SELECT
  TO authenticated
  USING (
    is_clinic_member(auth.uid(), clinic_id)
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Anon can view their payment by id"
  ON public.subscription_payments FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admins can update payments"
  ON public.subscription_payments FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
