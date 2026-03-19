import { useState, useMemo, useEffect, useCallback } from "react";
import jsPDF from "jspdf";
import { motion } from "framer-motion";
import {
  User, FileText, FlaskConical, Image, Pill, Calendar, Clock,
  Activity, Loader2, Download, Star, Stethoscope, LogOut, CalendarPlus, Check, Bell, BellDot,
  QrCode, Gift, Users, TrendingUp, ClipboardList, Repeat, Heart, Send, Mic, ChevronRight, Wallet,
  UserPlus, DollarSign, CreditCard, CalendarCheck, MapPin
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useAllAppointments, usePrescriptions, usePatientRatings, getSignedFileUrl, createAppointment } from "@/hooks/useSupabaseData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { QRCodeSVG } from "qrcode.react";

const anim = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25 } };

type TabKey = "overview" | "journey" | "payments" | "booking" | "history" | "files" | "prescriptions" | "sessions" | "notifications" | "medical-card" | "loyalty" | "referral" | "treatment-plan" | "progress" | "pre-visit" | "feedback" | "ai-assistant";

export default function PatientPortal() {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [patientData, setPatientData] = useState<any>(null);
  const [patientFiles, setPatientFiles] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loyaltyData, setLoyaltyData] = useState<any>(null);
  const [loyaltyHistory, setLoyaltyHistory] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<any[]>([]);
  const [treatmentSteps, setTreatmentSteps] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [preVisitForms, setPreVisitForms] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: appointments } = useAllAppointments();
  const { data: prescriptions } = usePrescriptions();

  useEffect(() => {
    const fetchAll = async () => {
      if (!profile?.phone) { setLoading(false); return; }
      try {
        const { data: patient } = await (supabase.from("patients" as any) as any)
          .select("*").eq("phone", profile.phone).single();
        if (patient) {
          setPatientData(patient);
          const pid = patient.id;
          const cid = patient.clinic_id;

          // Parallel fetches
          const [filesRes, visitsRes, sessRes, loyaltyRes, loyaltyTxRes, referralsRes, plansRes, progressRes, formsRes, paymentsRes] = await Promise.all([
            (supabase.from("patient_files" as any) as any).select("*").eq("patient_id", pid).order("created_at", { ascending: false }),
            (supabase.from("visits" as any) as any).select("*").eq("patient_id", pid).order("date", { ascending: false }),
            (supabase.from("therapy_sessions" as any) as any).select("*").eq("patient_id", pid).order("session_date", { ascending: true }),
            (supabase.from("loyalty_points" as any) as any).select("*").eq("patient_id", pid).single(),
            (supabase.from("loyalty_transactions" as any) as any).select("*").eq("patient_id", pid).order("created_at", { ascending: false }).limit(20),
            (supabase.from("referrals" as any) as any).select("*").eq("referrer_patient_id", pid).order("created_at", { ascending: false }),
            (supabase.from("treatment_plans" as any) as any).select("*").eq("patient_id", pid).order("created_at", { ascending: false }),
            (supabase.from("patient_progress" as any) as any).select("*").eq("patient_id", pid).order("date", { ascending: true }),
            (supabase.from("pre_visit_forms" as any) as any).select("*").eq("patient_id", pid).order("created_at", { ascending: false }),
            (supabase.from("payments" as any) as any).select("*").eq("patient_id", pid).order("created_at", { ascending: false }),
          ]);

          setPatientFiles(filesRes.data || []);
          setVisits(visitsRes.data || []);
          setSessions(sessRes.data || []);
          setLoyaltyData(loyaltyRes.data);
          setLoyaltyHistory(loyaltyTxRes.data || []);
          setReferrals(referralsRes.data || []);
          setTreatmentPlans(plansRes.data || []);
          setProgressData(progressRes.data || []);
          setPreVisitForms(formsRes.data || []);
          setPayments(paymentsRes.data || []);

          // Fetch treatment steps for all plans
          if (plansRes.data?.length) {
            const planIds = plansRes.data.map((p: any) => p.id);
            const { data: steps } = await (supabase.from("treatment_plan_steps" as any) as any)
              .select("*").in("plan_id", planIds).order("step_number", { ascending: true });
            setTreatmentSteps(steps || []);
          }
        }
      } catch (err: any) {
        console.error("Error:", err);
      }
      setLoading(false);
    };
    const fetchNotifications = async () => {
      if (!user?.id) return;
      const { data } = await supabase.from("notifications").select("*")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
      setNotifications(data || []);
    };
    fetchAll();
    fetchNotifications();

    // Realtime notifications
    if (user?.id) {
      const channel = supabase
        .channel("patient-notifications")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          (payload) => setNotifications(prev => [payload.new as any, ...prev]))
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [profile?.phone, user?.id]);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };
  const markAllRead = async () => {
    if (!user?.id) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const myAppointments = appointments.filter(a => patientData && a.patient_id === patientData.id);
  const myPrescriptions = prescriptions.filter(p => patientData && p.patient_id === patientData.id);
  const lastAppointment = myAppointments.filter(a => a.status !== "cancelled").sort((a, b) => b.date.localeCompare(a.date))[0];
  const totalPaid = payments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
  const totalRemaining = payments.reduce((sum: number, p: any) => sum + (Number(p.remaining_amount) || 0), 0);

  const downloadPrescriptionPDF = (rx: any, patient: any) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });
    const w = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Medical Prescription", w / 2, 15, { align: "center" });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${rx.date || "N/A"}`, w - 10, 25, { align: "right" });
    
    // Patient info
    doc.setDrawColor(200);
    doc.line(10, 30, w - 10, 30);
    doc.setFontSize(10);
    doc.text(`Patient: ${patient.name}`, 10, 37);
    doc.text(`Phone: ${patient.phone}`, 10, 43);
    if (patient.age) doc.text(`Age: ${patient.age}`, w - 10, 37, { align: "right" });
    
    doc.line(10, 47, w - 10, 47);
    
    // Medications
    let y = 55;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Medications:", 10, y);
    y += 8;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    if (rx.medications && rx.medications.length > 0) {
      rx.medications.forEach((med: any, i: number) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${i + 1}. ${med.name}`, 12, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const details = [med.dosage, med.duration, med.notes].filter(Boolean).join(" | ");
        if (details) { doc.text(`   ${details}`, 14, y); y += 5; }
        doc.setFontSize(10);
        y += 2;
      });
    }
    
    // Doctor notes
    if (rx.doctor_notes) {
      y += 5;
      doc.line(10, y, w - 10, y);
      y += 7;
      doc.setFont("helvetica", "bold");
      doc.text("Notes:", 10, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(rx.doctor_notes, w - 24);
      doc.text(lines, 12, y);
    }
    
    doc.save(`prescription-${rx.date || "rx"}.pdf`);
  };

  const handleDownload = async (filePath: string) => {
      const url = await getSignedFileUrl(filePath);
      window.open(url, "_blank");
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
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

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: "overview", label: "نظرة عامة", icon: Activity },
    { key: "journey", label: "رحلة المريض", icon: MapPin },
    { key: "payments", label: "المدفوعات", icon: Wallet },
    { key: "booking", label: "حجز موعد", icon: CalendarPlus },
    { key: "pre-visit", label: "نموذج ما قبل الزيارة", icon: ClipboardList },
    { key: "history", label: "الزيارات", icon: Calendar },
    { key: "files", label: "الملفات", icon: FlaskConical },
    { key: "prescriptions", label: "الوصفات", icon: Pill },
    { key: "treatment-plan", label: "خطة العلاج", icon: TrendingUp },
    { key: "progress", label: "تتبع التقدم", icon: Heart },
    { key: "sessions", label: "الجلسات", icon: Stethoscope },
    { key: "medical-card", label: "البطاقة الطبية", icon: QrCode },
    { key: "loyalty", label: "نقاط الولاء", icon: Gift },
    { key: "referral", label: "دعوة صديق", icon: Users },
    { key: "feedback", label: "تقييم الزيارة", icon: Star },
    { key: "ai-assistant", label: "مساعد صحي", icon: Mic },
    { key: "notifications", label: "الإشعارات", icon: Bell },
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
              {loyaltyData && (
                <div className="flex items-center gap-1 mt-1">
                  <Gift className="h-3 w-3 text-amber-500" />
                  <span className="text-[10px] font-bold text-amber-500">{loyaltyData.total_points - loyaltyData.redeemed_points} نقطة</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab("notifications")} className="relative p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
              {unreadCount > 0 ? <BellDot className="h-4.5 w-4.5 text-primary" /> : <Bell className="h-4.5 w-4.5" />}
              {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">{unreadCount}</span>}
            </button>
            <Button variant="outline" size="sm" onClick={signOut} className="gap-1.5"><LogOut className="h-3.5 w-3.5" />خروج</Button>
          </div>
        </div>
      </div>

      {/* Tabs - scrollable */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}>
            <tab.icon className="h-3.5 w-3.5" />{tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "الزيارات", value: visits.length, icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
              { label: "إجمالي المدفوع", value: `${totalPaid.toLocaleString()} ج.م`, icon: Wallet, color: "text-success", bg: "bg-success/10" },
              { label: "المتبقي", value: `${totalRemaining.toLocaleString()} ج.م`, icon: Wallet, color: "text-destructive", bg: "bg-destructive/10" },
              { label: "الوصفات", value: myPrescriptions.length, icon: Pill, color: "text-accent", bg: "bg-accent/10" },
            ].map((stat, i) => (
              <div key={i} className="clinic-card p-4">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}><stat.icon className={`h-4 w-4 ${stat.color}`} /></div>
                <p className="text-lg font-bold text-foreground font-en">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* One-Click Rebooking */}
          {lastAppointment && (
            <div className="clinic-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Repeat className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">إعادة حجز سريع</p>
                  <p className="text-[10px] text-muted-foreground">نفس الطبيب ({lastAppointment.doctor || "غير محدد"}) · {lastAppointment.visit_type === "consultation" ? "كشف" : "متابعة"}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setActiveTab("booking")} className="gap-1.5">
                  <Repeat className="h-3.5 w-3.5" />حجز
                </Button>
              </div>
            </div>
          )}

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

          {/* Latest Prescription */}
          {myPrescriptions.length > 0 && (() => {
            const latest = myPrescriptions.sort((a, b) => (b.date || b.created_at || "").localeCompare(a.date || a.created_at || ""))[0];
            return (
              <div className="clinic-card p-4 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setActiveTab("prescriptions")}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Pill className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">آخر وصفة طبية</p>
                    <p className="text-[10px] text-muted-foreground font-en">{latest.date || latest.created_at?.split("T")[0]}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                {latest.medications && latest.medications.length > 0 && (
                  <div className="space-y-1.5">
                    {latest.medications.slice(0, 3).map((med: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span className="font-medium text-foreground">{med.name}</span>
                        {med.dosage && <span className="text-muted-foreground">· {med.dosage}</span>}
                        {med.duration && <span className="text-muted-foreground">· {med.duration}</span>}
                      </div>
                    ))}
                    {latest.medications.length > 3 && (
                      <p className="text-[10px] text-muted-foreground mr-3.5">+{latest.medications.length - 3} أدوية أخرى</p>
                    )}
                  </div>
                )}
                {latest.doctor_notes && (
                  <p className="text-[10px] text-muted-foreground mt-2 border-t border-border pt-2">ملاحظات: {latest.doctor_notes}</p>
                )}
              </div>
            );
          })()}

          {/* Upcoming Appointments */}
          <div className="clinic-card">
            <div className="p-4 border-b border-border"><h2 className="text-sm font-semibold text-foreground">المواعيد القادمة</h2></div>
            {myAppointments.filter(a => a.date >= new Date().toISOString().split("T")[0] && a.status !== "cancelled").length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">لا توجد مواعيد قادمة</div>
            ) : (
              <div className="divide-y divide-border">
                {myAppointments.filter(a => a.date >= new Date().toISOString().split("T")[0] && a.status !== "cancelled").map(apt => (
                  <div key={apt.id} className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Calendar className="h-4 w-4 text-primary" /></div>
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

      {/* ── Patient Journey ── */}
      {activeTab === "journey" && (
        <PatientJourneyTab visits={visits} />
      )}

      {/* ── Payments ── */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="clinic-card p-4 text-center">
              <Wallet className="h-5 w-5 text-success mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground font-en">{totalPaid.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">إجمالي المدفوع (ج.م)</p>
            </div>
            <div className="clinic-card p-4 text-center">
              <Wallet className="h-5 w-5 text-destructive mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground font-en">{totalRemaining.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">المتبقي (ج.م)</p>
            </div>
          </div>

          {/* Manual Payment Notice */}
          {totalRemaining > 0 && (
            <div className="clinic-card p-4 border-r-4 border-r-warning">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                  <DollarSign className="h-5 w-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">لديك مبلغ متبقي: <span className="font-en text-destructive">{totalRemaining.toLocaleString()} ج.م</span></p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">يمكنك الدفع نقداً في العيادة أو عبر التحويل البنكي</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => {
                  const msg = `مرحباً، أود تسديد المبلغ المتبقي (${totalRemaining.toLocaleString()} ج.م) - ${patientData.name}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
                }}>
                  <Send className="h-3.5 w-3.5" />
                  تواصل لترتيب الدفع
                </Button>
              </div>
            </div>
          )}

          {/* Visa Coming Soon */}
          <div className="clinic-card p-4 bg-gradient-to-l from-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">الدفع بفيزا / ماستركارد</p>
                  <Badge className="text-[9px] bg-accent/10 text-accent border-accent/20">قريباً</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">نعمل على إتاحة الدفع الإلكتروني ببطاقات الائتمان قريباً</p>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="clinic-card">
            <div className="p-4 border-b border-border"><h2 className="text-sm font-semibold text-foreground">سجل المدفوعات</h2></div>
            {payments.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground">لا توجد مدفوعات</div> : (
              <div className="divide-y divide-border">
                {payments.map((pay: any) => (
                  <div key={pay.id} className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${Number(pay.remaining_amount) > 0 ? "bg-warning/10" : "bg-success/10"}`}>
                      <Wallet className={`h-4 w-4 ${Number(pay.remaining_amount) > 0 ? "text-warning" : "text-success"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground font-en">{Number(pay.amount).toLocaleString()} ج.م</p>
                        <Badge variant={Number(pay.remaining_amount) > 0 ? "secondary" : "default"} className="text-[9px]">
                          {Number(pay.remaining_amount) > 0 ? "جزئي" : "مكتمل"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground font-en">{new Date(pay.created_at).toLocaleDateString("ar-SA")}</span>
                        <span className="text-[10px] text-muted-foreground">· {pay.payment_method === "cash" ? "نقدي" : pay.payment_method === "card" ? "بطاقة" : pay.payment_method || "نقدي"}</span>
                      </div>
                      {Number(pay.remaining_amount) > 0 && (
                        <p className="text-[10px] text-destructive mt-0.5">متبقي: {Number(pay.remaining_amount).toLocaleString()} ج.م</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Visits History ── */}
      {activeTab === "history" && (
        <div className="clinic-card">
          {visits.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground">لا توجد زيارات سابقة</div> : (
            <div className="divide-y divide-border">
              {visits.map(visit => (
                <div key={visit.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground font-en">{visit.date}</p>
                    <Badge variant={visit.status === "completed" ? "default" : "secondary"} className="text-[10px]">
                      {visit.status === "completed" ? "مكتمل" : visit.status === "pending" ? "قيد الانتظار" : visit.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{visit.visit_type === "diagnostic" ? "تشخيصي" : visit.visit_type === "treatment" ? "علاجي" : visit.visit_type}</p>
                  {visit.diagnosis && <p className="text-xs text-foreground mt-1">التشخيص: {visit.diagnosis}</p>}
                  {visit.doctor_notes && <p className="text-xs text-muted-foreground mt-1">{visit.doctor_notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Files ── */}
      {activeTab === "files" && (
        <div className="clinic-card">
          {patientFiles.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground">لا توجد ملفات</div> : (
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
                      <Badge variant="secondary" className="text-[9px]">{file.file_type === "lab" ? "تحليل" : file.file_type === "radiology" ? "أشعة" : file.file_type}</Badge>
                      <span className="text-[10px] text-muted-foreground font-en">{new Date(file.created_at).toLocaleDateString("ar-SA")}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleDownload(file.file_path)}><Download className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Prescriptions ── */}
      {activeTab === "prescriptions" && (
        <div className="clinic-card">
          {myPrescriptions.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground">لا توجد وصفات</div> : (
            <div className="divide-y divide-border">
              {myPrescriptions.map(rx => (
                <div key={rx.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground font-en">{rx.date}</p>
                    <Button variant="outline" size="sm" className="gap-1.5 text-[10px] h-7" onClick={() => downloadPrescriptionPDF(rx, patientData)}>
                      <Download className="h-3 w-3" />تحميل PDF
                    </Button>
                  </div>
                  {rx.doctor_notes && <p className="text-xs text-muted-foreground mb-2">{rx.doctor_notes}</p>}
                  {rx.medications && rx.medications.length > 0 && (
                    <div className="space-y-1.5">
                      {rx.medications.map((med: any) => (
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

      {/* ── Sessions ── */}
      {activeTab === "sessions" && (
        <div className="clinic-card">
          {sessions.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground">لا توجد جلسات علاجية</div> : (
            <div className="divide-y divide-border">
              {sessions.map(session => (
                <div key={session.id} className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${session.status === "completed" ? "bg-success/10" : "bg-warning/10"}`}>
                    <Stethoscope className={`h-4 w-4 ${session.status === "completed" ? "text-success" : "text-warning"}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">جلسة {session.session_number} من {session.total_sessions}</p>
                    <p className="text-[10px] text-muted-foreground font-en">{session.session_date}</p>
                    {session.notes && <p className="text-[10px] text-muted-foreground mt-0.5">{session.notes}</p>}
                  </div>
                  <Badge variant={session.status === "completed" ? "default" : "secondary"} className="text-[10px]">{session.status === "completed" ? "مكتمل" : "مجدول"}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Booking ── */}
      {activeTab === "booking" && <BookingForm patientData={patientData} lastAppointment={lastAppointment} onSuccess={() => setActiveTab("overview")} />}

      {/* ── Pre-Visit Form ── */}
      {activeTab === "pre-visit" && <PreVisitFormTab patientData={patientData} appointments={myAppointments} preVisitForms={preVisitForms} onSubmit={(form) => setPreVisitForms(prev => [form, ...prev])} />}

      {/* ── Treatment Plan ── */}
      {activeTab === "treatment-plan" && <TreatmentPlanTab plans={treatmentPlans} steps={treatmentSteps} />}

      {/* ── Progress Tracking ── */}
      {activeTab === "progress" && <ProgressTab data={progressData} visits={visits} />}

      {/* ── Medical Card (QR) ── */}
      {activeTab === "medical-card" && <MedicalCardTab patient={patientData} />}

      {/* ── Loyalty ── */}
      {activeTab === "loyalty" && <LoyaltyTab loyalty={loyaltyData} history={loyaltyHistory} />}

      {/* ── Referral ── */}
      {activeTab === "referral" && <ReferralTab patientData={patientData} referrals={referrals} onAdd={(r) => setReferrals(prev => [r, ...prev])} />}

      {/* ── Feedback ── */}
      {activeTab === "feedback" && <FeedbackTab patientData={patientData} appointments={myAppointments} />}

      {/* ── AI Health Assistant ── */}
      {activeTab === "ai-assistant" && <AIHealthAssistantTab patientData={patientData} />}

      {/* ── Notifications with Appointment Confirmation ── */}
      {activeTab === "notifications" && (
        <NotificationsWithConfirmation
          notifications={notifications}
          unreadCount={unreadCount}
          markAsRead={markAsRead}
          markAllRead={markAllRead}
          patientData={patientData}
        />
      )}
    </motion.div>
  );
}

// ── Booking Form ──
function BookingForm({ patientData, lastAppointment, onSuccess }: { patientData: any; lastAppointment?: any; onSuccess: () => void }) {
  const { toast } = useToast();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [visitType, setVisitType] = useState(lastAppointment?.visit_type || "consultation");
  const [doctor, setDoctor] = useState(lastAppointment?.doctor || "");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) { toast({ title: "خطأ", description: "اختر التاريخ والوقت", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      await createAppointment({
        patient_id: patientData.id, patient_name: patientData.name, phone: patientData.phone,
        date, time, visit_type: visitType, notes: notes || null, doctor: doctor || null, status: "scheduled", created_by: null,
      }, patientData.clinic_id);
      toast({ title: "✅ تم حجز الموعد", description: `${date} الساعة ${time}` });
      setDate(""); setTime(""); setNotes(""); onSuccess();
    } catch (err: any) { toast({ title: "خطأ", description: err.message, variant: "destructive" }); }
    setSubmitting(false);
  };

  const timeSlots: string[] = [];
  for (let h = 9; h <= 21; h++) { timeSlots.push(`${String(h).padStart(2, "0")}:00`); timeSlots.push(`${String(h).padStart(2, "0")}:30`); }

  return (
    <div className="clinic-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><CalendarPlus className="h-4 w-4 text-primary" /></div>
        <div>
          <h2 className="text-sm font-bold text-foreground">حجز موعد جديد</h2>
          <p className="text-[10px] text-muted-foreground">اختر التاريخ والوقت المناسب</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">التاريخ</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} min={minDate} className="font-en" required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">الوقت</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger><SelectValue placeholder="اختر الوقت" /></SelectTrigger>
              <SelectContent>{timeSlots.map(t => <SelectItem key={t} value={t} className="font-en">{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">نوع الزيارة</Label>
          <Select value={visitType} onValueChange={setVisitType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="consultation">كشف جديد</SelectItem>
              <SelectItem value="follow_up">متابعة</SelectItem>
              <SelectItem value="urgent">طوارئ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {doctor && (
          <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            <span className="text-xs text-foreground">الطبيب: {doctor}</span>
          </div>
        )}
        <div className="space-y-1.5">
          <Label className="text-xs">ملاحظات (اختياري)</Label>
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="أي ملاحظات تريد إبلاغ العيادة بها..." className="text-sm" />
        </div>
        <Button type="submit" className="w-full gap-2" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}تأكيد الحجز
        </Button>
      </form>
    </div>
  );
}

// ── Pre-Visit Form ──
function PreVisitFormTab({ patientData, appointments, preVisitForms, onSubmit }: { patientData: any; appointments: any[]; preVisitForms: any[]; onSubmit: (f: any) => void }) {
  const { toast } = useToast();
  const [symptoms, setSymptoms] = useState("");
  const [complaints, setComplaints] = useState("");
  const [painLevel, setPainLevel] = useState(0);
  const [medUpdate, setMedUpdate] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [selectedAppt, setSelectedAppt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const upcomingAppts = appointments.filter(a => a.date >= new Date().toISOString().split("T")[0] && a.status !== "cancelled");

  const handleSubmit = async () => {
    if (!symptoms.trim() && !complaints.trim()) { toast({ title: "خطأ", description: "يرجى ملء الأعراض أو الشكوى", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const { data, error } = await (supabase.from("pre_visit_forms" as any) as any).insert({
        patient_id: patientData.id, appointment_id: selectedAppt || null, clinic_id: patientData.clinic_id,
        symptoms: symptoms.trim(), complaints: complaints.trim(), pain_level: painLevel,
        medical_history_update: medUpdate.trim() || null, additional_notes: additionalNotes.trim() || null,
        status: "filled", filled_at: new Date().toISOString(),
      }).select().single();
      if (error) throw error;
      toast({ title: "✅ تم إرسال النموذج", description: "سيراه الطبيب قبل الزيارة" });
      onSubmit(data);
      setSymptoms(""); setComplaints(""); setPainLevel(0); setMedUpdate(""); setAdditionalNotes("");
    } catch (err: any) { toast({ title: "خطأ", description: err.message, variant: "destructive" }); }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="clinic-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center"><ClipboardList className="h-4 w-4 text-accent" /></div>
          <div>
            <h2 className="text-sm font-bold text-foreground">نموذج ما قبل الزيارة</h2>
            <p className="text-[10px] text-muted-foreground">ساعد طبيبك بملء هذا النموذج قبل زيارتك</p>
          </div>
        </div>

        <div className="space-y-4">
          {upcomingAppts.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs">الموعد المرتبط (اختياري)</Label>
              <Select value={selectedAppt} onValueChange={setSelectedAppt}>
                <SelectTrigger><SelectValue placeholder="اختر الموعد" /></SelectTrigger>
                <SelectContent>
                  {upcomingAppts.map(a => <SelectItem key={a.id} value={a.id}>{a.date} - {a.time?.substring(0, 5)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">الأعراض *</Label>
            <Textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={2} placeholder="صف أعراضك الحالية..." />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">الشكوى الرئيسية *</Label>
            <Textarea value={complaints} onChange={e => setComplaints(e.target.value)} rows={2} placeholder="ما السبب الرئيسي لزيارتك؟" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">مستوى الألم (0-10)</Label>
            <div className="flex items-center gap-2">
              <input type="range" min="0" max="10" value={painLevel} onChange={e => setPainLevel(Number(e.target.value))}
                className="flex-1 accent-primary" />
              <span className={`text-sm font-bold w-8 text-center ${painLevel > 7 ? "text-destructive" : painLevel > 4 ? "text-warning" : "text-success"}`}>{painLevel}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">تحديث الأدوية (اختياري)</Label>
            <Textarea value={medUpdate} onChange={e => setMedUpdate(e.target.value)} rows={2} placeholder="أي تغيير في أدويتك الحالية؟" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">ملاحظات إضافية</Label>
            <Textarea value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)} rows={2} placeholder="أي شيء آخر تريد إخبار الطبيب به..." />
          </div>
          <Button onClick={handleSubmit} className="w-full gap-2" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}إرسال النموذج
          </Button>
        </div>
      </div>

      {/* Previous Forms */}
      {preVisitForms.length > 0 && (
        <div className="clinic-card">
          <div className="p-4 border-b border-border"><h2 className="text-sm font-semibold text-foreground">النماذج السابقة</h2></div>
          <div className="divide-y divide-border">
            {preVisitForms.map(form => (
              <div key={form.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground font-en">{new Date(form.created_at).toLocaleDateString("ar-SA")}</span>
                  <Badge variant={form.status === "filled" ? "default" : "secondary"} className="text-[9px]">{form.status === "filled" ? "مُرسل" : "معلق"}</Badge>
                </div>
                {form.symptoms && <p className="text-xs text-foreground">الأعراض: {form.symptoms}</p>}
                {form.complaints && <p className="text-xs text-muted-foreground mt-1">الشكوى: {form.complaints}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Treatment Plan ──
function TreatmentPlanTab({ plans, steps }: { plans: any[]; steps: any[] }) {
  if (plans.length === 0) {
    return (
      <div className="clinic-card p-8 text-center">
        <TrendingUp className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">لا توجد خطة علاج حالياً</p>
        <p className="text-[10px] text-muted-foreground mt-1">سيقوم طبيبك بإنشاء خطة علاج لك عند الحاجة</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {plans.map(plan => {
        const planSteps = steps.filter(s => s.plan_id === plan.id);
        const completedSteps = planSteps.filter(s => s.status === "completed").length;
        const progress = planSteps.length > 0 ? (completedSteps / planSteps.length) * 100 : 0;

        return (
          <div key={plan.id} className="clinic-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">{plan.title}</h3>
              <Badge variant={plan.status === "active" ? "default" : "secondary"} className="text-[9px]">
                {plan.status === "active" ? "نشط" : plan.status === "completed" ? "مكتمل" : plan.status}
              </Badge>
            </div>
            {plan.description && <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>}

            <div className="mb-3">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                <span>التقدم</span>
                <span className="font-en">{completedSteps}/{planSteps.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-2">
              {planSteps.map((step, i) => (
                <div key={step.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    step.status === "completed" ? "bg-success/20 text-success" :
                    step.status === "in_progress" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {step.status === "completed" ? <Check className="h-4 w-4" /> : step.step_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${step.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"}`}>{step.title}</p>
                    {step.description && <p className="text-[10px] text-muted-foreground">{step.description}</p>}
                    {step.scheduled_date && <p className="text-[9px] text-muted-foreground font-en mt-0.5">{step.scheduled_date}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Progress Tracking ──
function ProgressTab({ data, visits }: { data: any[]; visits: any[] }) {
  const visitsByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    visits.forEach(v => {
      const month = v.date.substring(0, 7);
      map[month] = (map[month] || 0) + 1;
    });
    return Object.entries(map).sort().slice(-6);
  }, [visits]);

  return (
    <div className="space-y-4">
      {/* Visit Frequency */}
      <div className="clinic-card p-5">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />تتبع الزيارات
        </h3>
        {visitsByMonth.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">لا توجد بيانات كافية</p>
        ) : (
          <div className="space-y-2">
            {visitsByMonth.map(([month, count]) => (
              <div key={month} className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground font-en w-16">{month}</span>
                <div className="flex-1 h-6 bg-muted rounded-lg overflow-hidden">
                  <div className="h-full bg-primary/20 rounded-lg flex items-center px-2" style={{ width: `${Math.min(count * 20, 100)}%` }}>
                    <span className="text-[10px] font-bold text-primary">{count} زيارة</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress Metrics */}
      {data.length > 0 && (
        <div className="clinic-card p-5">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4 text-destructive" />مؤشرات التقدم
          </h3>
          <div className="space-y-3">
            {data.slice(-10).map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div>
                  <p className="text-xs font-medium text-foreground">{entry.metric_type}</p>
                  <p className="text-[10px] text-muted-foreground font-en">{entry.date}</p>
                </div>
                <span className="text-sm font-bold text-primary font-en">{entry.metric_value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Medical Card with QR ──
function MedicalCardTab({ patient }: { patient: any }) {
  const qrData = JSON.stringify({
    id: patient.id,
    name: patient.name,
    phone: patient.phone,
    age: patient.age,
    allergies: patient.allergies,
    blood_type: patient.medical_history,
  });

  return (
    <div className="space-y-4">
      <div className="clinic-card p-6 text-center">
        <h2 className="text-sm font-bold text-foreground mb-4">البطاقة الطبية الرقمية</h2>
        <div className="inline-block p-4 bg-white rounded-2xl shadow-lg">
          <QRCodeSVG value={qrData} size={200} level="M" includeMargin />
        </div>
        <p className="text-xs text-muted-foreground mt-4">امسح الرمز للوصول السريع لملفك الطبي</p>
      </div>

      <div className="clinic-card p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
            {patient.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">{patient.name}</h3>
            <p className="text-xs text-muted-foreground font-en">{patient.phone}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-muted/50">
            <p className="text-[10px] text-muted-foreground">العمر</p>
            <p className="font-medium text-foreground">{patient.age || "-"} سنة</p>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/50">
            <p className="text-[10px] text-muted-foreground">الجنس</p>
            <p className="font-medium text-foreground">{patient.gender === "male" ? "ذكر" : "أنثى"}</p>
          </div>
          <div className="col-span-2 p-2.5 rounded-lg bg-destructive/5 border border-destructive/20">
            <p className="text-[10px] text-destructive font-semibold">الحساسية</p>
            <p className="font-medium text-destructive">{patient.allergies?.length > 0 ? patient.allergies.join("، ") : "لا يوجد"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Loyalty Points ──
function LoyaltyTab({ loyalty, history }: { loyalty: any; history: any[] }) {
  const available = loyalty ? loyalty.total_points - loyalty.redeemed_points : 0;

  return (
    <div className="space-y-4">
      <div className="clinic-card p-6 text-center bg-gradient-to-br from-amber-500/10 to-orange-500/10">
        <Gift className="h-10 w-10 text-amber-500 mx-auto mb-2" />
        <p className="text-3xl font-bold text-foreground font-en">{available}</p>
        <p className="text-xs text-muted-foreground">نقطة متاحة</p>
        {loyalty && (
          <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-muted-foreground">
            <span>إجمالي: <strong className="font-en">{loyalty.total_points}</strong></span>
            <span>مستخدم: <strong className="font-en">{loyalty.redeemed_points}</strong></span>
          </div>
        )}
      </div>

      <div className="clinic-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">كيف تكسب النقاط؟</h3>
        <div className="space-y-2">
          {[
            { label: "كل زيارة", points: "+10", icon: Calendar },
            { label: "تقييم بعد الزيارة", points: "+5", icon: Star },
            { label: "دعوة صديق", points: "+50", icon: Users },
            { label: "ملء نموذج ما قبل الزيارة", points: "+5", icon: ClipboardList },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
              <item.icon className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-foreground flex-1">{item.label}</span>
              <span className="text-xs font-bold text-amber-500 font-en">{item.points}</span>
            </div>
          ))}
        </div>
      </div>

      {history.length > 0 && (
        <div className="clinic-card">
          <div className="p-4 border-b border-border"><h3 className="text-sm font-semibold text-foreground">سجل النقاط</h3></div>
          <div className="divide-y divide-border">
            {history.map(tx => (
              <div key={tx.id} className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-foreground">{tx.reason || (tx.type === "earn" ? "كسب نقاط" : "استخدام نقاط")}</p>
                  <p className="text-[10px] text-muted-foreground font-en">{new Date(tx.created_at).toLocaleDateString("ar-SA")}</p>
                </div>
                <span className={`text-sm font-bold font-en ${tx.type === "earn" ? "text-success" : "text-destructive"}`}>
                  {tx.type === "earn" ? "+" : "-"}{Math.abs(tx.points)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Referral System ──
function ReferralTab({ patientData, referrals, onAdd }: { patientData: any; referrals: any[]; onAdd: (r: any) => void }) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) { toast({ title: "خطأ", description: "أدخل الاسم ورقم الهاتف", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const { data, error } = await (supabase.from("referrals" as any) as any).insert({
        referrer_patient_id: patientData.id, referred_name: name.trim(), referred_phone: phone.trim(),
        clinic_id: patientData.clinic_id, status: "pending", reward_points: 50,
      }).select().single();
      if (error) throw error;
      toast({ title: "✅ تم إرسال الدعوة", description: "ستحصل على 50 نقطة عند تسجيل صديقك" });
      onAdd(data);
      setName(""); setPhone("");
    } catch (err: any) { toast({ title: "خطأ", description: err.message, variant: "destructive" }); }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="clinic-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="h-4 w-4 text-primary" /></div>
          <div>
            <h2 className="text-sm font-bold text-foreground">ادعُ صديقاً</h2>
            <p className="text-[10px] text-muted-foreground">احصل على 50 نقطة مكافأة لكل صديق يسجل</p>
          </div>
        </div>
        <div className="space-y-3">
          <Input placeholder="اسم صديقك" value={name} onChange={e => setName(e.target.value)} />
          <Input placeholder="رقم الهاتف" value={phone} onChange={e => setPhone(e.target.value)} className="font-en" dir="ltr" />
          <Button onClick={handleSubmit} className="w-full gap-2" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}إرسال الدعوة
          </Button>
        </div>
      </div>

      {referrals.length > 0 && (
        <div className="clinic-card">
          <div className="p-4 border-b border-border"><h3 className="text-sm font-semibold text-foreground">دعواتك ({referrals.length})</h3></div>
          <div className="divide-y divide-border">
            {referrals.map(ref => (
              <div key={ref.id} className="p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-foreground">{ref.referred_name.charAt(0)}</div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">{ref.referred_name}</p>
                  <p className="text-[10px] text-muted-foreground font-en">{ref.referred_phone}</p>
                </div>
                <Badge variant={ref.status === "completed" ? "default" : ref.status === "registered" ? "secondary" : "outline"} className="text-[9px]">
                  {ref.status === "completed" ? "مكتمل" : ref.status === "registered" ? "مسجل" : "معلق"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Feedback ──
function FeedbackTab({ patientData, appointments }: { patientData: any; appointments: any[] }) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedAppt, setSelectedAppt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const completedAppts = appointments.filter(a => a.status === "completed" || a.date < new Date().toISOString().split("T")[0]);

  const handleSubmit = async () => {
    if (rating === 0) { toast({ title: "خطأ", description: "اختر تقييماً", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("patient_ratings").insert({
        patient_id: patientData.id, appointment_id: selectedAppt || null, clinic_id: patientData.clinic_id,
        rating, comment: comment.trim() || null,
      });
      if (error) throw error;
      toast({ title: "✅ شكراً لتقييمك!", description: "ملاحظاتك تساعدنا على التحسن" });
      setRating(0); setComment(""); setSelectedAppt("");
    } catch (err: any) { toast({ title: "خطأ", description: err.message, variant: "destructive" }); }
    setSubmitting(false);
  };

  return (
    <div className="clinic-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center"><Star className="h-4 w-4 text-amber-500" /></div>
        <div>
          <h2 className="text-sm font-bold text-foreground">قيّم تجربتك</h2>
          <p className="text-[10px] text-muted-foreground">ساعدنا في تحسين خدماتنا</p>
        </div>
      </div>

      <div className="space-y-4">
        {completedAppts.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs">الموعد (اختياري)</Label>
            <Select value={selectedAppt} onValueChange={setSelectedAppt}>
              <SelectTrigger><SelectValue placeholder="اختر الموعد" /></SelectTrigger>
              <SelectContent>
                {completedAppts.slice(0, 5).map(a => <SelectItem key={a.id} value={a.id}>{a.date} - {a.doctor || "طبيب"}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="text-center py-2">
          <p className="text-xs text-muted-foreground mb-2">كيف كانت تجربتك؟</p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map(v => (
              <button key={v} onClick={() => setRating(v)} className="transition-transform hover:scale-110">
                <Star className={`h-8 w-8 ${v <= rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}`} />
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {rating === 0 ? "" : rating <= 2 ? "نأسف لذلك 😞" : rating <= 3 ? "شكراً لملاحظاتك" : rating <= 4 ? "سعداء بذلك! 😊" : "ممتاز! 🎉"}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">تعليق (اختياري)</Label>
          <Textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="أخبرنا المزيد عن تجربتك..." />
        </div>

        <Button onClick={handleSubmit} className="w-full gap-2" disabled={submitting || rating === 0}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}إرسال التقييم
        </Button>
      </div>
    </div>
  );
}

// ── AI Health Assistant ──
function AIHealthAssistantTab({ patientData }: { patientData: any }) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user" as const, content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-medical", {
        body: {
          action: "health_assistant",
          patient_id: patientData.id,
          data: { question: userMsg.content },
        },
      });
      if (error) throw error;
      const reply = data?.answer || data?.raw || "عذراً، لم أتمكن من الإجابة حالياً.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);

      if (data?.urgency === "high") {
        setMessages(prev => [...prev, { role: "assistant", content: "⚠️ يُنصح بالتواصل مع العيادة في أقرب وقت." }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "عذراً، حدث خطأ. حاول مرة أخرى." }]);
    }
    setLoading(false);
  };

  return (
    <div className="clinic-card flex flex-col" style={{ height: "70vh" }}>
      <div className="p-4 border-b border-border flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Mic className="h-4 w-4 text-primary" /></div>
        <div>
          <h2 className="text-sm font-bold text-foreground">المساعد الصحي الذكي</h2>
          <p className="text-[10px] text-muted-foreground">اسأل عن أدويتك أو أي استفسار صحي عام</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Mic className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">اسألني عن أي شيء!</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {["ما هي أوقات تناول أدويتي؟", "متى موعدي القادم؟", "نصائح للحفاظ على الصحة"].map(q => (
                <button key={q} onClick={() => { setInput(q); }} className="text-[11px] px-3 py-1.5 rounded-xl bg-muted text-foreground hover:bg-primary/10 transition-colors">{q}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"
            }`}>{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border flex gap-2">
        <Input value={input} onChange={e => setInput(e.target.value)} placeholder="اكتب سؤالك..." className="text-sm"
          onKeyDown={e => { if (e.key === "Enter") sendMessage(); }} />
        <Button size="icon" onClick={sendMessage} disabled={loading || !input.trim()}><Send className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

// ── Notifications with Appointment Confirmation ──
function NotificationsWithConfirmation({ notifications, unreadCount, markAsRead, markAllRead, patientData }: {
  notifications: any[]; unreadCount: number; markAsRead: (id: string) => void; markAllRead: () => void; patientData: any;
}) {
  const { toast } = useToast();
  const [confirming, setConfirming] = useState<string | null>(null);

  const handleConfirmAppointment = async (notif: any, action: "confirmed" | "cancelled") => {
    if (!notif.reference_id) return;
    setConfirming(notif.id);
    try {
      const updates: any = { confirmation_status: action };
      if (action === "cancelled") updates.status = "cancelled";
      await (supabase.from("appointments" as any) as any).update(updates).eq("id", notif.reference_id);
      markAsRead(notif.id);
      toast({
        title: action === "confirmed" ? "✅ تم تأكيد الموعد" : "❌ تم إلغاء الموعد",
        description: action === "confirmed" ? "سنراك في الموعد المحدد" : "تم إلغاء الموعد بنجاح",
      });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setConfirming(null);
  };

  return (
    <div className="clinic-card">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">الإشعارات</h2>
        {unreadCount > 0 && <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs h-7">تحديد الكل كمقروء</Button>}
      </div>
      {notifications.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground">لا توجد إشعارات</div> : (
        <div className="divide-y divide-border">
          {notifications.map(notif => {
            const isAppointmentReminder = notif.type === "appointment_reminder" && notif.reference_id;
            return (
              <div key={notif.id} className={`p-4 transition-colors ${!notif.is_read ? "bg-primary/5" : ""}`}>
                <div className="flex items-start gap-3 cursor-pointer" onClick={() => { if (!notif.is_read) markAsRead(notif.id); }}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${!notif.is_read ? "bg-primary/10" : "bg-muted"}`}>
                    <Bell className={`h-4 w-4 ${!notif.is_read ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.is_read ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{notif.title}</p>
                    {notif.body && <p className="text-[11px] text-muted-foreground mt-0.5">{notif.body}</p>}
                    <p className="text-[10px] text-muted-foreground/60 mt-1 font-en">
                      {new Date(notif.created_at).toLocaleDateString("ar-SA")} · {new Date(notif.created_at).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {!notif.is_read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
                </div>
                {/* Appointment Confirmation Buttons */}
                {isAppointmentReminder && (
                  <div className="flex items-center gap-2 mt-3 mr-12">
                    <Button size="sm" variant="default" className="gap-1.5 text-xs h-8" disabled={confirming === notif.id}
                      onClick={() => handleConfirmAppointment(notif, "confirmed")}>
                      {confirming === notif.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}تأكيد الحضور
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8" disabled={confirming === notif.id}
                      onClick={() => handleConfirmAppointment(notif, "cancelled")}>إلغاء الموعد
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Patient Journey Tab ──
const JOURNEY_STAGES = [
  { key: "reception", label: "الاستقبال", icon: UserPlus, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  { key: "pre_payment", label: "الحسابات", icon: DollarSign, color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
  { key: "with_doctor", label: "الطبيب", icon: Stethoscope, color: "text-accent", bg: "bg-accent/10", border: "border-accent/30" },
  { key: "post_payment", label: "حسابات إضافية", icon: CreditCard, color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
  { key: "checkout", label: "الخروج", icon: CalendarCheck, color: "text-success", bg: "bg-success/10", border: "border-success/30" },
];

function PatientJourneyTab({ visits }: { visits: any[] }) {
  const today = new Date().toISOString().split("T")[0];
  const todayVisits = visits.filter((v: any) => v.date === today && v.status !== "completed");
  const completedToday = visits.filter((v: any) => v.date === today && v.status === "completed");
  const recentVisits = visits.filter((v: any) => v.date !== today).slice(0, 5);

  const getStageIndex = (status: string) => {
    const idx = JOURNEY_STAGES.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const getStageLabel = (status: string) => {
    if (status === "completed") return "مكتمل";
    const stage = JOURNEY_STAGES.find(s => s.key === status);
    return stage?.label || "الاستقبال";
  };

  return (
    <div className="space-y-4">
      {/* Active Visit Today */}
      {todayVisits.length > 0 ? (
        todayVisits.map((visit: any) => {
          const currentIndex = getStageIndex(visit.status);
          const currentStage = JOURNEY_STAGES[currentIndex];

          return (
            <div key={visit.id} className="clinic-card p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${currentStage.bg} flex items-center justify-center`}>
                  <currentStage.icon className={`h-5 w-5 ${currentStage.color}`} />
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-bold text-foreground">زيارة اليوم</h2>
                  <p className="text-xs text-muted-foreground">
                    أنت الآن في مرحلة: <span className={`font-semibold ${currentStage.color}`}>{currentStage.label}</span>
                  </p>
                </div>
                <Badge variant="default" className="text-[10px]">نشط</Badge>
              </div>

              {/* Visual Progress */}
              <div className="space-y-3">
                {JOURNEY_STAGES.map((stage, i) => {
                  const isCompleted = i < currentIndex;
                  const isCurrent = i === currentIndex;
                  const isPending = i > currentIndex;

                  return (
                    <div key={stage.key} className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isCompleted ? "bg-success/20" :
                        isCurrent ? `${stage.bg} ring-2 ring-offset-2 ring-offset-background ${stage.border}` :
                        "bg-muted"
                      }`}>
                        {isCompleted ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <stage.icon className={`h-4 w-4 ${isCurrent ? stage.color : "text-muted-foreground/40"}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          isCompleted ? "text-success line-through" :
                          isCurrent ? "text-foreground font-bold" :
                          "text-muted-foreground"
                        }`}>
                          {stage.label}
                        </p>
                        {isCurrent && (
                          <p className="text-[10px] text-primary animate-pulse">⬅ أنت هنا</p>
                        )}
                      </div>
                      {isCompleted && <Badge variant="secondary" className="text-[9px]">✓ تم</Badge>}
                      {isCurrent && <Badge className="text-[9px]">الحالي</Badge>}
                    </div>
                  );
                })}
              </div>

              {/* Visit Info */}
              <div className="bg-muted/30 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs border border-border/50">
                <div>
                  <span className="text-muted-foreground">النوع</span>
                  <p className="font-medium text-foreground">{visit.visit_type === "diagnostic" ? "كشف" : visit.visit_type === "treatment" ? "علاجي" : "متابعة"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">الوقت</span>
                  <p className="font-medium text-foreground font-en">{visit.time?.slice(0, 5) || "—"}</p>
                </div>
                {visit.diagnosis && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">التشخيص</span>
                    <p className="font-medium text-foreground">{visit.diagnosis}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="clinic-card p-8 text-center">
          <MapPin className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">لا توجد زيارة نشطة اليوم</p>
          <p className="text-[10px] text-muted-foreground mt-1">ستظهر رحلتك هنا عند تسجيل زيارة في العيادة</p>
        </div>
      )}

      {/* Completed Today */}
      {completedToday.length > 0 && (
        <div className="clinic-card">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />زيارات مكتملة اليوم
            </h3>
          </div>
          <div className="divide-y divide-border">
            {completedToday.map((v: any) => (
              <div key={v.id} className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <Check className="h-4 w-4 text-success" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">{v.visit_type === "diagnostic" ? "كشف" : "متابعة"}</p>
                  <p className="text-[10px] text-muted-foreground font-en">{v.time?.slice(0, 5)}</p>
                </div>
                <Badge variant="default" className="text-[9px]">مكتمل</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Visit History with stages */}
      {recentVisits.length > 0 && (
        <div className="clinic-card">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">سجل الزيارات السابقة</h3>
          </div>
          <div className="divide-y divide-border">
            {recentVisits.map((v: any) => (
              <div key={v.id} className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground font-en">{v.date}</p>
                  <p className="text-[10px] text-muted-foreground">{v.diagnosis || (v.visit_type === "diagnostic" ? "كشف" : "متابعة")}</p>
                </div>
                <Badge variant={v.status === "completed" ? "default" : "secondary"} className="text-[9px]">
                  {getStageLabel(v.status)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
