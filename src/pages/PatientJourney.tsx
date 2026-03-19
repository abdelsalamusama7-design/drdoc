import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, DollarSign, Stethoscope, CalendarCheck, ChevronLeft, ChevronRight,
  Search, Loader2, Phone, FileText, Brain, Pill, Plus, Upload, Clock,
  AlertTriangle, Activity, X, Check, CreditCard, KeyRound, Mail, Eye, EyeOff
} from "lucide-react";
import { useAllVisits, usePatients, useServices, updateVisit, createPayment, createPrescription,
  createFollowUp, createDoctorNote, uploadPatientFile, type Visit, type Patient, type Service
} from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { useClinic } from "@/hooks/useClinic";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// ── Journey Stages ──
const STAGES = [
  { key: "reception", label: "الاستقبال", labelEn: "Reception", icon: UserPlus, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  { key: "pre_payment", label: "الحسابات", labelEn: "Payment", icon: DollarSign, color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
  { key: "with_doctor", label: "الطبيب", labelEn: "Doctor", icon: Stethoscope, color: "text-accent", bg: "bg-accent/10", border: "border-accent/30" },
  { key: "post_payment", label: "حسابات إضافية", labelEn: "Post Payment", icon: CreditCard, color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
  { key: "checkout", label: "الخروج", labelEn: "Checkout", icon: CalendarCheck, color: "text-success", bg: "bg-success/10", border: "border-success/30" },
] as const;

type StageKey = typeof STAGES[number]["key"];

const anim = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25 } };

export default function PatientJourney() {
  const { data: visits, loading: visitsLoading, refetch } = useAllVisits();
  const { data: patients } = usePatients();
  const { data: services } = useServices();
  const { user } = useAuth();
  const { clinic } = useClinic();
  const { lang } = useI18n();
  const { toast } = useToast();

  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [activeStage, setActiveStage] = useState<StageKey | null>(null);
  const [createAccountPatient, setCreateAccountPatient] = useState<Patient | null>(null);

  const today = new Date().toISOString().split("T")[0];

  // Group today's visits by stage
  const todayVisits = useMemo(() =>
    visits.filter(v => v.date === today),
    [visits, today]
  );

  const visitsByStage = useMemo(() => {
    const map: Record<StageKey, (Visit & { patient?: Patient })[]> = {
      reception: [], pre_payment: [], with_doctor: [], post_payment: [], checkout: [],
    };
    todayVisits.forEach(v => {
      const stage = (v.status as StageKey) || "reception";
      const patient = patients.find(p => p.id === v.patient_id);
      if (map[stage]) {
        map[stage].push({ ...v, patient });
      } else {
        map.reception.push({ ...v, patient });
      }
    });
    return map;
  }, [todayVisits, patients]);

  const handleMoveToStage = async (visitId: string, newStage: StageKey) => {
    try {
      await updateVisit(visitId, { status: newStage });
      toast({ title: lang === "ar" ? "تم التحديث" : "Updated" });
      refetch();
      setSelectedVisit(null);
      setActiveStage(null);
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const openStageDialog = (visit: Visit, stage: StageKey) => {
    setSelectedVisit(visit);
    setActiveStage(stage);
  };

  const getPatient = (patientId: string) => patients.find(p => p.id === patientId);

  return (
    <motion.div {...anim} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {lang === "ar" ? "رحلة المريض" : "Patient Journey"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "ar" ? "تتبع المرضى خطوة بخطوة داخل العيادة" : "Track patients step-by-step through the clinic"}
          </p>
        </div>
        <Badge variant="secondary" className="font-en">
          {today} · {todayVisits.length} {lang === "ar" ? "مريض" : "patients"}
        </Badge>
      </div>

      {/* Pipeline Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {STAGES.map((stage, i) => (
          <div key={stage.key} className="flex items-center shrink-0">
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${stage.bg} ${stage.border} border`}>
              <stage.icon className={`h-4 w-4 ${stage.color}`} />
              <span className={`text-sm font-semibold ${stage.color}`}>
                {lang === "ar" ? stage.label : stage.labelEn}
              </span>
              <Badge variant="secondary" className="text-[10px] h-5 min-w-[20px] justify-center">
                {visitsByStage[stage.key].length}
              </Badge>
            </div>
            {i < STAGES.length - 1 && (
              <ChevronLeft className="h-4 w-4 text-muted-foreground/40 mx-1 shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-h-[400px]">
        {STAGES.map((stage) => (
          <div key={stage.key} className="space-y-2">
            {/* Column header */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${stage.bg} border ${stage.border}`}>
              <stage.icon className={`h-4 w-4 ${stage.color}`} />
              <span className={`text-xs font-bold ${stage.color}`}>
                {lang === "ar" ? stage.label : stage.labelEn}
              </span>
              <span className="text-[10px] text-muted-foreground mr-auto font-en">
                {visitsByStage[stage.key].length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2 min-h-[100px]">
              <AnimatePresence>
                {visitsByStage[stage.key].map((visit) => (
                  <motion.div
                    key={visit.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="clinic-card-interactive p-3 space-y-2"
                    onClick={() => openStageDialog(visit, stage.key)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {visit.patient?.name?.charAt(0) || "؟"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {visit.patient?.name || "—"}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-en">
                          {visit.time?.slice(0, 5)} · {visit.visit_type === "diagnostic" ? (lang === "ar" ? "كشف" : "Consultation") : (lang === "ar" ? "متابعة" : "Follow-up")}
                        </p>
                      </div>
                    </div>
                    {visit.patient?.allergies && visit.patient.allergies.length > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-destructive" />
                        <span className="text-[10px] text-destructive truncate">
                          {visit.patient.allergies.join(", ")}
                        </span>
                      </div>
                    )}
                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (visit.patient) setCreateAccountPatient(visit.patient);
                        }}
                        className="flex items-center gap-1 text-[9px] text-primary hover:text-primary/80 transition-colors px-1.5 py-0.5 rounded-md hover:bg-primary/5"
                        title={lang === "ar" ? "إنشاء حساب للمريض" : "Create patient account"}
                      >
                        <KeyRound className="h-3 w-3" />
                        {lang === "ar" ? "إنشاء حساب" : "Account"}
                      </button>
                      <Badge variant="outline" className="text-[9px] h-4 gap-1">
                        <ChevronLeft className="h-2.5 w-2.5" />
                        {lang === "ar" ? "تفاصيل" : "Details"}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {visitsByStage[stage.key].length === 0 && (
                <div className="flex items-center justify-center h-20 text-muted-foreground/30">
                  <p className="text-xs">{lang === "ar" ? "لا يوجد" : "Empty"}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stage Dialog */}
      {selectedVisit && activeStage && (
        <StageDialog
          visit={selectedVisit}
          stage={activeStage}
          patient={getPatient(selectedVisit.patient_id)}
          services={services}
          user={user}
          clinic={clinic}
          lang={lang}
          onClose={() => { setSelectedVisit(null); setActiveStage(null); }}
          onMoveNext={(nextStage) => handleMoveToStage(selectedVisit.id, nextStage)}
          refetch={refetch}
        />
      )}

      {/* Create Patient Account Dialog */}
      {createAccountPatient && (
        <CreatePatientAccountDialog
          patient={createAccountPatient}
          lang={lang}
          onClose={() => setCreateAccountPatient(null)}
        />
      )}

      {visitsLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </motion.div>
  );
}

// ── Stage Dialog Component ──
interface StageDialogProps {
  visit: Visit;
  stage: StageKey;
  patient?: Patient;
  services: Service[];
  user: any;
  clinic: any;
  lang: string;
  onClose: () => void;
  onMoveNext: (nextStage: StageKey) => void;
  refetch: () => void;
}

function StageDialog({ visit, stage, patient, services, user, clinic, lang, onClose, onMoveNext, refetch }: StageDialogProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  // Payment form
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("cash");

  // Doctor form
  const [diagnosis, setDiagnosis] = useState(visit.diagnosis || "");
  const [doctorNotes, setDoctorNotes] = useState(visit.doctor_notes || "");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  // Follow-up form
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpReason, setFollowUpReason] = useState("");

  const stageInfo = STAGES.find(s => s.key === stage)!;
  const nextStageIndex = STAGES.findIndex(s => s.key === stage) + 1;
  const nextStage = nextStageIndex < STAGES.length ? STAGES[nextStageIndex] : null;

  const handlePayment = async () => {
    if (!payAmount || parseFloat(payAmount) <= 0) {
      toast({ title: "خطأ", description: "أدخل المبلغ", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await createPayment({
        visit_id: visit.id,
        patient_id: visit.patient_id,
        amount: parseFloat(payAmount),
        total_amount: parseFloat(payAmount),
        remaining_amount: 0,
        payment_method: payMethod,
        notes: stage === "pre_payment" ? "دفع كشف" : "دفع إضافي",
        created_by: user?.id,
      }, clinic?.id);
      toast({ title: lang === "ar" ? "تم تسجيل الدفع" : "Payment recorded" });
      if (nextStage) onMoveNext(nextStage.key);
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleDoctorSave = async () => {
    setSubmitting(true);
    try {
      await updateVisit(visit.id, { diagnosis, doctor_notes: doctorNotes });
      if (diagnosis) {
        await createDoctorNote({
          patient_id: visit.patient_id,
          type: "visit",
          title: `تشخيص: ${diagnosis}`,
          description: doctorNotes,
          date: visit.date,
          created_by: user?.id,
        }, clinic?.id);
      }
      toast({ title: lang === "ar" ? "تم الحفظ" : "Saved" });
      if (nextStage) onMoveNext(nextStage.key);
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleCheckout = async () => {
    setSubmitting(true);
    try {
      if (followUpDate) {
        await createFollowUp({
          patient_id: visit.patient_id,
          appointment_id: visit.appointment_id,
          follow_up_date: followUpDate,
          reason: followUpReason || "متابعة",
          status: "pending",
          created_by: user?.id,
        }, clinic?.id);
      }
      await updateVisit(visit.id, { status: "completed" });
      toast({ title: lang === "ar" ? "تمت الزيارة بنجاح" : "Visit completed" });
      onClose();
      refetch();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleAiSuggest = async () => {
    if (!patient) return;
    setLoadingAi(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: `المريض: ${patient.name}، العمر: ${patient.age}، الجنس: ${patient.gender === "male" ? "ذكر" : "أنثى"}.
التاريخ المرضي: ${patient.medical_history || "لا يوجد"}.
الحساسية: ${patient.allergies?.join(", ") || "لا يوجد"}.
الأدوية الحالية: ${patient.current_medications?.join(", ") || "لا يوجد"}.
اقترح تشخيصاً محتملاً وخطة علاج بناءً على هذه المعلومات. اكتب بالعربية بشكل مختصر.`,
          context: "medical_assistant",
        },
      });
      setAiSuggestion(data?.reply || data?.message || "لا توجد اقتراحات حالياً");
    } catch {
      setAiSuggestion("تعذر الحصول على اقتراحات AI حالياً");
    }
    setLoadingAi(false);
  };

  const handleSkipPayment = () => {
    if (nextStage) onMoveNext(nextStage.key);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${stageInfo.bg} flex items-center justify-center`}>
              <stageInfo.icon className={`h-4 w-4 ${stageInfo.color}`} />
            </div>
            {lang === "ar" ? stageInfo.label : stageInfo.labelEn}
            <span className="text-muted-foreground font-normal text-sm">— {patient?.name}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Patient Summary */}
        <div className="bg-muted/30 rounded-xl p-3 space-y-1 border border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">{patient?.name}</span>
            <Badge variant="outline" className="text-[10px] font-en">{patient?.age} {lang === "ar" ? "سنة" : "y/o"}</Badge>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span>{patient?.gender === "male" ? "ذكر" : "أنثى"}</span>
            <span className="font-en">{patient?.phone}</span>
          </div>
          {patient?.allergies && patient.allergies.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="h-3 w-3 text-destructive" />
              <span className="text-[10px] text-destructive">{patient.allergies.join(", ")}</span>
            </div>
          )}
          {patient?.medical_history && (
            <p className="text-[10px] text-muted-foreground mt-1">📋 {patient.medical_history}</p>
          )}
        </div>

        {/* Stage-specific content */}
        {stage === "reception" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "تأكد من اكتمال بيانات المريض ثم حوّله للحسابات" : "Verify patient data, then move to payment"}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted/20 rounded-lg p-2">
                <span className="text-muted-foreground">التاريخ المرضي</span>
                <p className="font-medium text-foreground mt-0.5">{patient?.medical_history || "—"}</p>
              </div>
              <div className="bg-muted/20 rounded-lg p-2">
                <span className="text-muted-foreground">العمليات السابقة</span>
                <p className="font-medium text-foreground mt-0.5">{patient?.previous_surgeries || "—"}</p>
              </div>
              <div className="bg-muted/20 rounded-lg p-2">
                <span className="text-muted-foreground">الأدوية الحالية</span>
                <p className="font-medium text-foreground mt-0.5">{patient?.current_medications?.join(", ") || "—"}</p>
              </div>
              <div className="bg-muted/20 rounded-lg p-2">
                <span className="text-muted-foreground">الحساسية</span>
                <p className="font-medium text-foreground mt-0.5">{patient?.allergies?.join(", ") || "—"}</p>
              </div>
            </div>
            <Button className="w-full" onClick={() => nextStage && onMoveNext(nextStage.key)}>
              <DollarSign className="h-4 w-4" />
              {lang === "ar" ? "تحويل للحسابات" : "Move to Payment"}
            </Button>
          </div>
        )}

        {(stage === "pre_payment" || stage === "post_payment") && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {stage === "pre_payment"
                ? (lang === "ar" ? "تسجيل دفع الكشف/الزيارة" : "Record consultation fee")
                : (lang === "ar" ? "تسجيل تكاليف إضافية (جلسات، تحاليل...)" : "Record additional costs")
              }
            </p>
            <div className="space-y-2">
              <Label>{lang === "ar" ? "المبلغ (ج.م)" : "Amount (EGP)"}</Label>
              <Input
                type="number"
                placeholder="0"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                className="font-en"
              />
            </div>
            <div className="space-y-2">
              <Label>{lang === "ar" ? "طريقة الدفع" : "Payment Method"}</Label>
              <Select value={payMethod} onValueChange={setPayMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{lang === "ar" ? "نقدي" : "Cash"}</SelectItem>
                  <SelectItem value="card">{lang === "ar" ? "بطاقة" : "Card"}</SelectItem>
                  <SelectItem value="transfer">{lang === "ar" ? "تحويل" : "Transfer"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handlePayment} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {lang === "ar" ? "تسجيل الدفع" : "Record Payment"}
              </Button>
              <Button variant="outline" onClick={handleSkipPayment}>
                {lang === "ar" ? "تخطي" : "Skip"}
              </Button>
            </div>
          </div>
        )}

        {stage === "with_doctor" && (
          <div className="space-y-3">
            {/* AI Suggestion */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleAiSuggest} disabled={loadingAi} className="gap-1.5">
                {loadingAi ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5 text-accent" />}
                {lang === "ar" ? "اقتراح AI" : "AI Suggest"}
              </Button>
            </div>
            {aiSuggestion && (
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 text-xs text-foreground whitespace-pre-wrap">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Brain className="h-3.5 w-3.5 text-accent" />
                  <span className="font-semibold text-accent">{lang === "ar" ? "اقتراح الذكاء الاصطناعي" : "AI Suggestion"}</span>
                </div>
                {aiSuggestion}
              </div>
            )}
            <div className="space-y-2">
              <Label>{lang === "ar" ? "التشخيص" : "Diagnosis"}</Label>
              <Input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder={lang === "ar" ? "أدخل التشخيص..." : "Enter diagnosis..."} />
            </div>
            <div className="space-y-2">
              <Label>{lang === "ar" ? "ملاحظات الطبيب" : "Doctor Notes"}</Label>
              <Textarea value={doctorNotes} onChange={e => setDoctorNotes(e.target.value)} rows={3} placeholder={lang === "ar" ? "ملاحظات..." : "Notes..."} />
            </div>
            <Button className="w-full" onClick={handleDoctorSave} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {lang === "ar" ? "حفظ وتحويل للحسابات" : "Save & Move to Payment"}
            </Button>
          </div>
        )}

        {stage === "checkout" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "حدد موعد المتابعة القادمة" : "Schedule follow-up appointment"}
            </p>
            <div className="space-y-2">
              <Label>{lang === "ar" ? "تاريخ المتابعة" : "Follow-up Date"}</Label>
              <Input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} className="font-en" />
            </div>
            <div className="space-y-2">
              <Label>{lang === "ar" ? "سبب المتابعة" : "Reason"}</Label>
              <Input value={followUpReason} onChange={e => setFollowUpReason(e.target.value)} placeholder={lang === "ar" ? "متابعة / إعادة فحص..." : "Follow-up / Re-check..."} />
            </div>
            <Button className="w-full" onClick={handleCheckout} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
              {lang === "ar" ? "إنهاء الزيارة" : "Complete Visit"}
            </Button>
          </div>
        )}

        {/* Admin manual stage control */}
        <div className="border-t border-border/50 pt-3 space-y-2">
          <Label className="text-xs text-muted-foreground">
            {lang === "ar" ? "⚙️ تحكم يدوي — نقل المريض لمرحلة أخرى" : "⚙️ Manual Control — Move to stage"}
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map((s) => (
              <Button
                key={s.key}
                size="sm"
                variant={s.key === stage ? "default" : "outline"}
                disabled={s.key === stage || submitting}
                className={`text-xs gap-1.5 h-8 ${s.key === stage ? "" : "hover:bg-muted"}`}
                onClick={() => onMoveNext(s.key)}
              >
                <s.icon className="h-3 w-3" />
                {lang === "ar" ? s.label : s.labelEn}
              </Button>
            ))}
          </div>
        </div>

        {/* Stage progress indicator */}
        <div className="flex items-center justify-center gap-1 pt-2">
          {STAGES.map((s, i) => (
            <div key={s.key} className="flex items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                s.key === stage ? `${s.bg} ${s.color} ring-2 ring-offset-2 ring-offset-background ${s.border}` :
                STAGES.findIndex(x => x.key === stage) > i ? "bg-success/20 text-success" :
                "bg-muted text-muted-foreground"
              }`}>
                {STAGES.findIndex(x => x.key === stage) > i ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              {i < STAGES.length - 1 && (
                <div className={`w-4 h-0.5 ${STAGES.findIndex(x => x.key === stage) > i ? "bg-success/40" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Create Patient Account Dialog ──
interface CreatePatientAccountDialogProps {
  patient: Patient;
  lang: string;
  onClose: () => void;
}

function CreatePatientAccountDialog({ patient, lang, onClose }: CreatePatientAccountDialogProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!email.trim() || !password) {
      toast({ title: "خطأ", description: lang === "ar" ? "يرجى ملء البريد وكلمة المرور" : "Fill email & password", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "خطأ", description: lang === "ar" ? "كلمة المرور ٦ أحرف على الأقل" : "Password min 6 chars", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await supabase.functions.invoke("admin-users", {
        body: {
          action: "create_user",
          email: email.trim(),
          password,
          full_name: patient.name,
          phone: patient.phone,
          role: "patient",
        },
      });
      if (res.error) throw res.error;
      if (res.data?.error) throw new Error(res.data.error);

      toast({
        title: lang === "ar" ? "تم إنشاء الحساب" : "Account Created",
        description: lang === "ar" ? `تم إنشاء حساب ${patient.name} بنجاح` : `Account for ${patient.name} created`,
      });
      onClose();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm" dir={lang === "ar" ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            {lang === "ar" ? "إنشاء حساب للمريض" : "Create Patient Account"}
          </DialogTitle>
        </DialogHeader>

        {/* Patient info */}
        <div className="bg-muted/30 rounded-xl p-3 border border-border/50 space-y-1">
          <p className="text-sm font-bold text-foreground">{patient.name}</p>
          <p className="text-[11px] text-muted-foreground font-en">{patient.phone}</p>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">{lang === "ar" ? "البريد الإلكتروني" : "Email"} <span className="text-destructive">*</span></Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="patient@email.com"
                className="pl-9 font-en"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">{lang === "ar" ? "كلمة المرور" : "Password"} <span className="text-destructive">*</span></Label>
            <div className="relative mt-1">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 font-en"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button className="w-full" onClick={handleCreate} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {lang === "ar" ? "إنشاء الحساب" : "Create Account"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
