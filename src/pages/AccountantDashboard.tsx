import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, TrendingDown, Receipt, Plus, Loader2,
  CreditCard, Wallet, Users
} from "lucide-react";
import { useAllPayments, useAllVisits, useExpenses, usePatients, createPayment, createExpense } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const anim = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25 } };

export default function AccountantDashboard() {
  const { data: payments, loading: payLoading, refetch: refetchPayments } = useAllPayments();
  const { data: visits } = useAllVisits();
  const { data: expenses, refetch: refetchExpenses } = useExpenses();
  const { data: patients } = usePatients();
  const { user } = useAuth();
  const { toast } = useToast();

  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [payForm, setPayForm] = useState({ visitId: "", patientId: "", amount: "", method: "cash", notes: "" });
  const [expForm, setExpForm] = useState({ category: "", amount: "", date: new Date().toISOString().split("T")[0], notes: "" });

  const today = new Date().toISOString().split("T")[0];
  const currentMonth = today.substring(0, 7);

  const stats = useMemo(() => {
    const todayPayments = payments.filter(p => p.created_at?.startsWith(today));
    const monthPayments = payments.filter(p => p.created_at?.startsWith(currentMonth));
    const monthExpenses = expenses.filter(e => e.date?.startsWith(currentMonth));
    const totalRevenue = monthPayments.reduce((s, p) => s + p.amount, 0);
    const totalExpense = monthExpenses.reduce((s, e) => s + e.amount, 0);

    return {
      todayRevenue: todayPayments.reduce((s, p) => s + p.amount, 0),
      monthRevenue: totalRevenue,
      monthExpenses: totalExpense,
      netProfit: totalRevenue - totalExpense,
    };
  }, [payments, expenses, today, currentMonth]);

  // Get visits that need payment
  const unpaidVisits = visits.filter(v => v.payment_type !== "unpaid" && v.status !== "cancelled");

  const handleAddPayment = async () => {
    if (!payForm.visitId || !payForm.amount) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const visit = visits.find(v => v.id === payForm.visitId);
      await createPayment({
        visit_id: payForm.visitId,
        patient_id: visit?.patient_id || payForm.patientId,
        amount: parseFloat(payForm.amount),
        total_amount: parseFloat(payForm.amount),
        remaining_amount: 0,
        payment_method: payForm.method,
        notes: payForm.notes || null,
        created_by: user?.id || null,
      });
      toast({ title: "تم", description: "تم تسجيل الدفعة" });
      setShowAddPayment(false);
      setPayForm({ visitId: "", patientId: "", amount: "", method: "cash", notes: "" });
      refetchPayments();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleAddExpense = async () => {
    if (!expForm.category || !expForm.amount) {
      toast({ title: "خطأ", description: "يرجى ملء التصنيف والمبلغ", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await createExpense({
        category: expForm.category,
        amount: parseFloat(expForm.amount),
        date: expForm.date,
        notes: expForm.notes || null,
        created_by: user?.id || null,
      });
      toast({ title: "تم", description: "تم تسجيل المصروف" });
      setShowAddExpense(false);
      setExpForm({ category: "", amount: "", date: new Date().toISOString().split("T")[0], notes: "" });
      refetchExpenses();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  if (payLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div {...anim} className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">لوحة المحاسبة</h1>
          <p className="text-xs text-muted-foreground mt-0.5">إدارة المدفوعات والمصروفات</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowAddExpense(true)} className="gap-1.5">
            <TrendingDown className="h-4 w-4" />مصروف
          </Button>
          <Button size="sm" onClick={() => setShowAddPayment(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />تسجيل دفعة
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "إيراد اليوم", value: stats.todayRevenue, icon: DollarSign, color: "text-success", bg: "bg-success/10" },
          { label: "إيراد الشهر", value: stats.monthRevenue, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
          { label: "مصروفات الشهر", value: stats.monthExpenses, icon: TrendingDown, color: "text-warning", bg: "bg-warning/10" },
          { label: "صافي الربح", value: stats.netProfit, icon: Receipt, color: stats.netProfit >= 0 ? "text-success" : "text-destructive", bg: stats.netProfit >= 0 ? "bg-success/10" : "bg-destructive/10" },
        ].map((stat, i) => (
          <div key={i} className="clinic-card p-4">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`h-[18px] w-[18px] ${stat.color}`} />
            </div>
            <p className="stat-value text-foreground font-en tabular-nums">
              {stat.value.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">ج.م</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Payments */}
      <div className="clinic-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">آخر المدفوعات</h2>
        </div>
        {payments.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">لا يوجد مدفوعات مسجلة</div>
        ) : (
          <div className="divide-y divide-border">
            {payments.slice(0, 10).map(pay => {
              const patient = patients.find(p => p.id === pay.patient_id);
              return (
                <div key={pay.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
                      {pay.payment_method === "cash" ? <Wallet className="h-4 w-4 text-success" /> : <CreditCard className="h-4 w-4 text-success" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{patient?.name || "مريض"}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {pay.payment_method === "cash" ? "نقدي" : pay.payment_method === "card" ? "بطاقة" : pay.payment_method}
                        {pay.notes && ` · ${pay.notes}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-success font-en tabular-nums">+{pay.amount.toLocaleString()} ج.م</p>
                    <p className="text-[10px] text-muted-foreground font-en">{new Date(pay.created_at).toLocaleDateString("ar-SA")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Expenses */}
      <div className="clinic-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">آخر المصروفات</h2>
        </div>
        {expenses.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">لا يوجد مصروفات</div>
        ) : (
          <div className="divide-y divide-border">
            {expenses.slice(0, 8).map(exp => (
              <div key={exp.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{exp.category}</p>
                  {exp.notes && <p className="text-[10px] text-muted-foreground">{exp.notes}</p>}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-destructive font-en tabular-nums">-{exp.amount.toLocaleString()} ج.م</p>
                  <p className="text-[10px] text-muted-foreground font-en">{exp.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Payment Dialog */}
      <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>تسجيل دفعة</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>الزيارة *</Label>
              <Select value={payForm.visitId} onValueChange={v => {
                const visit = visits.find(vs => vs.id === v);
                setPayForm({...payForm, visitId: v, patientId: visit?.patient_id || ""});
              }}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="اختر زيارة" /></SelectTrigger>
                <SelectContent>
                  {unpaidVisits.slice(0, 20).map(v => {
                    const p = patients.find(pt => pt.id === v.patient_id);
                    return <SelectItem key={v.id} value={v.id}>{p?.name || "—"} - {v.date}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>المبلغ (ج.م) *</Label>
                <Input type="number" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} placeholder="0" className="mt-1.5 font-en" dir="ltr" />
              </div>
              <div>
                <Label>طريقة الدفع</Label>
                <Select value={payForm.method} onValueChange={v => setPayForm({...payForm, method: v})}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="card">بطاقة</SelectItem>
                    <SelectItem value="transfer">تحويل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>ملاحظات</Label>
              <Textarea value={payForm.notes} onChange={e => setPayForm({...payForm, notes: e.target.value})} placeholder="ملاحظات..." className="mt-1.5" rows={2} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddPayment(false)}>إلغاء</Button>
              <Button onClick={handleAddPayment} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "تسجيل الدفعة"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>إضافة مصروف</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>التصنيف *</Label>
              <Select value={expForm.category} onValueChange={v => setExpForm({...expForm, category: v})}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="اختر التصنيف" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="إيجار">إيجار</SelectItem>
                  <SelectItem value="رواتب">رواتب</SelectItem>
                  <SelectItem value="معدات">معدات</SelectItem>
                  <SelectItem value="خدمات">خدمات</SelectItem>
                  <SelectItem value="أخرى">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>المبلغ *</Label>
                <Input type="number" value={expForm.amount} onChange={e => setExpForm({...expForm, amount: e.target.value})} className="mt-1.5 font-en" dir="ltr" />
              </div>
              <div>
                <Label>التاريخ</Label>
                <Input type="date" value={expForm.date} onChange={e => setExpForm({...expForm, date: e.target.value})} className="mt-1.5 font-en" dir="ltr" />
              </div>
            </div>
            <div>
              <Label>ملاحظات</Label>
              <Textarea value={expForm.notes} onChange={e => setExpForm({...expForm, notes: e.target.value})} className="mt-1.5" rows={2} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddExpense(false)}>إلغاء</Button>
              <Button onClick={handleAddExpense} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "تسجيل المصروف"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
