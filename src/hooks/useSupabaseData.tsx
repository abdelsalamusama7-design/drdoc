import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useClinic } from "@/hooks/useClinic";
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
  segment: string | null;
  visit_count: number | null;
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

export interface Visit {
  id: string;
  patient_id: string;
  appointment_id: string | null;
  date: string;
  time: string | null;
  visit_type: string;
  payment_type: string;
  status: string;
  doctor_notes: string | null;
  diagnosis: string | null;
  created_by: string | null;
  created_at: string;
}

export interface VisitService {
  id: string;
  visit_id: string;
  service_id: string;
  quantity: number;
  price: number;
  notes: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  visit_id: string;
  patient_id: string;
  amount: number;
  payment_method: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface TherapySession {
  id: string;
  visit_id: string | null;
  patient_id: string;
  session_number: number;
  total_sessions: number;
  session_date: string;
  status: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

// ─── Generic fetch hook ──────────────────────────────────────
// Tables that should be filtered by clinic_id
const CLINIC_TABLES = [
  "patients", "appointments", "visits", "services", "prescriptions",
  "expenses", "payments", "doctor_notes", "follow_ups", "patient_files",
  "patient_ratings", "therapy_sessions", "visit_services"
];

function useSupabaseQuery<T>(
  table: string,
  options?: {
    orderBy?: string;
    ascending?: boolean;
    filters?: Record<string, any>;
    select?: string;
    clinicId?: string | null;
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      let query = (supabase.from(table as any) as any).select(options?.select || "*");
      // Auto-filter by clinic_id for multi-tenant tables
      if (CLINIC_TABLES.includes(table) && options?.clinicId) {
        query = query.eq("clinic_id", options.clinicId);
      }
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
  }, [table, JSON.stringify(options?.filters), options?.clinicId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch, setData };
}

// ─── Patients ────────────────────────────────────────────────
export function usePatients() {
  const { clinic } = useClinic();
  return useSupabaseQuery<Patient>("patients", { orderBy: "created_at", clinicId: clinic?.id });
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

export async function createPatient(patient: Omit<Patient, "id" | "created_at" | "last_visit">, clinicId?: string) {
  const { data, error } = await (supabase.from("patients" as any) as any)
    .insert({ ...patient, clinic_id: clinicId }).select().single();
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
  const { clinic } = useClinic();
  return useSupabaseQuery<Appointment>("appointments", {
    orderBy: "time", ascending: true,
    filters: date ? { date } : undefined,
    clinicId: clinic?.id,
  });
}

export function useAllAppointments() {
  const { clinic } = useClinic();
  return useSupabaseQuery<Appointment>("appointments", { orderBy: "date", clinicId: clinic?.id });
}

export async function createAppointment(apt: Omit<Appointment, "id" | "created_at">, clinicId?: string) {
  const { data, error } = await (supabase.from("appointments" as any) as any)
    .insert({ ...apt, clinic_id: clinicId }).select().single();
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
  const { clinic } = useClinic();
  return useSupabaseQuery<Service>("services", { orderBy: "category", ascending: true, clinicId: clinic?.id });
}

export async function createService(service: Omit<Service, "id" | "created_at">, clinicId?: string) {
  const { data, error } = await (supabase.from("services" as any) as any)
    .insert({ ...service, clinic_id: clinicId }).select().single();
  if (error) throw error;
  return data as Service;
}

export async function deleteService(id: string) {
  const { error } = await (supabase.from("services" as any) as any).delete().eq("id", id);
  if (error) throw error;
}

// ─── Prescriptions ───────────────────────────────────────────
export function usePrescriptions() {
  const { clinic } = useClinic();
  const [data, setData] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      let query = (supabase.from("prescriptions" as any) as any)
        .select("*").order("created_at", { ascending: false });
      if (clinic?.id) query = query.eq("clinic_id", clinic.id);
      const { data: prescriptions, error } = await query;
      if (error) throw error;
      const ids = (prescriptions as any[]).map((p: any) => p.id);
      if (ids.length > 0) {
        const { data: meds, error: medsError } = await (supabase.from("prescription_medications" as any) as any)
          .select("*").in("prescription_id", ids);
        if (medsError) throw medsError;
        const enriched = (prescriptions as any[]).map((p: any) => ({
          ...p,
          medications: (meds as any[]).filter((m: any) => m.prescription_id === p.id),
        }));
        setData(enriched as Prescription[]);
      } else {
        setData([]);
      }
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  }, [clinic?.id]);
  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
}

export async function createPrescription(
  prescription: { patient_id?: string; patient_name: string; doctor_notes?: string; created_by?: string },
  medications: Omit<PrescriptionMedication, "id" | "prescription_id">[],
  clinicId?: string
) {
  const { data: rx, error } = await (supabase.from("prescriptions" as any) as any)
    .insert({ ...prescription, clinic_id: clinicId }).select().single();
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
  const { clinic } = useClinic();
  return useSupabaseQuery<Expense>("expenses", { orderBy: "date", clinicId: clinic?.id });
}

export async function createExpense(expense: Omit<Expense, "id" | "created_at">, clinicId?: string) {
  const { data, error } = await (supabase.from("expenses" as any) as any)
    .insert({ ...expense, clinic_id: clinicId }).select().single();
  if (error) throw error;
  return data as Expense;
}

// ─── Patient Files ───────────────────────────────────────────
export function usePatientFiles(patientId: string) {
  const { clinic } = useClinic();
  return useSupabaseQuery<PatientFile>("patient_files", {
    orderBy: "created_at", filters: { patient_id: patientId }, clinicId: clinic?.id,
  });
}

export async function uploadPatientFile(
  patientId: string, file: File, fileType: string, notes: string, userId: string, clinicId?: string
) {
  const filePath = `${patientId}/${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("patient-files").upload(filePath, file);
  if (uploadError) throw uploadError;
  const { data, error } = await (supabase.from("patient_files" as any) as any)
    .insert({ patient_id: patientId, file_name: file.name, file_path: filePath, file_type: fileType, notes, uploaded_by: userId, clinic_id: clinicId })
    .select().single();
  if (error) throw error;
  return data as PatientFile;
}

export function getFileUrl(filePath: string) {
  const { data } = supabase.storage.from("patient-files").getPublicUrl(filePath);
  return data.publicUrl;
}

export async function getSignedFileUrl(filePath: string) {
  const { data, error } = await supabase.storage
    .from("patient-files").createSignedUrl(filePath, 3600);
  if (error) throw error;
  return data.signedUrl;
}

// ─── Doctor Notes ────────────────────────────────────────────
export function useDoctorNotes(patientId: string) {
  const { clinic } = useClinic();
  return useSupabaseQuery<DoctorNote>("doctor_notes", {
    orderBy: "date", filters: { patient_id: patientId }, clinicId: clinic?.id,
  });
}

export async function createDoctorNote(note: Omit<DoctorNote, "id" | "created_at">, clinicId?: string) {
  const { data, error } = await (supabase.from("doctor_notes" as any) as any)
    .insert({ ...note, clinic_id: clinicId }).select().single();
  if (error) throw error;
  return data as DoctorNote;
}

// ─── Follow-ups ──────────────────────────────────────────────
export function useFollowUps(patientId?: string) {
  const { clinic } = useClinic();
  return useSupabaseQuery<FollowUp>("follow_ups", {
    orderBy: "follow_up_date", ascending: true,
    filters: patientId ? { patient_id: patientId } : undefined,
    clinicId: clinic?.id,
  });
}

export async function createFollowUp(followUp: Omit<FollowUp, "id" | "created_at" | "notified">, clinicId?: string) {
  const { data, error } = await (supabase.from("follow_ups" as any) as any)
    .insert({ ...followUp, clinic_id: clinicId }).select().single();
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
  const { clinic } = useClinic();
  return useSupabaseQuery<PatientRating>("patient_ratings", {
    orderBy: "created_at",
    filters: patientId ? { patient_id: patientId } : undefined,
    clinicId: clinic?.id,
  });
}

export async function createRating(rating: Omit<PatientRating, "id" | "created_at">, clinicId?: string) {
  const { data, error } = await (supabase.from("patient_ratings" as any) as any)
    .insert({ ...rating, clinic_id: clinicId }).select().single();
  if (error) throw error;
  return data as PatientRating;
}

// ─── Visits ──────────────────────────────────────────────────
export function useVisits(patientId?: string) {
  const { clinic } = useClinic();
  return useSupabaseQuery<Visit>("visits", {
    orderBy: "date",
    filters: patientId ? { patient_id: patientId } : undefined,
    clinicId: clinic?.id,
  });
}

export function useAllVisits() {
  const { clinic } = useClinic();
  return useSupabaseQuery<Visit>("visits", { orderBy: "date", clinicId: clinic?.id });
}

export async function createVisit(visit: Omit<Visit, "id" | "created_at">, clinicId?: string) {
  const { data, error } = await (supabase.from("visits" as any) as any)
    .insert({ ...visit, clinic_id: clinicId }).select().single();
  if (error) throw error;
  return data as Visit;
}

export async function updateVisit(id: string, updates: Partial<Visit>) {
  const { error } = await (supabase.from("visits" as any) as any)
    .update(updates).eq("id", id);
  if (error) throw error;
}

// ─── Visit Services ──────────────────────────────────────────
export function useVisitServices(visitId: string) {
  const { clinic } = useClinic();
  return useSupabaseQuery<VisitService>("visit_services", {
    filters: { visit_id: visitId }, clinicId: clinic?.id,
  });
}

export async function addVisitService(vs: Omit<VisitService, "id" | "created_at">, clinicId?: string) {
  const { data, error } = await (supabase.from("visit_services" as any) as any)
    .insert({ ...vs, clinic_id: clinicId }).select().single();
  if (error) throw error;
  return data as VisitService;
}

// ─── Payments ────────────────────────────────────────────────
export function usePayments(patientId?: string) {
  const { clinic } = useClinic();
  return useSupabaseQuery<Payment>("payments", {
    orderBy: "created_at",
    filters: patientId ? { patient_id: patientId } : undefined,
    clinicId: clinic?.id,
  });
}

export function useAllPayments() {
  const { clinic } = useClinic();
  return useSupabaseQuery<Payment>("payments", { orderBy: "created_at", clinicId: clinic?.id });
}

export async function createPayment(payment: Omit<Payment, "id" | "created_at">, clinicId?: string) {
  const { data, error } = await (supabase.from("payments" as any) as any)
    .insert({ ...payment, clinic_id: clinicId }).select().single();
  if (error) throw error;
  return data as Payment;
}

// ─── Therapy Sessions ────────────────────────────────────────
export function useTherapySessions(patientId?: string) {
  const { clinic } = useClinic();
  return useSupabaseQuery<TherapySession>("therapy_sessions", {
    orderBy: "session_date", ascending: true,
    filters: patientId ? { patient_id: patientId } : undefined,
    clinicId: clinic?.id,
  });
}

export async function createTherapySession(session: Omit<TherapySession, "id" | "created_at">, clinicId?: string) {
  const { data, error } = await (supabase.from("therapy_sessions" as any) as any)
    .insert({ ...session, clinic_id: clinicId }).select().single();
  if (error) throw error;
  return data as TherapySession;
}

export async function updateTherapySession(id: string, updates: Partial<TherapySession>) {
  const { error } = await (supabase.from("therapy_sessions" as any) as any)
    .update(updates).eq("id", id);
  if (error) throw error;
}
