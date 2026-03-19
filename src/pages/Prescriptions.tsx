import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Printer, Pill, Loader2 } from "lucide-react";
import { usePrescriptions, createPrescription, usePatients } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "tween" as const, ease: [0.2, 0, 0, 1] as const, duration: 0.25 },
};

interface MedEntry { name: string; dosage: string; duration: string; notes: string; }

const dosageOptions = ["مرة يومياً", "مرتين يومياً", "ثلاث مرات يومياً", "قبل النوم", "بعد الأكل", "قبل الأكل"];
const durationOptions = ["5 أيام", "أسبوع", "أسبوعين", "شهر", "شهرين", "3 أشهر"];

const mockMedications = [
  'كلوميفين 50mg', 'تاموكسيفين 20mg', 'أناسترازول 1mg',
  'تستوستيرون 250mg', 'HCG 5000 IU', 'سيلدينافيل 50mg',
  'تادالافيل 20mg', 'تامسولوسين 0.4mg', 'فيناسترايد 5mg',
  'دوكسازوسين 4mg', 'فيتامين E 400mg', 'زنك 50mg',
  'L-Carnitine 1000mg', 'CoQ10 200mg', 'حمض الفوليك 5mg',
];

export default function Prescriptions() {
  const { data: prescriptions, loading, refetch } = usePrescriptions();
  const { data: patients } = usePatients();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [medications, setMedications] = useState<MedEntry[]>([]);
  const [medSearch, setMedSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ patientId: '', patientName: '', doctorNotes: '' });
  const printRef = useRef<HTMLDivElement>(null);

  const filteredMeds = mockMedications.filter((m) => m.includes(medSearch));

  const addMed = (name: string) => {
    setMedications([...medications, { name, dosage: "مرة يومياً", duration: "شهر", notes: "" }]);
    setMedSearch("");
  };

  const removeMed = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.patientName.trim() || medications.length === 0) {
      toast({ title: "خطأ", description: "يرجى تحديد المريض وإضافة أدوية", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await createPrescription(
        {
          patient_id: form.patientId || undefined,
          patient_name: form.patientName.trim(),
          doctor_notes: form.doctorNotes.trim() || undefined,
          created_by: user?.id,
        },
        medications.map(m => ({ name: m.name, dosage: m.dosage, duration: m.duration, notes: m.notes }))
      );
      toast({ title: "تم", description: "تم إصدار الوصفة بنجاح" });
      setShowCreate(false);
      setMedications([]);
      setForm({ patientId: '', patientName: '', doctorNotes: '' });
      refetch();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handlePrint = (rx: typeof prescriptions[0]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html dir="rtl"><head><title>وصفة طبية - Smart Clinic</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; max-width: 600px; margin: auto; }
        h1 { text-align: center; color: #1a56db; font-size: 24px; margin-bottom: 4px; }
        .subtitle { text-align: center; color: #666; font-size: 12px; margin-bottom: 30px; }
        .info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; }
        .med { background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 8px; }
        .med-name { font-weight: bold; font-size: 14px; }
        .med-details { color: #666; font-size: 12px; margin-top: 4px; }
        .notes { margin-top: 20px; padding: 12px; border: 1px dashed #ddd; border-radius: 8px; font-size: 13px; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 11px; }
        @media print { body { padding: 20px; } }
      </style></head><body>
        <h1>🏥 Smart Clinic</h1>
        <p class="subtitle">عيادة أمراض الذكورة والعقم</p>
        <div class="info">
          <span>المريض: <strong>${rx.patient_name}</strong></span>
          <span>التاريخ: ${rx.date}</span>
        </div>
        <h3>الأدوية:</h3>
        ${(rx.medications || []).map(m => `
          <div class="med">
            <div class="med-name">${m.name}</div>
            <div class="med-details">${m.dosage || ''} • ${m.duration || ''} ${m.notes ? `• ${m.notes}` : ''}</div>
          </div>
        `).join('')}
        ${rx.doctor_notes ? `<div class="notes"><strong>ملاحظات:</strong> ${rx.doctor_notes}</div>` : ''}
        <div class="footer">Smart Clinic Management System - تمت الطباعة: ${new Date().toLocaleString('ar-SA')}</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div {...pageTransition} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">الوصفات الطبية</h1>
        <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">وصفة جديدة</span>
          <span className="sm:hidden">إضافة</span>
        </Button>
      </div>

      {prescriptions.length === 0 ? (
        <div className="clinic-card p-12 text-center">
          <p className="text-sm text-muted-foreground">لا توجد وصفات. أنشئ أول وصفة طبية</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="clinic-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{rx.patient_name}</p>
                  <p className="text-xs text-muted-foreground font-en">{rx.date}</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => handlePrint(rx)}>
                  <Printer className="h-3.5 w-3.5" />طباعة
                </Button>
              </div>
              <div className="space-y-2">
                {(rx.medications || []).map((med, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                    <Pill className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-sm font-en">{med.name}</span>
                    {med.dosage && <span className="text-xs text-muted-foreground">• {med.dosage}</span>}
                    {med.duration && <span className="text-xs text-muted-foreground">• {med.duration}</span>}
                  </div>
                ))}
              </div>
              {rx.doctor_notes && (
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">{rx.doctor_notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Prescription Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>إنشاء وصفة طبية</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>المريض *</Label>
              <Select value={form.patientId} onValueChange={v => {
                const p = patients.find(p => p.id === v);
                if (p) setForm({...form, patientId: v, patientName: p.name});
              }}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="اختر مريض" /></SelectTrigger>
                <SelectContent>
                  {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input value={form.patientName} onChange={e => setForm({...form, patientName: e.target.value})} placeholder="أو أدخل اسم" className="mt-1.5" />
            </div>

            <div>
              <Label>إضافة دواء</Label>
              <Input placeholder="ابحث عن الدواء..." value={medSearch} onChange={(e) => setMedSearch(e.target.value)} className="mt-1.5 font-en" />
              {medSearch && (
                <div className="mt-1 clinic-card max-h-32 overflow-y-auto divide-y divide-border">
                  {filteredMeds.map((med) => (
                    <button key={med} onClick={() => addMed(med)} className="w-full text-right px-3 py-2 text-sm hover:bg-muted/50 transition-colors font-en">{med}</button>
                  ))}
                </div>
              )}
            </div>

            {medications.length > 0 && (
              <div className="space-y-2">
                <Label>الأدوية المضافة</Label>
                {medications.map((med, i) => (
                  <div key={i} className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium font-en">{med.name}</span>
                      <button onClick={() => removeMed(i)} className="text-xs text-destructive hover:underline">حذف</button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {dosageOptions.map((d) => (
                        <button key={d} onClick={() => { const u = [...medications]; u[i].dosage = d; setMedications(u); }}
                          className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                            med.dosage === d ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'
                          }`}>{d}</button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {durationOptions.map((d) => (
                        <button key={d} onClick={() => { const u = [...medications]; u[i].duration = d; setMedications(u); }}
                          className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                            med.duration === d ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'
                          }`}>{d}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <Label>ملاحظات الطبيب</Label>
              <Textarea value={form.doctorNotes} onChange={e => setForm({...form, doctorNotes: e.target.value})} placeholder="ملاحظات إضافية..." className="mt-1.5" rows={2} />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>إلغاء</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "إصدار الوصفة"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
