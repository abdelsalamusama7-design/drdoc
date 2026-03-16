import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Phone, AlertTriangle, Command, X, Filter, Users } from "lucide-react";
import { mockPatients, type Patient } from "@/data/mockData";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "tween" as const, ease: [0.2, 0, 0, 1] as const, duration: 0.25 },
};

export default function Patients() {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [patients] = useState<Patient[]>(mockPatients);
  const [sortBy, setSortBy] = useState<'name' | 'lastVisit' | 'age'>('name');
  const searchRef = useRef<HTMLInputElement>(null);

  // Cmd+K / Ctrl+K shortcut
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
        (p) => p.name.toLowerCase().includes(q) || p.phone.includes(q) || p.address.includes(q)
      );
    }
    return [...result].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'ar');
      if (sortBy === 'lastVisit') return b.lastVisit.localeCompare(a.lastVisit);
      return b.age - a.age;
    });
  }, [patients, search, sortBy]);

  return (
    <motion.div {...pageTransition} className="space-y-4">
      {/* Header */}
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

      {/* Search Bar */}
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
            <button
              onClick={() => setSearch("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          ) : (
            <kbd className="absolute left-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-en">
              ⌘K
            </kbd>
          )}
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[120px] h-11">
            <Filter className="h-3.5 w-3.5 ml-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">الاسم</SelectItem>
            <SelectItem value="lastVisit">آخر زيارة</SelectItem>
            <SelectItem value="age">العمر</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {search && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} نتيجة للبحث عن "<span className="text-foreground font-medium">{search}</span>"
        </p>
      )}

      {/* Patient List */}
      <div className="clinic-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">لا يوجد مرضى مطابقون للبحث</p>
            <p className="text-xs text-muted-foreground/70 mt-1">حاول تعديل كلمات البحث</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            <AnimatePresence mode="popLayout">
              {filtered.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Link
                    to={`/patients/${patient.id}`}
                    className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors group"
                  >
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {patient.name.charAt(0)}{patient.name.split(' ')[1]?.charAt(0) || ''}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{patient.name}</p>
                        {patient.allergies.length > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full shrink-0">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            حساسية
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span className="font-en">{patient.phone}</span>
                        </span>
                        <span className="text-[11px] text-muted-foreground">{patient.age} سنة</span>
                        <span className="text-[11px] text-muted-foreground hidden sm:inline">{patient.address}</span>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="text-left shrink-0 flex flex-col items-end gap-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        patient.maritalStatus === 'married' ? 'bg-success/10 text-success' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {patient.maritalStatus === 'married' ? 'متزوج' :
                         patient.maritalStatus === 'single' ? 'أعزب' :
                         patient.maritalStatus === 'divorced' ? 'مطلق' : 'أرمل'}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-en">
                        آخر زيارة: {patient.lastVisit}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة مريض جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>الاسم الكامل</Label>
                <Input placeholder="أدخل اسم المريض" className="mt-1.5" />
              </div>
              <div>
                <Label>رقم الهاتف</Label>
                <Input placeholder="05xxxxxxxx" className="mt-1.5 font-en" dir="ltr" />
              </div>
              <div>
                <Label>العمر</Label>
                <Input type="number" placeholder="العمر" className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label>العنوان</Label>
                <Input placeholder="المدينة، الحي" className="mt-1.5" />
              </div>
              <div>
                <Label>الحالة الاجتماعية</Label>
                <Select>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="اختر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">أعزب</SelectItem>
                    <SelectItem value="married">متزوج</SelectItem>
                    <SelectItem value="divorced">مطلق</SelectItem>
                    <SelectItem value="widowed">أرمل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>الحساسية</Label>
                <Input placeholder="أدوية أو مواد" className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label>التاريخ المرضي</Label>
                <Textarea placeholder="أمراض مزمنة، حالات سابقة..." className="mt-1.5" rows={2} />
              </div>
              <div className="sm:col-span-2">
                <Label>العمليات السابقة</Label>
                <Textarea placeholder="العمليات الجراحية السابقة..." className="mt-1.5" rows={2} />
              </div>
              <div className="sm:col-span-2">
                <Label>الأدوية الحالية</Label>
                <Input placeholder="الأدوية التي يتناولها المريض حالياً" className="mt-1.5" />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>إلغاء</Button>
              <Button onClick={() => setShowAddModal(false)}>تسجيل المريض</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
