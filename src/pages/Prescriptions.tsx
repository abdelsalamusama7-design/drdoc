import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Printer, Pill } from "lucide-react";
import { mockMedications } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "tween" as const, ease: [0.2, 0, 0, 1], duration: 0.25 },
};

interface MedEntry {
  name: string;
  dosage: string;
  duration: string;
  notes: string;
}

const dosageOptions = ["مرة يومياً", "مرتين يومياً", "ثلاث مرات يومياً", "قبل النوم", "بعد الأكل", "قبل الأكل"];
const durationOptions = ["5 أيام", "أسبوع", "أسبوعين", "شهر", "شهرين", "3 أشهر"];

const mockPrescriptions = [
  {
    id: '1', patientName: 'أحمد محمد علي', date: '2025-03-15',
    medications: [
      { name: 'كلوميفين 50mg', dosage: 'مرة يومياً', duration: 'شهر', notes: '' },
      { name: 'زنك 50mg', dosage: 'مرة يومياً', duration: '3 أشهر', notes: 'بعد الأكل' },
    ],
    doctorNotes: 'مراجعة بعد شهر مع تحليل هرمونات'
  },
  {
    id: '2', patientName: 'خالد عبدالله السعيد', date: '2025-03-14',
    medications: [
      { name: 'تامسولوسين 0.4mg', dosage: 'قبل النوم', duration: 'شهر', notes: '' },
    ],
    doctorNotes: ''
  },
];

export default function Prescriptions() {
  const [showCreate, setShowCreate] = useState(false);
  const [medications, setMedications] = useState<MedEntry[]>([]);
  const [medSearch, setMedSearch] = useState("");

  const filteredMeds = mockMedications.filter((m) => m.includes(medSearch));

  const addMed = (name: string) => {
    setMedications([...medications, { name, dosage: "مرة يومياً", duration: "شهر", notes: "" }]);
    setMedSearch("");
  };

  const removeMed = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

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

      {/* Prescriptions List */}
      <div className="space-y-3">
        {mockPrescriptions.map((rx) => (
          <div key={rx.id} className="clinic-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-foreground">{rx.patientName}</p>
                <p className="text-xs text-muted-foreground font-en">{rx.date}</p>
              </div>
              <Button size="sm" variant="outline" className="gap-1.5 h-8">
                <Printer className="h-3.5 w-3.5" />
                طباعة
              </Button>
            </div>
            <div className="space-y-2">
              {rx.medications.map((med, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                  <Pill className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-sm font-en">{med.name}</span>
                  <span className="text-xs text-muted-foreground">• {med.dosage}</span>
                  <span className="text-xs text-muted-foreground">• {med.duration}</span>
                </div>
              ))}
            </div>
            {rx.doctorNotes && (
              <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">{rx.doctorNotes}</p>
            )}
          </div>
        ))}
      </div>

      {/* Create Prescription Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إنشاء وصفة طبية</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>اسم المريض</Label>
              <Input placeholder="بحث عن مريض" className="mt-1.5" />
            </div>

            {/* Medication Search */}
            <div>
              <Label>إضافة دواء</Label>
              <Input
                placeholder="ابحث عن الدواء..."
                value={medSearch}
                onChange={(e) => setMedSearch(e.target.value)}
                className="mt-1.5 font-en"
              />
              {medSearch && (
                <div className="mt-1 clinic-card max-h-32 overflow-y-auto divide-y divide-border">
                  {filteredMeds.map((med) => (
                    <button
                      key={med}
                      onClick={() => addMed(med)}
                      className="w-full text-right px-3 py-2 text-sm hover:bg-muted/50 transition-colors font-en"
                    >
                      {med}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Added Medications */}
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
                        <button
                          key={d}
                          onClick={() => {
                            const updated = [...medications];
                            updated[i].dosage = d;
                            setMedications(updated);
                          }}
                          className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                            med.dosage === d ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {durationOptions.map((d) => (
                        <button
                          key={d}
                          onClick={() => {
                            const updated = [...medications];
                            updated[i].duration = d;
                            setMedications(updated);
                          }}
                          className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                            med.duration === d ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <Label>ملاحظات الطبيب</Label>
              <Textarea placeholder="ملاحظات إضافية..." className="mt-1.5" rows={2} />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>إلغاء</Button>
              <Button onClick={() => setShowCreate(false)}>إصدار الوصفة</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
