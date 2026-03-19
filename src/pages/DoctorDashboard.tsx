import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users, Clock, CheckCircle2, DollarSign, Stethoscope, FileText,
  Plus, Search, Loader2, Play, FolderOpen, Pill, FlaskConical,
  StickyNote, ChevronDown, ChevronUp, X, BookOpen
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  useAppointments, useAllVisits, useAllPayments, usePatients,
  useServices, createVisit, updateVisit, addVisitService,
  createPrescription, updateAppointment
} from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { useClinic } from "@/hooks/useClinic";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const anim = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25 } };

// Common diagnoses for autocomplete
const commonDiagnoses = [
  "ضعف الانتصاب", "سرعة القذف", "دوالي الخصية", "التهاب البروستاتا",
  "تضخم البروستاتا الحميد", "العقم عند الرجال", "انخفاض هرمون التستوستيرون",
  "التهاب المسالك البولية", "حصوات الكلى", "حصوات المثانة",
  "سلس البول", "التهاب الخصية", "التهاب البربخ",
  "عدم نزول الخصية", "مرض بيروني", "ضيق مجرى البول",
  "فحص دوري", "استشارة ما قبل الزواج", "تحليل السائل المنوي",
];

export default function DoctorDashboard() {
  const today = new Date().toISOString().split("T")[0];
  const { data: todayApts, loading: aLoading, refetch: refetchApts } = useAppointments(today);
  const { data: visits, refetch: refetchVisits } = useAllVisits();
  const { data: payments } = useAllPayments();
  const { data: patients } = usePatients();
  const { data: services } = useServices();
  const { user } = useAuth();
  const { clinic } = useClinic();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'waiting' | 'in-progress' | 'completed'>('waiting');
  const [showExamDialog, setShowExamDialog] = useState(false);
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Exam form
  const [examForm, setExamForm] = useState({
    diagnosis: "", doctorNotes: "", selectedServices: [] as string[],
    medications: [{ name: "", dosage: "", duration: "" }],
    labs: ""
  });
  const [diagnosisSearch, setDiagnosisSearch] = useState("");
  const [showDiagnosisList, setShowDiagnosisList] = useState(false);

  // Drug index search
  const [drugSearch, setDrugSearch] = useState("");
  const [drugResults, setDrugResults] = useState<any[]>([]);

  // Templates
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  const todayVisits = visits.filter(v => v.date === today);
  const todayRevenue = payments.filter(p => p.created_at?.startsWith(today)).reduce((s, p) => s + Number(p.amount), 0);

  const waitingApts = todayApts.filter(a => a.status === 'scheduled');
  const inProgressApts = todayApts.filter(a => a.status === 'in-progress');
  const completedApts = todayApts.filter(a => a.status === 'completed');

  const filteredDiagnoses = useMemo(() => {
    if (!diagnosisSearch) return [];
    return commonDiagnoses.filter(d => d.includes(diagnosisSearch)).slice(0, 6);
  }, [diagnosisSearch]);

  const searchDrugs = async (q: string) => {
    setDrugSearch(q);
    if (q.length < 2) { setDrugResults([]); return; }
    const { data } = await (supabase.from("drug_index" as any) as any)
      .select("*").ilike("name", `%${q}%`).limit(8);
    setDrugResults(data || []);
  };

  const loadTemplates = async () => {
    const { data } = await (supabase.from("medication_templates" as any) as any)
      .select("*").order("created_at", { ascending: false });
    setTemplates(data || []);
    setShowTemplates(true);
  };

  const applyTemplate = (template: any) => {
    const items = template.items || [];
    if (template.template_type === 'medication') {
      setExamForm(prev => ({
        ...prev,
        medications: [
          ...prev.medications.filter(m => m.name),
          ...items.map((i: any) => ({ name: i.name, dosage: i.dosage || "", duration: i.duration || "" }))
        ]
      }));
    } else {
      setExamForm(prev => ({
        ...prev,
        labs: prev.labs ? `${prev.labs}\n${items.map((i: any) => i.name).join("\n")}` : items.map((i: any) => i.name).join("\n")
      }));
    }
    setShowTemplates(false);
    toast({ title: "تم", description: `تم تطبيق القالب: ${template.name}` });
  };

  const startExam = async (apt: any) => {
    try {
      await updateAppointment(apt.id, { status: 'in-progress' });
      setSelectedApt(apt);
      setExamForm({ diagnosis: "", doctorNotes: "", selectedServices: [], medications: [{ name: "", dosage: "", duration: "" }], labs: "" });
      setShowExamDialog(true);
      refetchApts();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const finishExam = async () => {
    if (!selectedApt) return;
    setSubmitting(true);
    try {
      // Create visit
      const visit = await createVisit({
        patient_id: selectedApt.patient_id,
        appointment_id: selectedApt.id,
        date: today,
        time: new Date().toTimeString().split(" ")[0],
        visit_type: selectedApt.visit_type || "consultation",
        payment_type: "paid",
        status: "completed",
        doctor_notes: examForm.doctorNotes || null,
        diagnosis: examForm.diagnosis || null,
        created_by: user?.id || null,
      }, clinic?.id);

      // Add services to visit
      for (const svcId of examForm.selectedServices) {
        const svc = services.find(s => s.id === svcId);
        if (svc) {
          await addVisitService({
            visit_id: visit.id,
            service_id: svcId,
            quantity: 1,
            price: svc.price,
            notes: null,
          }, clinic?.id);
        }
      }

      // Create prescription if medications exist
      const validMeds = examForm.medications.filter(m => m.name.trim());
      if (validMeds.length > 0) {
        await createPrescription(
          {
            patient_id: selectedApt.patient_id,
            patient_name: selectedApt.patient_name,
            doctor_notes: examForm.labs ? `تحاليل وفحوصات:\n${examForm.labs}` : undefined,
            created_by: user?.id,
          },
          validMeds.map(m => ({ name: m.name, dosage: m.dosage || null, duration: m.duration || null, notes: null })),
          clinic?.id
        );
      }

      // Mark appointment as completed
      await updateAppointment(selectedApt.id, { status: 'completed' });

      toast({ title: "تم", description: "تم إنهاء الفحص وحفظ البيانات" });
      setShowExamDialog(false);
      refetchApts();
      refetchVisits();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const addMedicationRow = () => {
    setExamForm(prev => ({ ...prev, medications: [...prev.medications, { name: "", dosage: "", duration: "" }] }));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    setExamForm(prev => ({
      ...prev,
      medications: prev.medications.map((m, i) => i === index ? { ...m, [field]: value } : m)
    }));
  };

  const removeMedication = (index: number) => {
    setExamForm(prev => ({ ...prev, medications: prev.medications.filter((_, i) => i !== index) }));
  };

  const displayedApts = activeTab === 'waiting' ? waitingApts : activeTab === 'in-progress' ? inProgressApts : completedApts;

  if (aLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div {...anim} className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">شاشة الطبيب</h1>
          <p className="text-xs text-muted-foreground mt-0.5">إدارة الفحوصات والزيارات</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "في الانتظار", value: waitingApts.length, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
          { label: "جاري الفحص", value: inProgressApts.length, icon: Stethoscope, color: "text-primary", bg: "bg-primary/10" },
          { label: "مكتمل", value: completedApts.length, icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
          { label: "إيرادات اليوم", value: `${todayRevenue.toLocaleString()} ج.م`, icon: DollarSign, color: "text-accent", bg: "bg-accent/10" },
        ].map((stat, i) => (
          <div key={i} className="clinic-card p-4">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`h-[18px] w-[18px] ${stat.color}`} />
            </div>
            <p className="stat-value text-foreground font-en">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'waiting' as const, label: 'الانتظار', count: waitingApts.length, color: 'text-warning' },
          { key: 'in-progress' as const, label: 'جاري', count: inProgressApts.length, color: 'text-primary' },
          { key: 'completed' as const, label: 'مكتمل', count: completedApts.length, color: 'text-success' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}>
            {tab.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-primary-foreground/20' : 'bg-background'}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="clinic-card overflow-hidden">
        {displayedApts.length === 0 ? (
          <div className="p-12 text-center">
            <Stethoscope className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">لا توجد حالات</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {displayedApts.map((apt) => (
              <div key={apt.id} className="p-4 flex items-center gap-4 hover:bg-muted/20 transition-colors">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold ${
                  apt.status === 'in-progress' ? 'bg-primary/10 text-primary ring-2 ring-primary/20' :
                  apt.status === 'completed' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                }`}>
                  {apt.patient_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{apt.patient_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground font-en">{apt.time?.substring(0, 5)}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{apt.visit_type === 'consultation' ? 'استشارة' : apt.visit_type === 'followup' ? 'متابعة' : apt.visit_type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {apt.patient_id && (
                    <Link to={`/patients/${apt.patient_id}`}>
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                        <FolderOpen className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">الملف</span>
                      </Button>
                    </Link>
                  )}
                  {apt.status === 'scheduled' && (
                    <Button size="sm" onClick={() => startExam(apt)} className="gap-1.5 text-xs">
                      <Play className="h-3.5 w-3.5" />بدء الفحص
                    </Button>
                  )}
                  {apt.status === 'in-progress' && (
                    <Button size="sm" onClick={() => { setSelectedApt(apt); setShowExamDialog(true); }} className="gap-1.5 text-xs bg-success hover:bg-success/90">
                      <CheckCircle2 className="h-3.5 w-3.5" />إنهاء الفحص
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exam Dialog */}
      <Dialog open={showExamDialog} onOpenChange={setShowExamDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              فحص المريض: {selectedApt?.patient_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            {/* Diagnosis with autocomplete */}
            <div className="relative">
              <Label className="flex items-center gap-1.5"><Search className="h-3.5 w-3.5" /> التشخيص</Label>
              <Input
                value={examForm.diagnosis}
                onChange={e => {
                  setExamForm({ ...examForm, diagnosis: e.target.value });
                  setDiagnosisSearch(e.target.value);
                  setShowDiagnosisList(true);
                }}
                onFocus={() => setShowDiagnosisList(true)}
                placeholder="ابحث عن التشخيص..."
                className="mt-1.5"
              />
              {showDiagnosisList && filteredDiagnoses.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredDiagnoses.map((d, i) => (
                    <button key={i} onClick={() => { setExamForm({ ...examForm, diagnosis: d }); setShowDiagnosisList(false); }}
                      className="w-full text-right px-3 py-2 text-sm hover:bg-muted/50 transition-colors">
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Services */}
            <div>
              <Label className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> الخدمات الطبية</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {services.map(svc => (
                  <button key={svc.id}
                    onClick={() => setExamForm(prev => ({
                      ...prev,
                      selectedServices: prev.selectedServices.includes(svc.id)
                        ? prev.selectedServices.filter(s => s !== svc.id)
                        : [...prev.selectedServices, svc.id]
                    }))}
                    className={`p-2 rounded-xl text-xs font-medium text-right transition-all border ${
                      examForm.selectedServices.includes(svc.id)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/30'
                    }`}>
                    <span className="block truncate">{svc.name}</span>
                    <span className="text-[10px] text-muted-foreground font-en">{svc.price} ج.م</span>
                    {examForm.selectedServices.includes(svc.id) && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary inline mr-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Medications */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="flex items-center gap-1.5"><Pill className="h-3.5 w-3.5" /> الأدوية</Label>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" onClick={loadTemplates} className="text-xs gap-1">
                    <BookOpen className="h-3 w-3" />قوالب
                  </Button>
                  <Button size="sm" variant="outline" onClick={addMedicationRow} className="text-xs gap-1">
                    <Plus className="h-3 w-3" />إضافة
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {examForm.medications.map((med, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5 relative">
                      <Input value={med.name} onChange={e => { updateMedication(i, "name", e.target.value); searchDrugs(e.target.value); }}
                        placeholder="اسم الدواء" className="text-sm" />
                      {drugSearch === med.name && drugResults.length > 0 && med.name.length >= 2 && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg max-h-32 overflow-y-auto">
                          {drugResults.map((d: any) => (
                            <button key={d.id} onClick={() => {
                              updateMedication(i, "name", d.name);
                              if (d.default_dosage) updateMedication(i, "dosage", d.default_dosage);
                              if (d.default_duration) updateMedication(i, "duration", d.default_duration);
                              setDrugResults([]);
                            }}
                              className="w-full text-right px-3 py-1.5 text-xs hover:bg-muted/50">
                              {d.name} {d.name_en && <span className="text-muted-foreground">({d.name_en})</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="col-span-3">
                      <Input value={med.dosage} onChange={e => updateMedication(i, "dosage", e.target.value)} placeholder="الجرعة" className="text-sm" />
                    </div>
                    <div className="col-span-3">
                      <Input value={med.duration} onChange={e => updateMedication(i, "duration", e.target.value)} placeholder="المدة" className="text-sm" />
                    </div>
                    <div className="col-span-1">
                      <Button size="icon" variant="ghost" onClick={() => removeMedication(i)} className="h-8 w-8 text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Labs & Tests */}
            <div>
              <Label className="flex items-center gap-1.5"><FlaskConical className="h-3.5 w-3.5" /> التحاليل والفحوصات</Label>
              <Textarea value={examForm.labs} onChange={e => setExamForm({ ...examForm, labs: e.target.value })}
                placeholder="أدخل التحاليل المطلوبة (تحليل لكل سطر)..." className="mt-1.5" rows={3} />
            </div>

            {/* Doctor Notes */}
            <div>
              <Label className="flex items-center gap-1.5"><StickyNote className="h-3.5 w-3.5" /> ملاحظات الطبيب</Label>
              <Textarea value={examForm.doctorNotes} onChange={e => setExamForm({ ...examForm, doctorNotes: e.target.value })}
                placeholder="ملاحظات إضافية حول الفحص..." className="mt-1.5" rows={3} />
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-2 border-t border-border">
              <Button variant="outline" onClick={() => setShowExamDialog(false)}>إلغاء</Button>
              <Button onClick={finishExam} disabled={submitting} className="gap-1.5">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4" />إنهاء الفحص وحفظ</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>القوالب الجاهزة</DialogTitle></DialogHeader>
          <div className="space-y-2 mt-2 max-h-[60vh] overflow-y-auto">
            {templates.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">لا توجد قوالب بعد. يمكنك إنشاؤها من صفحة فهرس الأدوية.</p>
            ) : templates.map(t => (
              <button key={t.id} onClick={() => applyTemplate(t)}
                className="w-full text-right p-3 rounded-xl border border-border hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{t.name}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {t.template_type === 'medication' ? 'أدوية' : 'تحاليل'}
                  </Badge>
                </div>
                {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">{(t.items || []).length} عنصر</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
