import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, DollarSign, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import { mockExpenses } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "tween" as const, ease: [0.2, 0, 0, 1] as const, duration: 0.25 },
};

const monthlyData = [
  { month: 'يناير', revenue: 45000, expenses: 35000 },
  { month: 'فبراير', revenue: 52000, expenses: 38000 },
  { month: 'مارس', revenue: 48000, expenses: 42000 },
];

const dailyRevenue = 3600;
const monthlyRevenue = 48000;
const totalExpenses = mockExpenses.reduce((sum, e) => sum + e.amount, 0);
const profit = monthlyRevenue - totalExpenses;

export default function Finance() {
  const [showAddExpense, setShowAddExpense] = useState(false);

  return (
    <motion.div {...pageTransition} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">المالية</h1>
        <Button size="sm" onClick={() => setShowAddExpense(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          إضافة مصروف
        </Button>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "إيراد اليوم", value: dailyRevenue, icon: DollarSign, color: "text-success", bg: "bg-success/10" },
          { label: "إيراد الشهر", value: monthlyRevenue, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
          { label: "المصروفات", value: totalExpenses, icon: TrendingDown, color: "text-warning", bg: "bg-warning/10" },
          { label: "صافي الربح", value: profit, icon: Receipt, color: "text-success", bg: "bg-success/10" },
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

      {/* Revenue Chart */}
      <div className="clinic-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-4">نظرة عامة على الإيرادات والمصروفات</h2>
        <div className="h-[240px]" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid hsl(214, 32%, 91%)', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="revenue" name="الإيرادات" stroke="hsl(217, 91%, 60%)" strokeWidth={2} fill="url(#revGrad)" />
              <Area type="monotone" dataKey="expenses" name="المصروفات" stroke="hsl(25, 95%, 53%)" strokeWidth={2} fill="url(#expGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expenses List */}
      <div className="clinic-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">المصروفات الأخيرة</h2>
        </div>
        <div className="divide-y divide-border">
          {mockExpenses.map((exp) => (
            <div key={exp.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{exp.category}</p>
                <p className="text-xs text-muted-foreground">{exp.notes}</p>
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
      </div>

      {/* Add Expense Modal */}
      <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة مصروف</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>التصنيف</Label>
              <Select>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="اختر التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">إيجار</SelectItem>
                  <SelectItem value="salaries">رواتب</SelectItem>
                  <SelectItem value="equipment">معدات</SelectItem>
                  <SelectItem value="utilities">خدمات</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>المبلغ (ر.س)</Label>
              <Input type="number" placeholder="0" className="mt-1.5 font-en" dir="ltr" />
            </div>
            <div>
              <Label>التاريخ</Label>
              <Input type="date" className="mt-1.5 font-en" dir="ltr" />
            </div>
            <div>
              <Label>ملاحظات</Label>
              <Textarea placeholder="تفاصيل المصروف..." className="mt-1.5" rows={2} />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowAddExpense(false)}>إلغاء</Button>
              <Button onClick={() => setShowAddExpense(false)}>تسجيل المصروف</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
