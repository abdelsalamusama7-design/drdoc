import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ─── Types ───────────────────────────────────────────────────
export interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number | null;
  address: string | null;
  marital_status: string;
  medical_history: string | null;
  previous_surgeries: string | null;
  allergies: string[];
  current_medications: string[];
  created_at: string;
  last_visit: string | null;
  created_by: string | null;
}

export interface Appointment {
  id: string;
  patient_id: string | null;
  patient_name: string;
  phone: string | null;
  doctor: string | null;
  visit_type: string;
  notes: string | null;
  date: string;
  time: string;
  status: string;
  created_at: string;
  created_by: string | null;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  notes: string | null;
  category: string | null;
  created_at: string;
}

export interface Prescription {
  id: string;
  patient_id: string | null;
  patient_name: string;
  date: string;
  doctor_notes: string | null;
  created_by: string | null;
  created_at: string;
  medications?: PrescriptionMedication[];
}

export interface PrescriptionMedication {
  id: string;
  prescription_id: string;
  name: string;
  dosage: string | null;
  duration: string | null;
  notes: string | null;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface PatientFile {
  id: string;
  patient_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  notes: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface DoctorNote {
  id: string;
  patient_id: string;
  type: string;
  title: string;
  description: string | null;
  date: string;
  created_by: string | null;
  created_at: string;
}

export interface FollowUp {
  id: string;
  patient_id: string;
  appointment_id: string | null;
  follow_up_date: string;
  reason: string | null;
  status: string;
  notified: boolean;
  created_by: string | null;
  created_at: string;
}

export interface PatientRating {
  id: string;
  patient_id: string | null;
  appointment_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

// ─── Generic fetch hook ──────────────────────────────────────
function useSupabaseQuery<T>(
  table: string,
  options?: {
    orderBy?: string;
    ascending?: boolean;
    filters?: Record<string, any>;
    select?: string;
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      let query = (supabase.from(table as any) as any).select(options?.select || "*");
      
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      if (options?.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? false });
      }

      const { data: result, error } = await query;
      if (error) throw error;
      setData(result as T[]);
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  }, [table, JSON.stringify(options?.filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch, setData };
}

// ─── Patients ────────────────────────────────────────────────
export function usePatients() {
  return useSupabaseQuery<Patient>("patients", { orderBy: "created_at" });
}

export function usePatient(id: string) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase.from("patients" as any) as any)
      .select("*").eq("id", id).single();
    if (!error) setPatient(data as Patient);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);
  return { patient, loading, refetch: fetch };
}

export async function createPatient(patient: Omit<Patient, "id" | "created_at" | "last_visit">) {
  const { data, error } = await (supabase.from("patients" as any) as any)
    .insert(patient).select().single();
  if (error) throw error;
  return data as Patient;
}

export async function updatePatient(id: string, updates: Partial<Patient>) {
  const { error } = await (supabase.from("patients" as any) as any)
    .update(updates).eq("id", id);
  if (error) throw error;
}

// ─── Appointments ────────────────────────────────────────────
export function useAppointments(date?: string) {
  return useSupabaseQuery<Appointment>("appointments", {
    orderBy: "time",
    ascending: true,
    filters: date ? { date } : undefined,
  });
}

export function useAllAppointments() {
  return useSupabaseQuery<Appointment>("appointments", { orderBy: "date" });
}

export async function createAppointment(apt: Omit<Appointment, "id" | "created_at">) {
  const { data, error } = await (supabase.from("appointments" as any) as any)
    .insert(apt).select().single();
  if (error) throw error;
  return data as Appointment;
}

export async function updateAppointment(id: string, updates: Partial<Appointment>) {
  const { error } = await (supabase.from("appointments" as any) as any)
    .update(updates).eq("id", id);
  if (error) throw error;
}

// ─── Services ────────────────────────────────────────────────
export function useServices() {
  return useSupabaseQuery<Service>("services", { orderBy: "category", ascending: true });
}

export async function createService(service: Omit<Service, "id" | "created_at">) {
  const { data, error } = await (supabase.from("services" as any) as any)
    .insert(service).select().single();
  if (error) throw error;
  return data as Service;
}

export async function deleteService(id: string) {
  const { error } = await (supabase.from("services" as any) as any).delete().eq("id", id);
  if (error) throw error;
}

