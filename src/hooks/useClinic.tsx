import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Clinic {
  id: string;
  name: string;
  name_en: string | null;
  slug: string;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  subscription_plan: string;
  subscription_status: string;
  max_users: number;
  owner_id: string | null;
  settings: Record<string, any>;
  created_at: string;
}

interface ClinicContextType {
  clinic: Clinic | null;
  clinics: Clinic[];
  loading: boolean;
  switchClinic: (clinicId: string) => void;
  refetchClinics: () => Promise<void>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClinics = useCallback(async () => {
    if (!user) {
      setClinics([]);
      setClinic(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Get user's clinic memberships
      const { data: members, error: mErr } = await (supabase.from("clinic_members" as any) as any)
        .select("clinic_id")
        .eq("user_id", user.id)
        .eq("is_active", true);
      
      if (mErr) throw mErr;
      
      const clinicIds = (members || []).map((m: any) => m.clinic_id);
      
      if (clinicIds.length === 0) {
        // Fallback: try to get default clinic for existing users
        const { data: defaultClinic } = await (supabase.from("clinics" as any) as any)
          .select("*")
          .eq("slug", "default-clinic")
          .single();
        
        if (defaultClinic) {
          // Auto-add user to default clinic
          await (supabase.from("clinic_members" as any) as any)
            .insert({ clinic_id: defaultClinic.id, user_id: user.id, role: "staff" });
          setClinics([defaultClinic as Clinic]);
          setClinic(defaultClinic as Clinic);
        }
      } else {
        const { data: clinicData, error: cErr } = await (supabase.from("clinics" as any) as any)
          .select("*")
          .in("id", clinicIds);
        
        if (cErr) throw cErr;
        setClinics((clinicData || []) as Clinic[]);
        
        // Restore last selected clinic or pick first
        const lastClinicId = localStorage.getItem(`clinic_${user.id}`);
        const selected = (clinicData || []).find((c: any) => c.id === lastClinicId) || (clinicData || [])[0];
        setClinic(selected as Clinic || null);
      }
    } catch (err) {
      console.error("Error fetching clinics:", err);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchClinics(); }, [fetchClinics]);

  const switchClinic = useCallback((clinicId: string) => {
    const found = clinics.find(c => c.id === clinicId);
    if (found && user) {
      setClinic(found);
      localStorage.setItem(`clinic_${user.id}`, clinicId);
    }
  }, [clinics, user]);

  return (
    <ClinicContext.Provider value={{ clinic, clinics, loading, switchClinic, refetchClinics: fetchClinics }}>
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic must be used within ClinicProvider");
  return ctx;
}
