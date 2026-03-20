import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users, CalendarDays, Plus, UserPlus, Upload, FileText,
  Loader2, Clock, Search, DollarSign, Receipt, Edit2,
  Filter, Printer, CreditCard
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  usePatients, useAppointments, useAllVisits, createVisit,
  useServices, useExpenses, createExpense, useAllPayments,
  createPayment, updateAppointment
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
import { useToast } from "@/hooks/use-toast";

const anim = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25 } };

export default function ReceptionDashboard() {
  const today = new Date().toISOString().split("T")[0];
  const { data: patients, loading: pLoading } = usePatients();
  const { data: todayApts, loading: aLoading, refetch: refetchApts } = useAppointments(today);
  const { data: visits } = useAllVisits();
  const { data: services } = useServices();
  const { data: expenses, refetch: refetchExpenses } = useExpenses();
  const { data: payments } = useAllPayments();
  const { user } = useAuth();
  const { clinic } = useClinic();
  const { toast } = useToast();

  const [showNewVisit, setShowNewVisit] = useState(false);
  const [showCashDialog, setShowCashDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showInstallment, setShowInstallment] = useState(false);
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  const [visitForm, setVisitForm] = useState({ patientId: "", visitType: "diagnostic", paymentType: "paid" });
  const [cashForm, setCashForm] = useState({ patientId: "", visitId: "", amount: "", method: "cash", notes: "" });
  const [expenseForm, setExpenseForm] = useState({ category: "", amount: "", notes: "" });
  const [rescheduleForm, setRescheduleForm] = useState({ aptId: "", newDate: "", newTime: "" });
  const [installForm, setInstallForm] = useState({ patientId: "", totalAmount: "", downPayment: "0", numInstallments: "3", notes: "" });

  const todayVisits = visits.filter(v => v.date === today);
  const pendingVisits = todayVisits.filter(v => v.status === "pending");
  const todayRevenue = payments.filter(p => p.created_at?.startsWith(today)).reduce((s, p) => s + Number(p.amount), 0);
  const todayExpenses = expenses.filter(e => e.date === today).reduce((s, e) => s + Number(e.amount), 0);

  // Get unique doctors from today's appointments
  const doctors = useMemo(() => {
    const d = new Set(todayApts.map(a => a.doctor).filter(Boolean));
    return Array.from(d) as string[];
  }, [todayApts]);

  const filteredApts = doctorFilter === "all" ? todayApts : todayApts.filter(a => a.doctor === doctorFilter);

  const handleCreateVisit = async () => {
    if (!visitForm.patientId) { toast({ title: "خطأ", description: "اختر مريض أولاً", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      await createVisit({
        patient_id: visitForm.patientId, appointment_id: null,
        date: today, time: new Date().toTimeString().split(" ")[0],
        visit_type: visitForm.visitType, payment_type: visitForm.paymentType,
        status: "pending", doctor_notes: null, diagnosis: null, created_by: user?.id || null,
      }, clinic?.id);
      toast({ title: "تم", description: "تم إنشاء الزيارة بنجاح" });
      setShowNewVisit(false);
      setVisitForm({ patientId: "", visitType: "diagnostic", paymentType: "paid" });
    } catch (err: any) { toast({ title: "خطأ", description: err.message, variant: "destructive" }); }
    setSubmitting(false);
  };

  const handleCashPayment = async () => {
    if (!cashForm.patientId || !cashForm.amount) { toast({ title: "خطأ", description: "أدخل المريض والمبلغ", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      // Find or create a visit
      let visitId = cashForm.visitId;
      if (!visitId) {
        const v = await createVisit({
          patient_id: cashForm.patientId, appointment_id: null,
          date: today, time: new Date().toTimeString().split(" ")[0],
          visit_type: "consultation", payment_type: "paid",
          status: "completed", doctor_notes: null, diagnosis: null, created_by: user?.id || null,
        }, clinic?.id);
        visitId = v.id;
      }
      await createPayment({
        visit_id: visitId, patient_id: cashForm.patientId,
        amount: parseFloat(cashForm.amount), total_amount: parseFloat(cashForm.amount),
        remaining_amount: 0, payment_method: cashForm.method,
        notes: cashForm.notes || null, created_by: user?.id || null,
      }, clinic?.id);
      toast({ title: "تم", description: "تم تسجيل المبلغ" });
      setShowCashDialog(false);
      setCashForm({ patientId: "", visitId: "", amount: "", method: "cash", notes: "" });
    } catch (err: any) { toast({ title: "خطأ", description: err.message, variant: "destructive" }); }
    setSubmitting(false);
  };

  const handleAddExpense = async () => {
    if (!expenseForm.category || !expenseForm.amount) { toast({ title: "خطأ", description: "أدخل التصنيف والمبلغ", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      await createExpense({
        category: expenseForm.category, amount: parseFloat(expenseForm.amount),
        date: today, notes: expenseForm.notes || null, created_by: user?.id || null,
      }, clinic?.id);
      toast({ title: "تم", description: "تم تسجيل المصروف" });
      setShowExpenseDialog(false);
      setExpenseForm({ category: "", amount: "", notes: "" });
      refetchExpenses();
    } catch (err: any) { toast({ title: "خطأ", description: err.message, variant: "destructive" }); }
    setSubmitting(false);
  };

  const handleReschedule = async () => {
    if (!rescheduleForm.aptId || !rescheduleForm.newDate || !rescheduleForm.newTime) {
      toast({ title: "خطأ", description: "أدخل التاريخ والوقت الجديد", variant: "destructive" }); return;
    }
    setSubmitting(true);
    try {
      await updateAppointment(rescheduleForm.aptId, { date: rescheduleForm.newDate, time: rescheduleForm.newTime });
      toast({ title: "تم", description: "تم تغيير الموعد" });
      setShowReschedule(false);
      setRescheduleForm({ aptId: "", newDate: "", newTime: "" });
      refetchApts();
    } catch (err: any) { toast({ title: "خطأ", description: err.message, variant: "destructive" }); }
    setSubmitting(false);
  };

  const handleCreateInstallment = async () => {
    const total = parseFloat(installForm.totalAmount);
    const down = parseFloat(installForm.downPayment || "0");
    const num = parseInt(installForm.numInstallments);
    if (!installForm.patientId || !total || num < 1) {
      toast({ title: "خطأ", description: "أدخل البيانات المطلوبة", variant: "destructive" }); return;
    }
    setSubmitting(true);
    try {
      const remaining = total - down;
      const instAmount = Math.ceil(remaining / num);

      // Create payment plan
      const { data: plan, error: planErr } = await (supabase.from("payment_plans" as any) as any)
        .insert({
          patient_id: installForm.patientId,
          clinic_id: clinic?.id,
          total_amount: total,
          down_payment: down,
          num_installments: num,
          installment_amount: instAmount,
          status: "active",
          notes: installForm.notes || null,
          created_by: user?.id || null,
        }).select().single();
      if (planErr) throw planErr;

      // Create individual installments
      const installments = [];
      for (let i = 1; i <= num; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        installments.push({
          plan_id: plan.id,
          patient_id: installForm.patientId,
          clinic_id: clinic?.id,
          installment_number: i,
          amount: i === num ? remaining - (instAmount * (num - 1)) : instAmount,
          due_date: dueDate.toISOString().split("T")[0],
          status: "pending",
        });
      }
      const { error: instErr } = await (supabase.from("installment_payments" as any) as any).insert(installments);
      if (instErr) throw instErr;

      // If there's a down payment, record it
      if (down > 0) {
        const v = await createVisit({
          patient_id: installForm.patientId, appointment_id: null,
          date: today, time: new Date().toTimeString().split(" ")[0],
          visit_type: "consultation", payment_type: "installment",
          status: "completed", doctor_notes: null, diagnosis: null, created_by: user?.id || null,
        }, clinic?.id);
        await createPayment({
          visit_id: v.id, patient_id: installForm.patientId,
          amount: down, total_amount: total,
          remaining_amount: remaining, payment_method: "cash",
          notes: "مقدم تقسيط", created_by: user?.id || null,
        }, clinic?.id);
      }

      toast({ title: "تم", description: `تم إنشاء خطة تقسيط (${num} أقساط)` });
      setShowInstallment(false);
      setInstallForm({ patientId: "", totalAmount: "", downPayment: "0", numInstallments: "3", notes: "" });
    } catch (err: any) { toast({ title: "خطأ", description: err.message, variant: "destructive" }); }
    setSubmitting(false);
  };

  if (pLoading || aLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div {...anim} className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-foreground">لوحة الاستقبال</h1>
          <p className="text-xs text-muted-foreground mt-0.5">إدارة المرضى والزيارات</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/patients"><Button size="sm" variant="outline" className="gap-1.5"><UserPlus className="h-4 w-4" />مريض جديد</Button></Link>
          <Button size="sm" onClick={() => setShowNewVisit(true)} className="gap-1.5"><Plus className="h-4 w-4" />زيارة جديدة</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "مرضى اليوم", value: todayApts.length, icon: Users, color: "text-primary", bg: "bg-primary/10" },
          { label: "في الانتظار", value: pendingVisits.length, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
          { label: "إيرادات اليوم", value: `${todayRevenue.toLocaleString()} ج.م`, icon: DollarSign, color: "text-success", bg: "bg-success/10" },
          { label: "مصروفات اليوم", value: `${todayExpenses.toLocaleString()} ج.م`, icon: Receipt, color: "text-destructive", bg: "bg-destructive/10" },
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

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "إضافة مريض", icon: UserPlus, action: () => {}, path: "/patients", color: "text-primary", bg: "bg-primary/10" },
          { label: "حجز موعد", icon: CalendarDays, action: () => {}, path: "/appointments", color: "text-accent", bg: "bg-accent/10" },
          { label: "استلام نقدية", icon: DollarSign, action: () => setShowCashDialog(true), color: "text-success", bg: "bg-success/10" },
          { label: "إضافة مصروف", icon: Receipt, action: () => setShowExpenseDialog(true), color: "text-warning", bg: "bg-warning/10" },
          { label: "تقسيط مبلغ", icon: CreditCard, action: () => setShowInstallment(true), color: "text-accent", bg: "bg-accent/10" },
          { label: "التقارير", icon: Printer, action: () => {}, path: "/reports", color: "text-accent", bg: "bg-accent/10" },
        ].map((action, i) => {
          const content = (
            <div className="clinic-card p-3 flex items-center gap-3 hover:border-primary/30 transition-all cursor-pointer" onClick={action.action}>
              <div className={`w-9 h-9 rounded-xl ${action.bg} flex items-center justify-center shrink-0`}>
                <action.icon className={`h-4 w-4 ${action.color}`} />
              </div>
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </div>
          );
          return action.path ? <Link key={i} to={action.path}>{content}</Link> : <div key={i}>{content}</div>;
        })}
      </div>

      {/* Doctor Filter + Today's Appointments */}
      <div className="clinic-card">
        <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-foreground">مواعيد اليوم</h2>
          <div className="flex items-center gap-2">
            {doctors.length > 0 && (
              <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                <SelectTrigger className="h-8 text-xs w-auto min-w-[120px]">
                  <Filter className="h-3 w-3 ml-1" /><SelectValue placeholder="كل الأطباء" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأطباء</SelectItem>
                  {doctors.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <Link to="/appointments" className="text-xs text-primary hover:underline">عرض الكل</Link>
          </div>
        </div>
        {filteredApts.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">لا توجد مواعيد</div>
        ) : (
          <div className="divide-y divide-border">
            {filteredApts.slice(0, 12).map(apt => (
              <div key={apt.id} className="p-3 flex items-center gap-3 hover:bg-muted/20">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {apt.patient_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{apt.patient_name}</p>
                  <p className="text-[10px] text-muted-foreground font-en">{apt.time?.substring(0, 5)} · {apt.doctor || ''} · {apt.phone}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] px-2 py-1 rounded-lg font-medium ${
                    apt.status === 'completed' ? 'bg-success/10 text-success' :
                    apt.status === 'in-progress' ? 'bg-primary/10 text-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>{apt.status === 'completed' ? 'مكتمل' : apt.status === 'in-progress' ? 'جاري' : 'مجدول'}</span>
                  <Button size="icon" variant="ghost" className="h-7 w-7" title="تغيير الموعد"
                    onClick={() => { setRescheduleForm({ aptId: apt.id, newDate: apt.date, newTime: apt.time }); setShowReschedule(true); }}>
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Visit Dialog */}
      <Dialog open={showNewVisit} onOpenChange={setShowNewVisit}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>إنشاء زيارة جديدة</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>المريض *</Label>
              <Select value={visitForm.patientId} onValueChange={v => setVisitForm({...visitForm, patientId: v})}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="اختر مريض" /></SelectTrigger>
                <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} - {p.phone}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>نوع الزيارة</Label>
                <Select value={visitForm.visitType} onValueChange={v => setVisitForm({...visitForm, visitType: v})}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diagnostic">تشخيصي</SelectItem>
                    <SelectItem value="treatment">علاجي</SelectItem>
                    <SelectItem value="followup">متابعة</SelectItem>
                    <SelectItem value="lab">تحاليل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>نوع الدفع</Label>
                <Select value={visitForm.paymentType} onValueChange={v => setVisitForm({...visitForm, paymentType: v})}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">مدفوع</SelectItem>
                    <SelectItem value="unpaid">غير مدفوع</SelectItem>
                    <SelectItem value="insurance">تأمين</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNewVisit(false)}>إلغاء</Button>
              <Button onClick={handleCreateVisit} disabled={submitting}>{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "إنشاء الزيارة"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cash Payment Dialog */}
      <Dialog open={showCashDialog} onOpenChange={setShowCashDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>استلام نقدية</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>المريض *</Label>
              <Select value={cashForm.patientId} onValueChange={v => setCashForm({...cashForm, patientId: v})}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="اختر مريض" /></SelectTrigger>
                <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} - {p.phone}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>الخدمة</Label>
              <Select value={cashForm.amount} onValueChange={v => setCashForm({...cashForm, amount: v})}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="اختر الخدمة أو أدخل المبلغ" /></SelectTrigger>
                <SelectContent>
                  {services.map(s => <SelectItem key={s.id} value={String(s.price)}>{s.name} - {s.price} ج.م</SelectItem>)}
                </SelectContent>
              </Select>
              <Input value={cashForm.amount} onChange={e => setCashForm({...cashForm, amount: e.target.value})}
                placeholder="أو أدخل المبلغ يدوياً" className="mt-1.5 font-en" dir="ltr" type="number" />
            </div>
            <div>
              <Label>طريقة الدفع</Label>
              <Select value={cashForm.method} onValueChange={v => setCashForm({...cashForm, method: v})}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">نقدي</SelectItem>
                  <SelectItem value="card">بطاقة</SelectItem>
                  <SelectItem value="instapay">InstaPay</SelectItem>
                  <SelectItem value="wallet">محفظة إلكترونية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>ملاحظات</Label><Input value={cashForm.notes} onChange={e => setCashForm({...cashForm, notes: e.target.value})} className="mt-1.5" /></div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCashDialog(false)}>إلغاء</Button>
              <Button onClick={handleCashPayment} disabled={submitting}>{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "تسجيل المبلغ"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>إضافة مصروف</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>التصنيف *</Label>
              <Select value={expenseForm.category} onValueChange={v => setExpenseForm({...expenseForm, category: v})}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="اختر التصنيف" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplies">مستلزمات طبية</SelectItem>
                  <SelectItem value="rent">إيجار</SelectItem>
                  <SelectItem value="utilities">مرافق</SelectItem>
                  <SelectItem value="salaries">رواتب</SelectItem>
                  <SelectItem value="maintenance">صيانة</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>المبلغ *</Label><Input value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} className="mt-1.5 font-en" dir="ltr" type="number" /></div>
            <div><Label>ملاحظات</Label><Input value={expenseForm.notes} onChange={e => setExpenseForm({...expenseForm, notes: e.target.value})} className="mt-1.5" /></div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowExpenseDialog(false)}>إلغاء</Button>
              <Button onClick={handleAddExpense} disabled={submitting}>{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "تسجيل المصروف"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={showReschedule} onOpenChange={setShowReschedule}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>تغيير الموعد</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label>التاريخ الجديد</Label><Input type="date" value={rescheduleForm.newDate} onChange={e => setRescheduleForm({...rescheduleForm, newDate: e.target.value})} className="mt-1.5 font-en" dir="ltr" /></div>
            <div><Label>الوقت الجديد</Label><Input type="time" value={rescheduleForm.newTime} onChange={e => setRescheduleForm({...rescheduleForm, newTime: e.target.value})} className="mt-1.5 font-en" dir="ltr" /></div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowReschedule(false)}>إلغاء</Button>
              <Button onClick={handleReschedule} disabled={submitting}>{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "تأكيد"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