// ─── Prescriptions ───────────────────────────────────────────
export function usePrescriptions() {
  const [data, setData] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data: prescriptions, error } = await (supabase.from("prescriptions" as any) as any)
        .select("*").order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch medications for each prescription
      const ids = (prescriptions as any[]).map((p: any) => p.id);
      const { data: meds, error: medsError } = await (supabase.from("prescription_medications" as any) as any)
        .select("*").in("prescription_id", ids);
      if (medsError) throw medsError;

      const enriched = (prescriptions as any[]).map((p: any) => ({
        ...p,
        medications: (meds as any[]).filter((m: any) => m.prescription_id === p.id),
      }));
      setData(enriched as Prescription[]);
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
}

export async function createPrescription(
  prescription: { patient_id?: string; patient_name: string; doctor_notes?: string; created_by?: string },
  medications: Omit<PrescriptionMedication, "id" | "prescription_id">[]
) {
  const { data: rx, error } = await (supabase.from("prescriptions" as any) as any)
    .insert(prescription).select().single();
  if (error) throw error;

  if (medications.length > 0) {
    const medsWithId = medications.map(m => ({ ...m, prescription_id: (rx as any).id }));
    const { error: medsError } = await (supabase.from("prescription_medications" as any) as any)
      .insert(medsWithId);
    if (medsError) throw medsError;
  }

  return rx as Prescription;
}

// ─── Expenses ────────────────────────────────────────────────
export function useExpenses() {
  return useSupabaseQuery<Expense>("expenses", { orderBy: "date" });
}

export async function createExpense(expense: Omit<Expense, "id" | "created_at">) {
  const { data, error } = await (supabase.from("expenses" as any) as any)
    .insert(expense).select().single();
  if (error) throw error;
  return data as Expense;
}

// ─── Patient Files ───────────────────────────────────────────
export function usePatientFiles(patientId: string) {
  return useSupabaseQuery<PatientFile>("patient_files", {
    orderBy: "created_at",
    filters: { patient_id: patientId },
  });
}

export async function uploadPatientFile(
  patientId: string,
  file: File,
  fileType: string,
  notes: string,
  userId: string
) {
  const filePath = `${patientId}/${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("patient-files")
    .upload(filePath, file);
  if (uploadError) throw uploadError;

  const { data, error } = await (supabase.from("patient_files" as any) as any)
    .insert({
      patient_id: patientId,
      file_name: file.name,
      file_path: filePath,
      file_type: fileType,
      notes,
      uploaded_by: userId,
    })
    .select()
    .single();
  if (error) throw error;
  return data as PatientFile;
}

export function getFileUrl(filePath: string) {
  const { data } = supabase.storage.from("patient-files").getPublicUrl(filePath);
  return data.publicUrl;
}

export async function getSignedFileUrl(filePath: string) {
  const { data, error } = await supabase.storage
    .from("patient-files")
    .createSignedUrl(filePath, 3600);
  if (error) throw error;
  return data.signedUrl;
}

// ─── Doctor Notes ────────────────────────────────────────────
export function useDoctorNotes(patientId: string) {
  return useSupabaseQuery<DoctorNote>("doctor_notes", {
    orderBy: "date",
    filters: { patient_id: patientId },
  });
}

export async function createDoctorNote(note: Omit<DoctorNote, "id" | "created_at">) {
  const { data, error } = await (supabase.from("doctor_notes" as any) as any)
    .insert(note).select().single();
  if (error) throw error;
  return data as DoctorNote;
}

// ─── Follow-ups ──────────────────────────────────────────────
export function useFollowUps(patientId?: string) {
  return useSupabaseQuery<FollowUp>("follow_ups", {
    orderBy: "follow_up_date",
    ascending: true,
    filters: patientId ? { patient_id: patientId } : undefined,
  });
}

export async function createFollowUp(followUp: Omit<FollowUp, "id" | "created_at" | "notified">) {
  const { data, error } = await (supabase.from("follow_ups" as any) as any)
    .insert(followUp).select().single();
  if (error) throw error;
  return data as FollowUp;
}

export async function updateFollowUp(id: string, updates: Partial<FollowUp>) {
  const { error } = await (supabase.from("follow_ups" as any) as any)
    .update(updates).eq("id", id);
  if (error) throw error;
}

// ─── Patient Ratings ─────────────────────────────────────────
export function usePatientRatings(patientId?: string) {
  return useSupabaseQuery<PatientRating>("patient_ratings", {
    orderBy: "created_at",
    filters: patientId ? { patient_id: patientId } : undefined,
  });
}

export async function createRating(rating: Omit<PatientRating, "id" | "created_at">) {
  const { data, error } = await (supabase.from("patient_ratings" as any) as any)
    .insert(rating).select().single();
  if (error) throw error;
  return data as PatientRating;
}
