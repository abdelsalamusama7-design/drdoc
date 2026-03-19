import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Building2, Stethoscope, DollarSign, Users, CalendarCheck, FileText,
  Check, ChevronLeft, ChevronRight, Loader2, Sparkles, Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useClinic } from "@/hooks/useClinic";
import { supabase } from "@/integrations/supabase/client";

interface StepDef {
  id: string;
  title: string;
  desc: string;
  icon: any;
}

const steps: StepDef[] = [
  { id: "clinic", title: "بيانات العيادة", desc: "المعلومات الأساسية للعيادة", icon: Building2 },
  { id: "services", title: "الخدمات والأسعار", desc: "أضف خدمات عيادتك", icon: DollarSign },
  { id: "team", title: "فريق العمل", desc: "أضف الأطباء والموظفين", icon: Users },
  { id: "first-patient", title: "أول مريض", desc: "أضف أول مريض لتجربة النظام", icon: Stethoscope },
  { id: "first-appointment", title: "أول موعد", desc: "احجز أول موعد", icon: CalendarCheck },
  { id: "done", title: "جاهز!", desc: "عيادتك جاهزة للعمل", icon: Rocket },
];

export default function OnboardingWizard() {
  const { user } = useAuth();
  const { clinic } = useClinic();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Service form
  const [services, setServices] = useState([{ name: "", price: "" }]);
  // Patient form
  const [patient, setPatient] = useState({ name: "", phone: "", age: "" });
  // Appointment form
  const [appointment, setAppointment] = useState({ date: "", time: "10:00" });

  const progress = ((completedSteps.length) / (steps.length - 1)) * 100;

  useEffect(() => {
    if (!clinic) return;
    // Load saved progress
    (async () => {
      const { data } = await (supabase.from("onboarding_progress" as any) as any)
        .select("*").eq("clinic_id", clinic.id).single();
      if (data) {
        setCompletedSteps((data.completed_steps as string[]) || []);
        setCurrentStep(data.current_step || 0);
      }
    })();
  }, [clinic]);

  const saveProgress = async (newCompleted: string[], step: number) => {
    if (!clinic) return;
    await (supabase.from("onboarding_progress" as any) as any)
      .upsert({
        clinic_id: clinic.id,
        completed_steps: newCompleted,
        current_step: step,
        is_completed: step >= steps.length - 1,
        updated_at: new Date().toISOString(),
      }, { onConflict: "clinic_id" });
  };

  const completeStep = (stepId: string) => {
    const newCompleted = [...new Set([...completedSteps, stepId])];
    setCompletedSteps(newCompleted);
    const nextStep = Math.min(currentStep + 1, steps.length - 1);
    setCurrentStep(nextStep);
    saveProgress(newCompleted, nextStep);
  };

  const handleAddServices = async () => {
    if (!clinic) return;
    const valid = services.filter(s => s.name.trim() && s.price);
    if (!valid.length) { toast({ title: "خطأ", description: "أضف خدمة واحدة على الأقل", variant: "destructive" }); return; }
    setLoading(true);
    try {
      await supabase.from("services").insert(valid.map(s => ({
        name: s.name.trim(), price: Number(s.price), clinic_id: clinic.id,
      })));
      toast({ title: "✅ تم إضافة الخدمات" });
      completeStep("services");
    } catch { toast({ title: "خطأ", variant: "destructive" }); }
    setLoading(false);
  };

  const handleAddPatient = async () => {
    if (!clinic || !patient.name.trim() || !patient.phone.trim()) {
      toast({ title: "خطأ", description: "الاسم والهاتف مطلوبان", variant: "destructive" }); return;
    }
    setLoading(true);
    try {
      await supabase.from("patients").insert({
        name: patient.name.trim(), phone: patient.phone.trim(),
        age: patient.age ? Number(patient.age) : null, clinic_id: clinic.id, created_by: user?.id,
      });
      toast({ title: "✅ تم إضافة المريض" });
      completeStep("first-patient");
    } catch { toast({ title: "خطأ", variant: "destructive" }); }
    setLoading(false);
  };

  const handleAddAppointment = async () => {
    if (!clinic || !appointment.date) {
      toast({ title: "خطأ", description: "اختر تاريخ الموعد", variant: "destructive" }); return;
    }
    setLoading(true);
    try {
      await supabase.from("appointments").insert({
        patient_name: patient.name || "مريض تجريبي",
        date: appointment.date, time: appointment.time,
        clinic_id: clinic.id, created_by: user?.id,
      });
      toast({ title: "✅ تم حجز الموعد" });
      completeStep("first-appointment");
    } catch { toast({ title: "خطأ", variant: "destructive" }); }
    setLoading(false);
  };

  const step = steps[currentStep];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />إعداد العيادة
            </h1>
            <span className="text-sm text-muted-foreground font-en">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between mt-3">
            {steps.map((s, i) => (
              <div key={s.id} className={`flex items-center gap-1 text-xs ${i <= currentStep ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                {completedSteps.includes(s.id) ? <Check className="h-3.5 w-3.5 text-success" /> : <s.icon className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div key={step.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="clinic-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{step.title}</h2>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            </div>

            {/* Step: Clinic Data (already done at registration, so just confirm) */}
            {step.id === "clinic" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                  <p className="text-sm text-success font-semibold flex items-center gap-2"><Check className="h-4 w-4" />تم إنشاء العيادة بنجاح</p>
                  {clinic && <p className="text-sm text-muted-foreground mt-1">العيادة: {clinic.name}</p>}
                </div>
                <p className="text-sm text-muted-foreground">يمكنك تعديل بيانات العيادة لاحقاً من الإعدادات. الآن لنبدأ بإضافة خدماتك!</p>
                <Button className="w-full" onClick={() => completeStep("clinic")}>متابعة <ChevronLeft className="h-4 w-4 mr-1" /></Button>
              </div>
            )}

            {/* Step: Services */}
            {step.id === "services" && (
              <div className="space-y-4">
                {services.map((s, i) => (
                  <div key={i} className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Input value={s.name} onChange={e => { const arr = [...services]; arr[i].name = e.target.value; setServices(arr); }} placeholder="اسم الخدمة (مثلاً: كشف)" />
                    </div>
                    <Input value={s.price} onChange={e => { const arr = [...services]; arr[i].price = e.target.value; setServices(arr); }} placeholder="السعر" type="number" dir="ltr" />
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setServices([...services, { name: "", price: "" }])}>+ إضافة خدمة</Button>
                <Button className="w-full" onClick={handleAddServices} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ الخدمات والمتابعة"}
                </Button>
                <button onClick={() => completeStep("services")} className="text-xs text-muted-foreground hover:text-foreground text-center w-full">تخطي هذه الخطوة</button>
              </div>
            )}

            {/* Step: Team - simplified */}
            {step.id === "team" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">يمكنك إضافة أعضاء فريقك لاحقاً من صفحة إدارة المستخدمين. كل عضو سيحصل على صلاحيات حسب دوره.</p>
                <div className="grid grid-cols-3 gap-3">
                  {[{ role: "طبيب", icon: Stethoscope, desc: "إدارة المرضى والوصفات" }, { role: "استقبال", icon: Users, desc: "إدارة المواعيد والحجوزات" }, { role: "محاسب", icon: DollarSign, desc: "إدارة المالية والفواتير" }].map(r => (
                    <div key={r.role} className="clinic-card p-4 text-center">
                      <r.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-sm font-semibold text-foreground">{r.role}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{r.desc}</p>
                    </div>
                  ))}
                </div>
                <Button className="w-full" onClick={() => completeStep("team")}>متابعة <ChevronLeft className="h-4 w-4 mr-1" /></Button>
              </div>
            )}

            {/* Step: First Patient */}
            {step.id === "first-patient" && (
              <div className="space-y-4">
                <div>
                  <Label>اسم المريض *</Label>
                  <Input value={patient.name} onChange={e => setPatient({ ...patient, name: e.target.value })} placeholder="أحمد محمد" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>رقم الهاتف *</Label>
                    <Input value={patient.phone} onChange={e => setPatient({ ...patient, phone: e.target.value })} placeholder="01xxxxxxxxx" className="mt-1" dir="ltr" />
                  </div>
                  <div>
                    <Label>العمر</Label>
                    <Input value={patient.age} onChange={e => setPatient({ ...patient, age: e.target.value })} placeholder="35" className="mt-1" type="number" dir="ltr" />
                  </div>
                </div>
                <Button className="w-full" onClick={handleAddPatient} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "إضافة المريض والمتابعة"}
                </Button>
                <button onClick={() => completeStep("first-patient")} className="text-xs text-muted-foreground hover:text-foreground text-center w-full">تخطي</button>
              </div>
            )}

            {/* Step: First Appointment */}
            {step.id === "first-appointment" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>تاريخ الموعد *</Label>
                    <Input type="date" value={appointment.date} onChange={e => setAppointment({ ...appointment, date: e.target.value })} className="mt-1" dir="ltr" />
                  </div>
                  <div>
                    <Label>الوقت</Label>
                    <Input type="time" value={appointment.time} onChange={e => setAppointment({ ...appointment, time: e.target.value })} className="mt-1" dir="ltr" />
                  </div>
                </div>
                <Button className="w-full" onClick={handleAddAppointment} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "حجز الموعد والمتابعة"}
                </Button>
                <button onClick={() => completeStep("first-appointment")} className="text-xs text-muted-foreground hover:text-foreground text-center w-full">تخطي</button>
              </div>
            )}

            {/* Step: Done */}
            {step.id === "done" && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <Rocket className="h-10 w-10 text-success" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">🎉 تهانينا! عيادتك جاهزة</h3>
                  <p className="text-sm text-muted-foreground">تم إعداد عيادتك بنجاح. يمكنك الآن البدء في استقبال المرضى وإدارة مواعيدك.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => navigate("/")} className="gap-2"><Building2 className="h-4 w-4" />لوحة التحكم</Button>
                  <Button variant="outline" onClick={() => navigate("/patients")} className="gap-2"><Users className="h-4 w-4" />المرضى</Button>
                </div>
              </div>
            )}

            {/* Navigation */}
            {step.id !== "done" && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <Button variant="ghost" size="sm" disabled={currentStep === 0} onClick={() => { setCurrentStep(currentStep - 1); }}>
                  <ChevronRight className="h-4 w-4" />السابق
                </Button>
                <span className="text-xs text-muted-foreground font-en">{currentStep + 1} / {steps.length}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
