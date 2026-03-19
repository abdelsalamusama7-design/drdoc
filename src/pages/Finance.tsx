import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, DollarSign, TrendingUp, TrendingDown, Receipt, Loader2 } from "lucide-react";
import { useExpenses, createExpense, useAllAppointments, useServices } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "tween" as const, ease: [0.2, 0, 0, 1] as const, duration: 0.25 },
};

export default function Finance() {
  const { data: expenses, loading: expLoading, refetch } = useExpenses();
  const { data: appointments } = useAllAppointments();
  const { data: services } = useServices();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });

  // Calculate revenue based on completed appointments × average service price
  const avgServicePrice = useMemo(() => {
    if (services.length === 0) return 300;
    return services.reduce((s, sv) => s + sv.price, 0) / services.length;
  }, [services]);

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.substring(0, 7);

  const todayCompleted = appointments.filter(a => a.date === today && a.status === 'completed').length;
  const monthCompleted = appointments.filter(a => a.date.startsWith(currentMonth) && a.status === 'completed').length;

  const dailyRevenue = Math.round(todayCompleted * avgServicePrice);
  const monthlyRevenue = Math.round(monthCompleted * avgServicePrice);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = monthlyRevenue - totalExpenses;

  const handleSubmit = async () => {
    if (!form.category || !form.amount) {
      toast({ title: "خطأ", description: "يرجى ملء التصنيف والمبلغ", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await createExpense({
        category: form.category,
        amount: parseFloat(form.amount),
        date: form.date,
        notes: form.notes.trim() || null,
        created_by: user?.id || null,
      });
      toast({ title: "تم", description: "تم تسجيل المصروف" });
      setShowAddExpense(false);
      setForm({ category: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
      refetch();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  if (expLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div {...pageTransition} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">المالية</h1>
        <Button size="sm" onClick={() => setShowAddExpense(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />إضافة مصروف
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "إيراد اليوم", value: dailyRevenue, icon: DollarSign, color: "text-success", bg: "bg-success/10" },
          { label: "إيراد الشهر", value: monthlyRevenue, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
          { label: "المصروفات", value: totalExpenses, icon: TrendingDown, color: "text-warning", bg: "bg-warning/10" },
          { label: "صافي الربح", value: profit, icon: Receipt, color: profit >= 0 ? "text-success" : "text-destructive", bg: profit >= 0 ? "bg-success/10" : "bg-destructive/10" },
        ].map((stat, i) => (
          <div key={i} className="clinic-card p-4">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`h-[18px] w-[18px] ${stat.color}`} />
            </div>
            <div className="stat-value text-foreground font-en tabular-nums">
              {stat.value.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground mr-1">ج.م</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="clinic-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">المصروفات</h2>
        </div>
        {expenses.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">لا يوجد مصروفات مسجلة</div>
        ) : (
          <div className="divide-y divide-border">
            {expenses.map((exp) => (
              <div key={exp.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{exp.category}</p>
                  {exp.notes && <p className="text-xs text-muted-foreground">{exp.notes}</p>}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground font-en tabular-nums">
                    {exp.amount.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">ج.م</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground font-en">{exp.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>إضافة مصروف</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>التصنيف *</Label>
              <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
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
            <div>
              <Label>المبلغ (ج.م) *</Label>
              <Input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0" className="mt-1.5 font-en" dir="ltr" />
            </div>
            <div>
              <Label>التاريخ</Label>
              <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="mt-1.5 font-en" dir="ltr" />
            </div>
            <div>
              <Label>ملاحظات</Label>
              <Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="تفاصيل المصروف..." className="mt-1.5" rows={2} />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowAddExpense(false)}>إلغاء</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "تسجيل المصروف"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
