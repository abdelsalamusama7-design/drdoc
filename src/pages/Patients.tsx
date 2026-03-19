import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Phone, AlertTriangle, X, Filter, Users, Loader2 } from "lucide-react";
import { usePatients, createPatient, type Patient } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "tween" as const, ease: [0.2, 0, 0, 1] as const, duration: 0.25 },
};

export default function Patients() {
  const { data: patients, loading, refetch } = usePatients();
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'last_visit' | 'age'>('name');
  const [submitting, setSubmitting] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Form state
  const [form, setForm] = useState({
    name: "", phone: "", age: "", address: "", gender: "male",
    maritalStatus: "single", allergies: "",
    medicalHistory: "", previousSurgeries: "", currentMedications: "",
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = patients;
    if (q) {
      result = patients.filter(
        (p) => p.name.toLowerCase().includes(q) || p.phone.includes(q) || (p.address || '').includes(q)
      );
    }
    return [...result].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'ar');
      if (sortBy === 'last_visit') return (b.last_visit || '').localeCompare(a.last_visit || '');
      return (b.age || 0) - (a.age || 0);
    });
  }, [patients, search, sortBy]);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast({ title: "خطأ", description: "يرجى ملء الاسم ورقم الهاتف", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await createPatient({
        name: form.name.trim(),
        phone: form.phone.trim(),
        age: form.age ? parseInt(form.age) : null,
        gender: form.gender,
        address: form.address.trim() || null,
        marital_status: form.maritalStatus,
        medical_history: form.medicalHistory.trim() || null,
        previous_surgeries: form.previousSurgeries.trim() || null,
        allergies: form.allergies ? form.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
        current_medications: form.currentMedications ? form.currentMedications.split(',').map(s => s.trim()).filter(Boolean) : [],
        created_by: user?.id || null,
        segment: 'new',
        visit_count: 0,
      });
      toast({ title: "تم", description: "تم تسجيل المريض بنجاح" });
      setShowAddModal(false);
      setForm({ name: "", phone: "", age: "", address: "", maritalStatus: "single", allergies: "", medicalHistory: "", previousSurgeries: "", currentMedications: "" });
      refetch();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  return (
    <motion.div {...pageTransition} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">المرضى</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{patients.length} مريض مسجل</p>
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">إضافة مريض</span>
          <span className="sm:hidden">إضافة</span>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            placeholder="بحث بالاسم أو رقم الهاتف أو العنوان..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9 pl-16 h-11"
          />
          {search ? (
            <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          ) : (
            <kbd className="absolute left-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-en">⌘K</kbd>
          )}
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[120px] h-11">
            <Filter className="h-3.5 w-3.5 ml-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">الاسم</SelectItem>
            <SelectItem value="last_visit">آخر زيارة</SelectItem>
            <SelectItem value="age">العمر</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {search && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} نتيجة للبحث عن "<span className="text-foreground font-medium">{search}</span>"
        </p>
      )}

      <div className="clinic-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{search ? "لا يوجد مرضى مطابقون للبحث" : "لا يوجد مرضى. أضف أول مريض"}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            <AnimatePresence mode="popLayout">
              {filtered.map((patient) => (
                <motion.div key={patient.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Link to={`/patients/${patient.id}`} className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors group">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {patient.name.charAt(0)}{patient.name.split(' ')[1]?.charAt(0) || ''}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{patient.name}</p>
                        {patient.allergies.length > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full shrink-0">
                            <AlertTriangle className="h-2.5 w-2.5" />حساسية
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /><span className="font-en">{patient.phone}</span>
                        </span>
                        {patient.age && <span className="text-[11px] text-muted-foreground">{patient.age} سنة</span>}
                        {patient.address && <span className="text-[11px] text-muted-foreground hidden sm:inline">{patient.address}</span>}
                      </div>
                    </div>
                    <div className="text-left shrink-0 flex flex-col items-end gap-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        patient.marital_status === 'married' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        {patient.marital_status === 'married' ? 'متزوج' : patient.marital_status === 'single' ? 'أعزب' : patient.marital_status === 'divorced' ? 'مطلق' : 'أرمل'}
                      </span>
                      {patient.last_visit && (
                        <span className="text-[10px] text-muted-foreground font-en">
                          آخر زيارة: {new Date(patient.last_visit).toLocaleDateString('ar-SA')}
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>إضافة مريض جديد</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>الاسم الكامل *</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="أدخل اسم المريض" className="mt-1.5" />
              </div>
              <div>
                <Label>رقم الهاتف *</Label>
                <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="05xxxxxxxx" className="mt-1.5 font-en" dir="ltr" />
              </div>
              <div>
                <Label>العمر</Label>
                <Input type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} placeholder="العمر" className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label>العنوان</Label>
                <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="المدينة، الحي" className="mt-1.5" />
              </div>
              <div>
                <Label>الحالة الاجتماعية</Label>
                <Select value={form.maritalStatus} onValueChange={v => setForm({...form, maritalStatus: v})}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">أعزب</SelectItem>
                    <SelectItem value="married">متزوج</SelectItem>
                    <SelectItem value="divorced">مطلق</SelectItem>
                    <SelectItem value="widowed">أرمل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>الحساسية (مفصولة بفاصلة)</Label>
                <Input value={form.allergies} onChange={e => setForm({...form, allergies: e.target.value})} placeholder="بنسلين، سلفا" className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label>التاريخ المرضي</Label>
                <Textarea value={form.medicalHistory} onChange={e => setForm({...form, medicalHistory: e.target.value})} placeholder="أمراض مزمنة، حالات سابقة..." className="mt-1.5" rows={2} />
              </div>
              <div className="sm:col-span-2">
                <Label>العمليات السابقة</Label>
                <Textarea value={form.previousSurgeries} onChange={e => setForm({...form, previousSurgeries: e.target.value})} placeholder="العمليات الجراحية السابقة..." className="mt-1.5" rows={2} />
              </div>
              <div className="sm:col-span-2">
                <Label>الأدوية الحالية (مفصولة بفاصلة)</Label>
                <Input value={form.currentMedications} onChange={e => setForm({...form, currentMedications: e.target.value})} placeholder="أملوديبين 5mg، ميتفورمين" className="mt-1.5" />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>إلغاء</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "تسجيل المريض"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
