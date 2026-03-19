
DROP POLICY "Accountant or Admin can insert payments" ON public.payments;

CREATE POLICY "Staff can insert payments" ON public.payments
FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'accountant'::app_role) OR 
  has_role(auth.uid(), 'doctor'::app_role) OR 
  has_role(auth.uid(), 'receptionist'::app_role)
);
