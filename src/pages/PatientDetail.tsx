import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Phone, MapPin, AlertTriangle, Calendar, FileText,
  Pill, Activity, StickyNote, Upload, Plus, Star, Loader2,
  Image, FlaskConical, Download, Clock
} from "lucide-react";
import {
  usePatient, useDoctorNotes, usePatientFiles, useFollowUps,
  createDoctorNote, uploadPatientFile, createFollowUp, updateFollowUp,
  getSignedFileUrl, type DoctorNote
} from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [activeTab, setActiveTab] = useState<'timeline' | 'files' | 'followups'>('timeline');

  // Note form
  const [noteForm, setNoteForm] = useState({ type: 'note', title: '', description: '' });
  // Upload form
  const [uploadForm, setUploadForm] = useState({ fileType: 'lab', notes: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Follow-up form
  const [followUpForm, setFollowUpForm] = useState({ date: '', reason: '' });

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

  const handleDownloadFile = async (filePath: string, fileName: string) => {
    try {
      const url = await getSignedFileUrl(filePath);
      window.open(url, '_blank');
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const fileTypeLabels: Record<string, string> = { lab: 'تحليل', radiology: 'أشعة', prescription: 'وصفة', other: 'آخر' };
  const fileTypeIcons: Record<string, typeof Activity> = { lab: FlaskConical, radiology: Image, prescription: FileText, other: FileText };

  return (
    <motion.div {...pageTransition} className="space-y-4">
      <Link to="/patients" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowRight className="h-4 w-4" />العودة للمرضى
      </Link>

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
              {patient.current_medications.length > 0 ? (
                patient.current_medications.map((med, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] font-en">{med}</Badge>
                ))
              ) : (<span className="text-sm">لا يوجد</span>)}
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
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border pb-0">
        {[
          { key: 'timeline' as const, label: 'السجل الطبي', count: notes.length },
          { key: 'files' as const, label: 'الملفات', count: files.length },
          { key: 'followups' as const, label: 'المتابعات', count: followUps.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-xs px-3 py-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="clinic-card">
          <div className="p-4">
            {notesLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : notes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">لا يوجد سجل طبي متاح. ابدأ بإضافة ملاحظة جديدة.</p>
            ) : (
              <div className="relative">
                <div className="absolute right-[19px] top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4">
                  {notes.map((event) => {
                    const Icon = timelineIcons[event.type] || StickyNote;
                    const colorClass = timelineColors[event.type] || timelineColors.note;
                    return (
                      <div key={event.id} className="flex gap-3 relative">
                        <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center shrink-0 z-10`}>
                          <Icon className="h-4 w-4" />
                        </div>
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

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div className="clinic-card">
          {files.length === 0 ? (
            <div className="p-8 text-center">
              <Upload className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">لا يوجد ملفات. ارفع تحاليل أو أشعة</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {files.map((file) => {
                const FileIcon = fileTypeIcons[file.file_type] || FileText;
                return (
                  <div key={file.id} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.file_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[9px]">{fileTypeLabels[file.file_type] || file.file_type}</Badge>
                        <span className="text-[10px] text-muted-foreground font-en">{new Date(file.created_at).toLocaleDateString('ar-SA')}</span>
                      </div>
                      {file.notes && <p className="text-[11px] text-muted-foreground mt-1">{file.notes}</p>}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleDownloadFile(file.file_path, file.file_name)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Follow-ups Tab */}
      {activeTab === 'followups' && (
        <div className="clinic-card">
          {followUps.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">لا يوجد متابعات مجدولة</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {followUps.map((fu) => (
                <div key={fu.id} className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    fu.status === 'completed' ? 'bg-success/10' : fu.status === 'missed' ? 'bg-destructive/10' : 'bg-warning/10'
                  }`}>
                    <Calendar className={`h-4 w-4 ${
                      fu.status === 'completed' ? 'text-success' : fu.status === 'missed' ? 'text-destructive' : 'text-warning'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground font-en">{fu.follow_up_date}</p>
                    {fu.reason && <p className="text-xs text-muted-foreground mt-0.5">{fu.reason}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={fu.status === 'completed' ? 'default' : fu.status === 'missed' ? 'destructive' : 'secondary'} className="text-[10px]">
                      {fu.status === 'completed' ? 'مكتمل' : fu.status === 'missed' ? 'فائت' : 'قادم'}
                    </Badge>
                    {fu.status === 'pending' && (
                      <Button size="sm" variant="ghost" className="text-xs" onClick={() => handleCompleteFollowUp(fu.id)}>
                        ✓ إكمال
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Note Dialog */}
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

      {/* Upload Dialog */}
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                className="mt-1.5 w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-xs file:font-medium file:text-primary hover:file:bg-primary/20"
              />
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

      {/* Follow-up Dialog */}
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
