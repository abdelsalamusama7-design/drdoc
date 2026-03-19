import { useMemo } from "react";
import { motion } from "framer-motion";
import { FileBarChart, Users, DollarSign, Loader2, Star, TrendingUp, Download, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAllAppointments, usePatients, useServices, useExpenses, usePatientRatings } from "@/hooks/useSupabaseData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "tween" as const, ease: [0.2, 0, 0, 1] as const, duration: 0.25 },
};

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(199, 89%, 48%)', 'hsl(142, 71%, 45%)', 'hsl(25, 95%, 53%)', 'hsl(262, 83%, 58%)'];

export default function Reports() {
  const { data: appointments, loading: aptLoading } = useAllAppointments();
  const { data: patients, loading: patLoading } = usePatients();
  const { data: services } = useServices();
  const { data: expenses } = useExpenses();
  const { data: ratings } = usePatientRatings();

  const loading = aptLoading || patLoading;

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.substring(0, 7);

  const stats = useMemo(() => {
    const todayApts = appointments.filter(a => a.date === today);
    const monthApts = appointments.filter(a => a.date.startsWith(currentMonth));
    const completedMonth = monthApts.filter(a => a.status === 'completed');

    // Visit type breakdown
    const visitTypes: Record<string, number> = {};
    monthApts.forEach(a => {
      visitTypes[a.visit_type] = (visitTypes[a.visit_type] || 0) + 1;
    });
    const visitTypeLabels: Record<string, string> = { consultation: 'استشارة', followup: 'متابعة', procedure: 'إجراء', lab: 'مختبر' };
    const visitTypeData = Object.entries(visitTypes).map(([key, value]) => ({
      name: visitTypeLabels[key] || key, value
    }));

    // Revenue estimate
    const avgPrice = services.length > 0 ? services.reduce((s, sv) => s + sv.price, 0) / services.length : 300;
    const monthlyRevenue = Math.round(completedMonth.length * avgPrice);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // New vs returning patients
    const newPatients = patients.filter(p => p.created_at.startsWith(currentMonth)).length;
    const returningPatients = patients.length - newPatients;

    // Average rating
    const avgRating = ratings.length > 0 ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1) : '—';

    return {
      todayCount: todayApts.length,
      monthCount: monthApts.length,
      completedCount: completedMonth.length,
      monthlyRevenue,
      totalExpenses,
      profit: monthlyRevenue - totalExpenses,
      newPatients,
      returningPatients,
      totalPatients: patients.length,
      visitTypeData,
      avgRating,
      ratingsCount: ratings.length,
    };
  }, [appointments, patients, services, expenses, ratings, today, currentMonth]);

  const buildReportText = (periodLabel: string) => {
    let text = `📊 تقرير ${periodLabel} - DrDoc\n`;
    text += `📅 ${new Date().toLocaleDateString("ar-EG")}\n`;
    text += `━━━━━━━━━━━━━━━\n`;
    text += `👥 مرضى اليوم: ${stats.todayCount}\n`;
    text += `📋 مرضى الشهر: ${stats.monthCount}\n`;
    text += `✅ زيارات مكتملة: ${stats.completedCount}\n`;
    text += `💰 إيراد الشهر: ${stats.monthlyRevenue.toLocaleString()} ج.م\n`;
    text += `📉 المصروفات: ${stats.totalExpenses.toLocaleString()} ج.م\n`;
    text += `💵 صافي الربح: ${stats.profit.toLocaleString()} ج.م\n`;
    text += `⭐ متوسط التقييم: ${stats.avgRating} (${stats.ratingsCount} تقييم)\n`;
    text += `👤 إجمالي المرضى: ${stats.totalPatients}\n`;
    text += `🆕 مرضى جدد: ${stats.newPatients}\n`;
    text += `━━━━━━━━━━━━━━━\n`;
    text += `تم إنشاء التقرير بواسطة DrDoc`;
    return text;
  };

  const downloadCSV = (periodLabel: string) => {
    const csv = [
      "البند,القيمة",
      `مرضى اليوم,${stats.todayCount}`,
      `مرضى الشهر,${stats.monthCount}`,
      `زيارات مكتملة,${stats.completedCount}`,
      `إيراد الشهر,${stats.monthlyRevenue}`,
      `المصروفات,${stats.totalExpenses}`,
      `صافي الربح,${stats.profit}`,
      `متوسط التقييم,${stats.avgRating}`,
      `إجمالي المرضى,${stats.totalPatients}`,
      `مرضى جدد,${stats.newPatients}`,
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `تقرير-${periodLabel}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`تم تحميل التقرير ${periodLabel}`);
  };

  const shareWhatsApp = (periodLabel: string) => {
    const text = buildReportText(periodLabel);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div {...pageTransition} className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">التقارير</h1>

      {/* Download & Share Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm font-medium text-foreground">📥 تحميل ومشاركة التقارير</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "يومي", key: "يومي" },
                { label: "أسبوعي", key: "أسبوعي" },
                { label: "شهري", key: "شهري" },
              ].map(p => (
                <div key={p.key} className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => downloadCSV(p.key)} className="gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    {p.label}
                  </Button>
                  <Button size="sm" onClick={() => shareWhatsApp(p.key)} className="gap-1.5 bg-[#25D366] hover:bg-[#1da851] text-white">
                    <MessageCircle className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "مرضى اليوم", value: stats.todayCount, icon: Users, color: "text-primary", bg: "bg-primary/10" },
          { label: "مرضى الشهر", value: stats.monthCount, icon: FileBarChart, color: "text-accent", bg: "bg-accent/10" },
          { label: "إيراد الشهر", value: `${stats.monthlyRevenue.toLocaleString()} ج.م`, icon: DollarSign, color: "text-success", bg: "bg-success/10" },
          { label: "صافي الربح", value: `${stats.profit.toLocaleString()} ج.م`, icon: TrendingUp, color: stats.profit >= 0 ? "text-success" : "text-destructive", bg: stats.profit >= 0 ? "bg-success/10" : "bg-destructive/10" },
        ].map((stat, i) => (
          <div key={i} className="clinic-card p-4">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`h-[18px] w-[18px] ${stat.color}`} />
            </div>
            <p className="text-lg font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Visit Types Chart */}
        <div className="clinic-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">أنواع الزيارات هذا الشهر</h2>
          {stats.visitTypeData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">لا توجد بيانات</p>
          ) : (
            <div className="h-[200px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.visitTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                    {stats.visitTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Patient Stats */}
        <div className="clinic-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">إحصائيات المرضى</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">إجمالي المرضى</p>
              <p className="text-lg font-bold text-foreground mt-0.5">{stats.totalPatients}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">مرضى جدد (الشهر)</p>
              <p className="text-lg font-bold text-foreground mt-0.5">{stats.newPatients}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">زيارات مكتملة</p>
              <p className="text-lg font-bold text-foreground mt-0.5">{stats.completedCount}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">متوسط التقييم</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="h-4 w-4 text-warning fill-warning" />
                <p className="text-lg font-bold text-foreground">{stats.avgRating}</p>
                <span className="text-[10px] text-muted-foreground">({stats.ratingsCount})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="clinic-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">الملخص المالي</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">الإيرادات</span>
              <span className="text-sm font-bold text-success font-en">{stats.monthlyRevenue.toLocaleString()} ج.م</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">المصروفات</span>
              <span className="text-sm font-bold text-warning font-en">{stats.totalExpenses.toLocaleString()} ج.م</span>
            </div>
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">صافي الربح</span>
              <span className={`text-sm font-bold font-en ${stats.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                {stats.profit.toLocaleString()} ج.م
              </span>
            </div>
          </div>
        </div>

        {/* Top Services */}
        <div className="clinic-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">الخدمات الأكثر طلباً</h2>
          {stats.visitTypeData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">لا توجد بيانات</p>
          ) : (
            <div className="space-y-2">
              {stats.visitTypeData.sort((a, b) => b.value - a.value).map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 text-center">
                    <span className="text-lg font-bold text-foreground font-en">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">{item.name}</span>
                      <span className="text-xs text-muted-foreground font-en">{item.value} زيارة</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${(item.value / Math.max(...stats.visitTypeData.map(d => d.value))) * 100}%`,
                        backgroundColor: COLORS[i % COLORS.length],
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
