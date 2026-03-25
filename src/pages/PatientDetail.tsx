import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Phone, MapPin, AlertTriangle, Calendar, FileText,
  Pill, Activity, StickyNote, Upload, Plus, Star, Loader2,
  Image, FlaskConical, Download, Clock, Brain, Mic, MicOff, ClipboardList,
  TrendingUp, Shield, BarChart3, ChevronDown, ChevronUp
} from "lucide-react";
import {
  usePatient, useDoctorNotes, usePatientFiles, useFollowUps,
  createDoctorNote, uploadPatientFile, createFollowUp, updateFollowUp,
  getSignedFileUrl, renamePatientFile, type DoctorNote
} from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "tween" as const, ease: [0.2, 0, 0, 1] as const, duration: 0.25 },
};

const timelineIcons: Record<string, typeof Activity> = {
  visit: Calendar, lab: Activity, prescription: Pill, surgery: FileText, note: StickyNote,
};
const timelineColors: Record<string, string> = {
  visit: 'bg-primary/10 text-primary', lab: 'bg-accent/10 text-accent',
  prescription: 'bg-success/10 text-success', surgery: 'bg-warning/10 text-warning',
  note: 'bg-muted text-muted-foreground',
};
const maritalLabels: Record<string, string> = { single: 'أعزب', married: 'متزوج', divorced: 'مطلق', widowed: 'أرمل' };

