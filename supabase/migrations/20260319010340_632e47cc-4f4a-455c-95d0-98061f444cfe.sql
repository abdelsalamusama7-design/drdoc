
-- Queue Management System
CREATE TABLE public.queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  queue_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  check_in_time TIMESTAMPTZ DEFAULT now(),
  called_time TIMESTAMPTZ,
  completed_time TIMESTAMPTZ,
  clinic_id UUID REFERENCES public.clinics(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  patient_name TEXT NOT NULL,
  doctor TEXT
);

ALTER TABLE public.queue_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view queue" ON public.queue_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert queue entries" ON public.queue_entries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update queue entries" ON public.queue_entries FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anon can view queue for display" ON public.queue_entries FOR SELECT TO anon USING (true);

-- Enable realtime for queue
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_entries;

-- Inventory / Pharmacy Management
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT DEFAULT 'medicine',
  sku TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER DEFAULT 10,
  unit TEXT DEFAULT 'piece',
  purchase_price NUMERIC DEFAULT 0,
  selling_price NUMERIC DEFAULT 0,
  expiry_date DATE,
  supplier TEXT,
  clinic_id UUID REFERENCES public.clinics(id),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view inventory" ON public.inventory_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage inventory" ON public.inventory_items FOR ALL TO authenticated USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'doctor')
) WITH CHECK (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'doctor')
);

CREATE TABLE public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL DEFAULT 'sale',
  quantity INTEGER NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  visit_id UUID REFERENCES public.visits(id) ON DELETE SET NULL,
  notes TEXT,
  clinic_id UUID REFERENCES public.clinics(id),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view transactions" ON public.inventory_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert transactions" ON public.inventory_transactions FOR INSERT TO authenticated WITH CHECK (true);

-- No-show tracking: add no_show_count to patients
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS no_show_count INTEGER DEFAULT 0;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS risk_score NUMERIC DEFAULT 0;

-- Indexes
CREATE INDEX idx_queue_entries_clinic ON public.queue_entries(clinic_id);
CREATE INDEX idx_queue_entries_status ON public.queue_entries(status);
CREATE INDEX idx_inventory_items_clinic ON public.inventory_items(clinic_id);
CREATE INDEX idx_inventory_items_quantity ON public.inventory_items(quantity);
CREATE INDEX idx_inventory_transactions_item ON public.inventory_transactions(item_id);
