import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  User, FileText, FlaskConical, Image, Pill, Calendar, Clock,
  Activity, Loader2, Download, Star, Stethoscope, LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useAllAppointments, usePrescriptions, usePatientRatings, getSignedFileUrl } from "@/hooks/useSupabaseData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const anim = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25 } };

export default function PatientPortal() {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "files" | "prescriptions" | "sessions">("overview");
  const [patientData, setPatientData] = useState<any>(null);
  const [patientFiles, setPatientFiles] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: appointments } = useAllAppointments();
  const { data: prescriptions } = usePrescriptions();

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!profile?.phone) {
        setLoading(false);
        return;
      }
      try {
        // Find patient by phone number from profile
        const { data: patient } = await (supabase.from("patients" as any) as any)
          .select("*").eq("phone", profile.phone).single();
        if (patient) {
          setPatientData(patient);
          // Fetch files
          const { data: files } = await (supabase.from("patient_files" as any) as any)
            .select("*").eq("patient_id", patient.id).order("created_at", { ascending: false });
          setPatientFiles(files || []);
          // Fetch visits
          const { data: vsts } = await (supabase.from("visits" as any) as any)
            .select("*").eq("patient_id", patient.id).order("date", { ascending: false });
          setVisits(vsts || []);
          // Fetch therapy sessions
          const { data: sess } = await (supabase.from("therapy_sessions" as any) as any)
            .select("*").eq("patient_id", patient.id).order("session_date", { ascending: true });
          setSessions(sess || []);
        }
      } catch (err: any) {
        console.error("Error fetching patient data:", err);
      }
      setLoading(false);
    };
    fetchPatientData();
  }, [profile?.phone]);

  const myAppointments = appointments.filter(a =>
    patientData && a.patient_id === patientData.id
  );

  const myPrescriptions = prescriptions.filter(p =>
    patientData && p.patient_id === patientData.id
  );

  const handleDownload = async (filePath: string) => {
    try {
      const url = await getSignedFileUrl(filePath);
      window.open(url, "_blank");
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!patientData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <div className="clinic-card p-8 max-w-md text-center">
          <User className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">لم يتم العثور على ملفك الطبي</h2>
          <p className="text-sm text-muted-foreground mb-4">تأكد من أن رقم هاتفك مسجل في ملفك الشخصي ومطابق لسجلات العيادة</p>
          <Button variant="outline" onClick={signOut}>تسجيل الخروج</Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "overview" as const, label: "نظرة عامة", icon: Activity },
    { key: "history" as const, label: "الزيارات", icon: Calendar },
    { key: "files" as const, label: "الملفات", icon: FlaskConical },
    { key: "prescriptions" as const, label: "الوصفات", icon: Pill },
    { key: "sessions" as const, label: "الجلسات", icon: Stethoscope },
  ];

  return (
    <motion.div {...anim} className="space-y-5">
      {/* Patient Header */}
      <div className="clinic-card p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
              {patientData.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">{patientData.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {patientData.age && `${patientData.age} سنة`} · {patientData.phone}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={signOut} className="gap-1.5">
            <LogOut className="h-3.5 w-3.5" />خروج
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "الزيارات", value: visits.length, icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
              { label: "الملفات", value: patientFiles.length, icon: FileText, color: "text-accent", bg: "bg-accent/10" },
              { label: "الوصفات", value: myPrescriptions.length, icon: Pill, color: "text-success", bg: "bg-success/10" },
              { label: "الجلسات", value: sessions.length, icon: Stethoscope, color: "text-warning", bg: "bg-warning/10" },
            ].map((stat, i) => (
              <div key={i} className="clinic-card p-4">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="text-lg font-bold text-foreground font-en">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Medical Info */}
          <div className="clinic-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">معلوماتك الطبية</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground">التاريخ المرضي</p>
                <p className="text-sm">{patientData.medical_history || "لا يوجد"}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">الحساسية</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {patientData.allergies?.length > 0 ? patientData.allergies.map((a: string, i: number) => (
                    <Badge key={i} variant="destructive" className="text-[9px]">{a}</Badge>
                  )) : <span className="text-sm">لا يوجد</span>}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">الأدوية الحالية</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {patientData.current_medications?.length > 0 ? patientData.current_medications.map((m: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-[9px] font-en">{m}</Badge>
                  )) : <span className="text-sm">لا يوجد</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="clinic-card">
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">المواعيد القادمة</h2>
            </div>
            {myAppointments.filter(a => a.date >= new Date().toISOString().split("T")[0] && a.status !== "cancelled").length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">لا توجد مواعيد قادمة</div>
            ) : (
              <div className="divide-y divide-border">
                {myAppointments.filter(a => a.date >= new Date().toISOString().split("T")[0] && a.status !== "cancelled").map(apt => (
                  <div key={apt.id} className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground font-en">{apt.date}</p>
                      <p className="text-[10px] text-muted-foreground font-en">{apt.time?.substring(0, 5)} · {apt.doctor}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{apt.status === "scheduled" ? "مجدول" : apt.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visits History */}
      {activeTab === "history" && (
        <div className="clinic-card">
          {visits.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">لا توجد زيارات سابقة</div>
          ) : (
            <div className="divide-y divide-border">
              {visits.map(visit => (
                <div key={visit.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground font-en">{visit.date}</p>
                    <Badge variant={visit.status === "completed" ? "default" : "secondary"} className="text-[10px]">
                      {visit.status === "completed" ? "مكتمل" : visit.status === "pending" ? "قيد الانتظار" : visit.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {visit.visit_type === "diagnostic" ? "تشخيصي" : visit.visit_type === "treatment" ? "علاجي" : visit.visit_type}
                  </p>
                  {visit.diagnosis && <p className="text-xs text-foreground mt-1">التشخيص: {visit.diagnosis}</p>}
                  {visit.doctor_notes && <p className="text-xs text-muted-foreground mt-1">{visit.doctor_notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Files */}
      {activeTab === "files" && (
        <div className="clinic-card">
          {patientFiles.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">لا توجد ملفات</div>
          ) : (
            <div className="divide-y divide-border">
              {patientFiles.map(file => (
                <div key={file.id} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {file.file_type === "lab" ? <FlaskConical className="h-4 w-4 text-primary" /> :
                     file.file_type === "radiology" ? <Image className="h-4 w-4 text-primary" /> :
                     <FileText className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.file_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-[9px]">
                        {file.file_type === "lab" ? "تحليل" : file.file_type === "radiology" ? "أشعة" : file.file_type}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-en">{new Date(file.created_at).toLocaleDateString("ar-SA")}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleDownload(file.file_path)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Prescriptions */}
      {activeTab === "prescriptions" && (
        <div className="clinic-card">
          {myPrescriptions.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">لا توجد وصفات</div>
          ) : (
            <div className="divide-y divide-border">
              {myPrescriptions.map(rx => (
                <div key={rx.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground font-en">{rx.date}</p>
                  </div>
                  {rx.doctor_notes && <p className="text-xs text-muted-foreground mb-2">{rx.doctor_notes}</p>}
                  {rx.medications && rx.medications.length > 0 && (
                    <div className="space-y-1.5">
                      {rx.medications.map(med => (
                        <div key={med.id} className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
                          <Pill className="h-3.5 w-3.5 text-success shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-foreground">{med.name}</p>
                            <p className="text-[10px] text-muted-foreground">{[med.dosage, med.duration].filter(Boolean).join(" · ")}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Therapy Sessions */}
      {activeTab === "sessions" && (
        <div className="clinic-card">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">لا توجد جلسات علاجية</div>
          ) : (
            <div className="divide-y divide-border">
              {sessions.map(session => (
                <div key={session.id} className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    session.status === "completed" ? "bg-success/10" : "bg-warning/10"
                  }`}>
                    <Stethoscope className={`h-4 w-4 ${session.status === "completed" ? "text-success" : "text-warning"}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      جلسة {session.session_number} من {session.total_sessions}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-en">{session.session_date}</p>
                    {session.notes && <p className="text-[10px] text-muted-foreground mt-0.5">{session.notes}</p>}
                  </div>
                  <Badge variant={session.status === "completed" ? "default" : "secondary"} className="text-[10px]">
                    {session.status === "completed" ? "مكتمل" : "مجدول"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