export default function PatientDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { patient, loading: patientLoading } = usePatient(id!);
  const { data: notes, loading: notesLoading, refetch: refetchNotes } = useDoctorNotes(id!);
  const { data: files, refetch: refetchFiles } = usePatientFiles(id!);
  const { data: followUps, refetch: refetchFollowUps } = useFollowUps(id!);

  const [showAddNote, setShowAddNote] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'timeline' | 'files' | 'followups' | 'behavior'>('summary');

  // AI Summary
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Voice Notes
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  // Behavior Analysis
  const [behaviorData, setBehaviorData] = useState<any>(null);
  const [behaviorLoading, setBehaviorLoading] = useState(false);

  // Note form
  const [noteForm, setNoteForm] = useState({ type: 'note', title: '', description: '' });
  const [uploadForm, setUploadForm] = useState({ fileType: 'lab', notes: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [followUpForm, setFollowUpForm] = useState({ date: '', reason: '' });

  // Pre-visit form data
  const [preVisitForm, setPreVisitForm] = useState<any>(null);

  // Fetch AI summary
  const fetchSummary = useCallback(async () => {
    if (!id) return;
    setSummaryLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-medical", {
        body: { action: "doctor_summary", patient_id: id },
      });
      if (error) throw error;
      setAiSummary(data);
      if (data?.pre_visit_form) setPreVisitForm(data.pre_visit_form);
    } catch (err) {
      console.error("Summary error:", err);
    }
    setSummaryLoading(false);
  }, [id]);

  // Fetch behavior analysis
  const fetchBehavior = useCallback(async () => {
    if (!id) return;
    setBehaviorLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-medical", {
        body: { action: "behavior_analysis", patient_id: id },
      });
      if (error) throw error;
      setBehaviorData(data);
    } catch (err) {
      console.error("Behavior error:", err);
    }
    setBehaviorLoading(false);
  }, [id]);

  useEffect(() => {
    if (activeTab === 'summary' && !aiSummary && !summaryLoading) fetchSummary();
    if (activeTab === 'behavior' && !behaviorData && !behaviorLoading) fetchBehavior();
  }, [activeTab]);

  // Voice recording
  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "غير مدعوم", description: "متصفحك لا يدعم التعرف على الصوت", variant: "destructive" });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "ar-SA";
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = "";
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setVoiceTranscript(finalTranscript + interim);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const stopRecording = async () => {
    recognitionRef.current?.stop();
    setIsRecording(false);

    if (voiceTranscript.trim()) {
      // Clean up via AI
      try {
        const { data } = await supabase.functions.invoke("ai-medical", {
          body: { action: "transcribe", data: { text: voiceTranscript } },
        });
        if (data?.cleaned_text) {
          setVoiceTranscript(data.cleaned_text);
        }
      } catch {}
    }
  };

  const saveVoiceNote = async () => {
    if (!voiceTranscript.trim()) return;
    setSubmitting(true);
    try {
      // Save as doctor note
      await createDoctorNote({
        patient_id: id!, type: 'note', title: 'ملاحظة صوتية',
        description: voiceTranscript.trim(),
        date: new Date().toISOString().split('T')[0],
        created_by: user?.id || null,
      });
      // Also save in voice_notes table
      await (supabase.from("voice_notes" as any) as any).insert({
        patient_id: id!, transcription: voiceTranscript.trim(),
        created_by: user?.id || null, clinic_id: null,
      });
      toast({ title: "✅ تم حفظ الملاحظة الصوتية" });
      setVoiceTranscript("");
      refetchNotes();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  if (patientLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!patient) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">لم يتم العثور على المريض</div>;
  }

  const handleAddNote = async () => {
    if (!noteForm.title.trim()) return;
    setSubmitting(true);
    try {
      await createDoctorNote({
        patient_id: id!, type: noteForm.type, title: noteForm.title.trim(),
        description: noteForm.description.trim() || null, date: new Date().toISOString().split('T')[0],
        created_by: user?.id || null,
      });
      toast({ title: "تم", description: "تمت إضافة الملاحظة" });
      setShowAddNote(false);
      setNoteForm({ type: 'note', title: '', description: '' });
      refetchNotes();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setSubmitting(true);
    try {
      await uploadPatientFile(id!, selectedFile, uploadForm.fileType, uploadForm.notes, user?.id || '');
      toast({ title: "تم", description: "تم رفع الملف بنجاح" });
      setShowUpload(false);
      setSelectedFile(null);
      setUploadForm({ fileType: 'lab', notes: '' });
      refetchFiles();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleAddFollowUp = async () => {
    if (!followUpForm.date) return;
    setSubmitting(true);
    try {
      await createFollowUp({
        patient_id: id!, follow_up_date: followUpForm.date,
        reason: followUpForm.reason.trim() || null, status: 'pending',
        created_by: user?.id || null, appointment_id: null,
      });
      toast({ title: "تم", description: "تم جدولة المتابعة" });
      setShowFollowUp(false);
      setFollowUpForm({ date: '', reason: '' });
      refetchFollowUps();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleCompleteFollowUp = async (fuId: string) => {
    try {
      await updateFollowUp(fuId, { status: 'completed' });
      toast({ title: "تم", description: "تم إكمال المتابعة" });
      refetchFollowUps();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const handleDownloadFile = async (filePath: string) => {
    try {
      const url = await getSignedFileUrl(filePath);
      window.open(url, '_blank');
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const fileTypeLabels: Record<string, string> = { lab: 'تحليل', radiology: 'أشعة', prescription: 'وصفة', other: 'آخر' };
  const fileTypeIcons: Record<string, typeof Activity> = { lab: FlaskConical, radiology: Image, prescription: FileText, other: FileText };

  const riskColor = aiSummary?.risk_level === 'high' ? 'text-destructive' : aiSummary?.risk_level === 'medium' ? 'text-warning' : 'text-success';
  const riskBg = aiSummary?.risk_level === 'high' ? 'bg-destructive/10' : aiSummary?.risk_level === 'medium' ? 'bg-warning/10' : 'bg-success/10';

  return (
    <motion.div {...pageTransition} className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/patients" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight className="h-4 w-4" />العودة للمرضى
        </Link>
        <span className="text-muted-foreground/30">|</span>
        <Link to="/patient-journey" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Activity className="h-4 w-4" />رحلة المريض
        </Link>
      </div>

      {/* Patient Info Card */}
      <div className="clinic-card p-4 lg:p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
            {patient.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground">{patient.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /><span className="font-en">{patient.phone}</span></span>
              {patient.age && <span>{patient.age} سنة</span>}
              {patient.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{patient.address}</span>}
              <span>{maritalLabels[patient.marital_status] || patient.marital_status}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">التاريخ المرضي</p>
            <p className="text-sm">{patient.medical_history || 'لا يوجد'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">العمليات السابقة</p>
            <p className="text-sm">{patient.previous_surgeries || 'لا يوجد'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">الأدوية الحالية</p>
            <div className="flex flex-wrap gap-1">
              {patient.current_medications.length > 0 ? patient.current_medications.map((med, i) => (
                <Badge key={i} variant="secondary" className="text-[10px] font-en">{med}</Badge>
              )) : <span className="text-sm">لا يوجد</span>}
            </div>
          </div>
        </div>

        {patient.allergies.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-destructive">حساسية</p>
              <p className="text-xs text-destructive/80 mt-0.5">{patient.allergies.join('، ')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={() => setShowAddNote(true)} className="gap-1.5">
          <StickyNote className="h-3.5 w-3.5" />ملاحظة
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowUpload(true)} className="gap-1.5">
          <Upload className="h-3.5 w-3.5" />رفع ملف
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowFollowUp(true)} className="gap-1.5">
          <Clock className="h-3.5 w-3.5" />جدولة متابعة
        </Button>
        <Button size="sm" variant={isRecording ? "destructive" : "outline"} onClick={isRecording ? stopRecording : startRecording} className="gap-1.5">
          {isRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
          {isRecording ? "إيقاف التسجيل" : "ملاحظة صوتية"}
        </Button>
      </div>

      {/* Voice Recording UI */}
      <AnimatePresence>
        {(isRecording || voiceTranscript) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="clinic-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${isRecording ? "bg-destructive animate-pulse" : "bg-success"}`} />
              <span className="text-xs font-medium text-foreground">{isRecording ? "جاري التسجيل..." : "تم التسجيل"}</span>
            </div>
            {voiceTranscript && (
              <div className="bg-muted/50 rounded-lg p-3 mb-3">
                <p className="text-sm text-foreground leading-relaxed">{voiceTranscript}</p>
              </div>
            )}
            {!isRecording && voiceTranscript && (
              <div className="flex gap-2">
                <Button size="sm" onClick={saveVoiceNote} disabled={submitting} className="gap-1.5">
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <StickyNote className="h-3.5 w-3.5" />}حفظ كملاحظة
                </Button>
                <Button size="sm" variant="outline" onClick={() => setVoiceTranscript("")}>مسح</Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0 border-b border-border scrollbar-hide">
        {[
          { key: 'summary' as const, label: 'ملخص ذكي', icon: Brain, count: null },
          { key: 'timeline' as const, label: 'السجل', icon: Calendar, count: notes.length },
          { key: 'files' as const, label: 'الملفات', icon: FileText, count: files.length },
          { key: 'followups' as const, label: 'المتابعات', icon: Clock, count: followUps.length },
          { key: 'behavior' as const, label: 'تحليل السلوك', icon: BarChart3, count: null },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 text-xs px-3 py-2.5 font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}>
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}{tab.count !== null ? ` (${tab.count})` : ''}
          </button>
        ))}
      </div>

      {/* ── Smart Summary Tab ── */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          {summaryLoading ? (
            <div className="clinic-card p-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">جاري إنشاء الملخص الذكي...</p>
            </div>
          ) : aiSummary?.error ? (
            <div className="clinic-card p-6 text-center">
              <p className="text-sm text-muted-foreground">لم نتمكن من إنشاء الملخص حالياً</p>
              <Button size="sm" variant="outline" onClick={fetchSummary} className="mt-3">إعادة المحاولة</Button>
            </div>
          ) : aiSummary ? (
            <>
              {/* Risk Level */}
              <div className={`clinic-card p-4 ${riskBg} border-${aiSummary.risk_level === 'high' ? 'destructive' : aiSummary.risk_level === 'medium' ? 'warning' : 'success'}/20`}>
                <div className="flex items-center gap-2">
                  <Shield className={`h-5 w-5 ${riskColor}`} />
                  <span className={`text-sm font-bold ${riskColor}`}>
                    مستوى المخاطر: {aiSummary.risk_level === 'high' ? 'مرتفع' : aiSummary.risk_level === 'medium' ? 'متوسط' : 'منخفض'}
                  </span>
                </div>
              </div>

              {/* Summary */}
              <div className="clinic-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />الملخص الذكي
                </h3>
                <p className="text-sm text-foreground leading-relaxed">{aiSummary.summary}</p>
              </div>

              {/* Key Findings */}
              {aiSummary.key_findings?.length > 0 && (
                <div className="clinic-card p-4">
                  <h3 className="text-sm font-bold text-foreground mb-2">النتائج الرئيسية</h3>
                  <div className="space-y-1.5">
                    {aiSummary.key_findings.map((f: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /><span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Critical Alerts */}
              {aiSummary.critical_alerts?.length > 0 && (
                <div className="clinic-card p-4 border-destructive/20 bg-destructive/5">
                  <h3 className="text-sm font-bold text-destructive mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />تنبيهات حرجة
                  </h3>
                  <div className="space-y-1.5">
                    {aiSummary.critical_alerts.map((a: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-destructive">
                        <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" /><span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Actions */}
              {aiSummary.recommended_actions?.length > 0 && (
                <div className="clinic-card p-4">
                  <h3 className="text-sm font-bold text-foreground mb-2">الإجراءات المقترحة</h3>
                  <div className="space-y-1.5">
                    {aiSummary.recommended_actions.map((a: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" /><span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pre-Visit Form */}
              {preVisitForm && (
                <div className="clinic-card p-4 border-accent/20 bg-accent/5">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-accent" />نموذج ما قبل الزيارة (مملوء من المريض)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div><p className="text-muted-foreground">الأعراض</p><p className="text-foreground mt-0.5">{preVisitForm.symptoms || "لم يُذكر"}</p></div>
                    <div><p className="text-muted-foreground">الشكوى</p><p className="text-foreground mt-0.5">{preVisitForm.complaints || "لم يُذكر"}</p></div>
                    <div><p className="text-muted-foreground">مستوى الألم</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Progress value={preVisitForm.pain_level * 10} className="h-2 flex-1" />
                        <span className={`font-bold ${preVisitForm.pain_level > 7 ? 'text-destructive' : preVisitForm.pain_level > 4 ? 'text-warning' : 'text-success'}`}>{preVisitForm.pain_level}/10</span>
                      </div>
                    </div>
                    {preVisitForm.additional_notes && <div className="sm:col-span-2"><p className="text-muted-foreground">ملاحظات إضافية</p><p className="text-foreground mt-0.5">{preVisitForm.additional_notes}</p></div>}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="clinic-card p-8 text-center">
              <Brain className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">اضغط لإنشاء ملخص ذكي للمريض</p>
              <Button size="sm" onClick={fetchSummary} className="mt-3 gap-1.5"><Brain className="h-3.5 w-3.5" />إنشاء الملخص</Button>
            </div>
          )}
        </div>
      )}

      {/* ── Timeline Tab ── */}
      {activeTab === 'timeline' && (
        <div className="clinic-card">
          <div className="p-4">
            {notesLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : notes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">لا يوجد سجل طبي متاح</p>
            ) : (
              <div className="relative">
                <div className="absolute right-[19px] top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4">
                  {notes.map((event) => {
                    const Icon = timelineIcons[event.type] || StickyNote;
                    const colorClass = timelineColors[event.type] || timelineColors.note;
                    return (
                      <div key={event.id} className="flex gap-3 relative">
                        <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center shrink-0 z-10`}><Icon className="h-4 w-4" /></div>
                        <div className="flex-1 min-w-0 pb-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground">{event.title}</p>
                            <span className="text-[10px] text-muted-foreground font-en">{event.date}</span>
                          </div>
                          {event.description && <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Files Tab ── */}
      {activeTab === 'files' && (
        <div className="clinic-card">
          {files.length === 0 ? (
            <div className="p-8 text-center"><Upload className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" /><p className="text-sm text-muted-foreground">لا يوجد ملفات</p></div>
          ) : (
            <div className="divide-y divide-border">
              {files.map((file) => {
                const FileIcon = fileTypeIcons[file.file_type] || FileText;
                return (
                  <div key={file.id} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><FileIcon className="h-4 w-4 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.file_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[9px]">{fileTypeLabels[file.file_type] || file.file_type}</Badge>
                        <span className="text-[10px] text-muted-foreground font-en">{new Date(file.created_at).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleDownloadFile(file.file_path)}><Download className="h-4 w-4" /></Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Follow-ups Tab ── */}
      {activeTab === 'followups' && (
        <div className="clinic-card">
          {followUps.length === 0 ? (
            <div className="p-8 text-center"><Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" /><p className="text-sm text-muted-foreground">لا يوجد متابعات</p></div>
          ) : (
            <div className="divide-y divide-border">
              {followUps.map((fu) => (
                <div key={fu.id} className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    fu.status === 'completed' ? 'bg-success/10' : fu.status === 'missed' ? 'bg-destructive/10' : 'bg-warning/10'
                  }`}>
                    <Calendar className={`h-4 w-4 ${fu.status === 'completed' ? 'text-success' : fu.status === 'missed' ? 'text-destructive' : 'text-warning'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground font-en">{fu.follow_up_date}</p>
                    {fu.reason && <p className="text-xs text-muted-foreground mt-0.5">{fu.reason}</p>}
                  </div>
                  <Badge variant={fu.status === 'completed' ? 'default' : fu.status === 'missed' ? 'destructive' : 'secondary'} className="text-[10px]">
                    {fu.status === 'completed' ? 'مكتمل' : fu.status === 'missed' ? 'فائت' : 'قادم'}
                  </Badge>
                  {fu.status === 'pending' && (
                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => handleCompleteFollowUp(fu.id)}>✓ إكمال</Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Behavior Analysis Tab ── */}
      {activeTab === 'behavior' && (
        <div className="space-y-4">
          {behaviorLoading ? (
            <div className="clinic-card p-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">جاري تحليل السلوك...</p>
            </div>
          ) : behaviorData?.error ? (
            <div className="clinic-card p-6 text-center">
              <p className="text-sm text-muted-foreground">لم نتمكن من تحليل السلوك حالياً</p>
              <Button size="sm" variant="outline" onClick={fetchBehavior} className="mt-3">إعادة المحاولة</Button>
            </div>
          ) : behaviorData ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="clinic-card p-4 text-center">
                  <p className="text-2xl font-bold text-primary font-en">{behaviorData.compliance_score || 0}%</p>
                  <p className="text-[10px] text-muted-foreground mt-1">الالتزام</p>
                </div>
                <div className="clinic-card p-4 text-center">
                  <p className={`text-sm font-bold ${
                    behaviorData.engagement_level === 'high' ? 'text-success' :
                    behaviorData.engagement_level === 'medium' ? 'text-warning' : 'text-destructive'
                  }`}>
                    {behaviorData.engagement_level === 'high' ? 'مرتفع' :
                     behaviorData.engagement_level === 'medium' ? 'متوسط' : 'منخفض'}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">مستوى التفاعل</p>
                </div>
              </div>

              {behaviorData.risk_factors?.length > 0 && (
                <div className="clinic-card p-4">
                  <h3 className="text-sm font-bold text-foreground mb-2">عوامل الخطر</h3>
                  <div className="space-y-1.5">
                    {behaviorData.risk_factors.map((r: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" /><span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {behaviorData.recommendations?.length > 0 && (
                <div className="clinic-card p-4">
                  <h3 className="text-sm font-bold text-foreground mb-2">التوصيات</h3>
                  <div className="space-y-1.5">
                    {behaviorData.recommendations.map((r: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" /><span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="clinic-card p-8 text-center">
              <BarChart3 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">تحليل سلوك المريض بالذكاء الاصطناعي</p>
              <Button size="sm" onClick={fetchBehavior} className="mt-3 gap-1.5"><BarChart3 className="h-3.5 w-3.5" />بدء التحليل</Button>
            </div>
          )}
        </div>
      )}

      {/* ── Dialogs ── */}
      <Dialog open={showAddNote} onOpenChange={setShowAddNote}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>إضافة ملاحظة طبية</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>نوع الملاحظة</Label>
              <Select value={noteForm.type} onValueChange={v => setNoteForm({...noteForm, type: v})}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="visit">زيارة</SelectItem>
                  <SelectItem value="lab">تحليل</SelectItem>
                  <SelectItem value="prescription">وصفة</SelectItem>
                  <SelectItem value="surgery">عملية</SelectItem>
                  <SelectItem value="note">ملاحظة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>العنوان *</Label>
              <Input value={noteForm.title} onChange={e => setNoteForm({...noteForm, title: e.target.value})} placeholder="مثال: زيارة استشارية" className="mt-1.5" />
            </div>
            <div>
              <Label>التفاصيل</Label>
              <Textarea value={noteForm.description} onChange={e => setNoteForm({...noteForm, description: e.target.value})} placeholder="تفاصيل إضافية..." className="mt-1.5" rows={3} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddNote(false)}>إلغاء</Button>
              <Button onClick={handleAddNote} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "إضافة"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>رفع ملف طبي</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>نوع الملف</Label>
              <Select value={uploadForm.fileType} onValueChange={v => setUploadForm({...uploadForm, fileType: v})}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lab">تحليل</SelectItem>
                  <SelectItem value="radiology">أشعة</SelectItem>
                  <SelectItem value="prescription">وصفة</SelectItem>
                  <SelectItem value="other">آخر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>اختر الملف *</Label>
              <input ref={fileInputRef} type="file" accept="image/*,.pdf"
                onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                className="mt-1.5 w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-xs file:font-medium file:text-primary hover:file:bg-primary/20" />
              <div className="mt-2 flex gap-2">
                <input ref={el => { if (el) el.setAttribute('capture', 'environment'); }} type="file" accept="image/*" capture="environment"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden" id="camera-capture-detail" />
                <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs flex-1" onClick={() => document.getElementById('camera-capture-detail')?.click()}>
                  📷 التقاط من الكاميرا
                </Button>
              </div>
            </div>
            <div>
              <Label>ملاحظات</Label>
              <Textarea value={uploadForm.notes} onChange={e => setUploadForm({...uploadForm, notes: e.target.value})} placeholder="وصف الملف..." className="mt-1.5" rows={2} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowUpload(false)}>إلغاء</Button>
              <Button onClick={handleUpload} disabled={submitting || !selectedFile}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "رفع"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFollowUp} onOpenChange={setShowFollowUp}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>جدولة متابعة</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>تاريخ المتابعة *</Label>
              <Input type="date" value={followUpForm.date} onChange={e => setFollowUpForm({...followUpForm, date: e.target.value})} className="mt-1.5 font-en" dir="ltr" />
            </div>
            <div>
              <Label>السبب</Label>
              <Textarea value={followUpForm.reason} onChange={e => setFollowUpForm({...followUpForm, reason: e.target.value})} placeholder="سبب المتابعة..." className="mt-1.5" rows={2} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowFollowUp(false)}>إلغاء</Button>
              <Button onClick={handleAddFollowUp} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "جدولة"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
