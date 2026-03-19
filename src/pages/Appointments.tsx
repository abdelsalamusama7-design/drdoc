import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, ChevronRight, ChevronLeft, CalendarDays, Loader2 } from "lucide-react";
import { useAppointments, useAllAppointments, createAppointment, updateAppointment, usePatients } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "tween" as const, ease: [0.2, 0, 0, 1] as const, duration: 0.25 },
};

const visitTypeLabels: Record<string, string> = { consultation: 'استشارة', followup: 'متابعة', procedure: 'إجراء', lab: 'مختبر' };
const statusLabels: Record<string, string> = { scheduled: 'مجدول', completed: 'مكتمل', cancelled: 'ملغي', 'in-progress': 'جاري' };
const dayNames = ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];

function getWeekDays(dateStr: string) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = day >= 6 ? day - 6 : day + 1;
  const saturday = new Date(date);
  saturday.setDate(date.getDate() - diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(saturday);
    d.setDate(saturday.getDate() + i);
    return d;
  });
}

export default function Appointments() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [view, setView] = useState<'day' | 'week'>('day');
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: dayAppointments, loading, refetch } = useAppointments(selectedDate);
  const { data: allAppointments } = useAllAppointments();
  const { data: patients } = usePatients();

  // Form state
  const [form, setForm] = useState({
    patientName: '', phone: '', doctor: 'د. سلطان الأحمدي',
    date: today, time: '', visitType: 'consultation', notes: '', patientId: '',
  });

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  const filteredAppointments = statusFilter === 'all'
    ? dayAppointments
    : dayAppointments.filter(a => a.status === statusFilter);

  const navigateDay = (dir: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + (view === 'week' ? dir * 7 : dir));
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  const isToday = (date: Date) => date.toISOString().split('T')[0] === today;

  const statusCounts = {
    all: dayAppointments.length,
    scheduled: dayAppointments.filter(a => a.status === 'scheduled').length,
    'in-progress': dayAppointments.filter(a => a.status === 'in-progress').length,
    completed: dayAppointments.filter(a => a.status === 'completed').length,
  };

  const handleSubmit = async () => {
    if (!form.patientName.trim() || !form.time) {
      toast({ title: "خطأ", description: "يرجى ملء الاسم والوقت", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await createAppointment({
        patient_id: form.patientId || null,
        patient_name: form.patientName.trim(),
        phone: form.phone.trim() || null,
        doctor: form.doctor,
        visit_type: form.visitType,
        notes: form.notes.trim() || null,
        date: form.date,
        time: form.time,
        status: 'scheduled',
        created_by: user?.id || null,
      });
      toast({ title: "تم", description: "تم حجز الموعد بنجاح" });
      setShowAddModal(false);
      setForm({ patientName: '', phone: '', doctor: 'د. سلطان الأحمدي', date: today, time: '', visitType: 'consultation', notes: '', patientId: '' });
      refetch();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleStatusChange = async (aptId: string, newStatus: string) => {
    try {
      await updateAppointment(aptId, { status: newStatus });
      refetch();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  return (
    <motion.div {...pageTransition} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">المواعيد</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{dayAppointments.length} مواعيد</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-muted rounded-lg p-0.5">
            <button onClick={() => setView('day')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === 'day' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>يوم</button>
            <button onClick={() => setView('week')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === 'week' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>أسبوع</button>
          </div>
          <Button size="sm" onClick={() => { setForm({...form, date: selectedDate}); setShowAddModal(true); }} className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">موعد جديد</span>
            <span className="sm:hidden">إضافة</span>
          </Button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="clinic-card p-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigateDay(1)} className="p-2 hover:bg-muted rounded-lg transition-colors"><ChevronRight className="h-4 w-4" /></button>
          <p className="text-sm font-semibold text-foreground">{formatDate(selectedDate)}</p>
          <button onClick={() => navigateDay(-1)} className="p-2 hover:bg-muted rounded-lg transition-colors"><ChevronLeft className="h-4 w-4" /></button>
        </div>
        <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1">
          {weekDays.map((date, i) => {
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = dateStr === selectedDate;
            const isTodayDate = isToday(date);
            const hasApts = allAppointments.some(a => a.date === dateStr);
            return (
              <button key={i} onClick={() => { setSelectedDate(dateStr); setView('day'); }}
                className={`flex-1 min-w-[48px] flex flex-col items-center gap-0.5 py-2 rounded-xl text-center transition-all ${
                  isSelected ? 'bg-primary text-primary-foreground shadow-sm' : isTodayDate ? 'bg-primary/5 text-primary' : 'hover:bg-muted text-muted-foreground'
                }`}>
                <span className="text-[10px] font-medium">{dayNames[i]}</span>
                <span className="text-sm font-bold font-en">{date.getDate()}</span>
                {hasApts && !isSelected && <div className="w-1 h-1 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'الكل', count: statusCounts.all },
          { key: 'scheduled', label: 'مجدول', count: statusCounts.scheduled },
          { key: 'in-progress', label: 'جاري', count: statusCounts['in-progress'] },
          { key: 'completed', label: 'مكتمل', count: statusCounts.completed },
        ].map((filter) => (
          <button key={filter.key} onClick={() => setStatusFilter(filter.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === filter.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}>
            {filter.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusFilter === filter.key ? 'bg-primary-foreground/20' : 'bg-background'}`}>{filter.count}</span>
          </button>
        ))}
      </div>

      {/* Day View */}
      <div className="clinic-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDays className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">لا توجد مواعيد</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredAppointments.map((apt, index) => (
              <motion.div key={apt.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}
                className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors group">
                <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-center shrink-0 ${
                  apt.status === 'in-progress' ? 'bg-primary/10 ring-2 ring-primary/20' : apt.status === 'completed' ? 'bg-success/10' : 'bg-muted'
                }`}>
                  <span className="text-lg font-bold font-en tabular-nums text-foreground">{apt.time.split(':')[0]}</span>
                  <span className="text-[10px] font-en text-muted-foreground">:{apt.time.split(':')[1]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">{apt.patient_name}</p>
                    {apt.status === 'in-progress' && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      apt.visit_type === 'consultation' ? 'bg-primary/10 text-primary' :
                      apt.visit_type === 'followup' ? 'bg-accent/10 text-accent' :
                      apt.visit_type === 'procedure' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    }`}>{visitTypeLabels[apt.visit_type] || apt.visit_type}</span>
                    {apt.doctor && <span className="text-[11px] text-muted-foreground">{apt.doctor}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Select value={apt.status} onValueChange={(v) => handleStatusChange(apt.id, v)}>
                    <SelectTrigger className={`h-7 text-[10px] px-2 border-0 ${
                      apt.status === 'in-progress' ? 'bg-primary/10 text-primary' :
                      apt.status === 'completed' ? 'bg-success/10 text-success' :
                      apt.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                    }`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">مجدول</SelectItem>
                      <SelectItem value="in-progress">جاري</SelectItem>
                      <SelectItem value="completed">مكتمل</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                  {apt.phone && <span className="text-[10px] text-muted-foreground font-en opacity-0 group-hover:opacity-100 transition-opacity">{apt.phone}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Appointment Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>حجز موعد جديد</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>اسم المريض *</Label>
                <Select value={form.patientId} onValueChange={v => {
                  const p = patients.find(p => p.id === v);
                  if (p) setForm({...form, patientId: v, patientName: p.name, phone: p.phone});
                }}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="اختر مريض مسجل" /></SelectTrigger>
                  <SelectContent>
                    {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input value={form.patientName} onChange={e => setForm({...form, patientName: e.target.value})} placeholder="أو أدخل اسم جديد" className="mt-1.5" />
              </div>
              <div>
                <Label>رقم الهاتف</Label>
                <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="05xxxxxxxx" className="mt-1.5 font-en" dir="ltr" />
              </div>
              <div>
                <Label>الطبيب</Label>
                <Input value={form.doctor} onChange={e => setForm({...form, doctor: e.target.value})} className="mt-1.5" />
              </div>
              <div>
                <Label>التاريخ</Label>
                <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="mt-1.5 font-en" dir="ltr" />
              </div>
              <div>
                <Label>الوقت *</Label>
                <Input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="mt-1.5 font-en" dir="ltr" />
              </div>
              <div className="sm:col-span-2">
                <Label>نوع الزيارة</Label>
                <Select value={form.visitType} onValueChange={v => setForm({...form, visitType: v})}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">استشارة</SelectItem>
                    <SelectItem value="followup">متابعة</SelectItem>
                    <SelectItem value="procedure">إجراء</SelectItem>
                    <SelectItem value="lab">مختبر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>ملاحظات</Label>
                <Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="ملاحظات إضافية..." className="mt-1.5" rows={2} />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>إلغاء</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "حجز الموعد"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
