import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Users, CalendarCheck, TrendingUp, Activity, Clock,
  FileText, Bell, Award, Loader2, ArrowUp, ArrowDown, Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useClinic } from "@/hooks/useClinic";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

interface UsageMetrics {
  totalPatients: number;
  weeklyPatients: number;
  totalAppointments: number;
  weeklyAppointments: number;
  totalVisits: number;
  weeklyVisits: number;
  totalPrescriptions: number;
  weeklyPrescriptions: number;
  noShowRate: number;
  avgVisitsPerPatient: number;
}

export default function RetentionDashboard() {
  const { clinic } = useClinic();
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clinic) return;
    fetchMetrics();
  }, [clinic]);

  const fetchMetrics = async () => {
    if (!clinic) return;
    setLoading(true);
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 6 }), "yyyy-MM-dd");
    const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 6 }), "yyyy-MM-dd");

    const [pAll, pWeek, aAll, aWeek, vAll, vWeek, rxAll, rxWeek] = await Promise.all([
      supabase.from("patients").select("id", { count: "exact", head: true }).eq("clinic_id", clinic.id),
      supabase.from("patients").select("id", { count: "exact", head: true }).eq("clinic_id", clinic.id).gte("created_at", weekStart),
      supabase.from("appointments").select("id", { count: "exact", head: true }).eq("clinic_id", clinic.id),
      supabase.from("appointments").select("id", { count: "exact", head: true }).eq("clinic_id", clinic.id).gte("date", weekStart).lte("date", weekEnd),
      supabase.from("visits").select("id", { count: "exact", head: true }).eq("clinic_id", clinic.id),
      supabase.from("visits").select("id", { count: "exact", head: true }).eq("clinic_id", clinic.id).gte("date", weekStart).lte("date", weekEnd),
      supabase.from("prescriptions").select("id", { count: "exact", head: true }).eq("clinic_id", clinic.id),
      supabase.from("prescriptions").select("id", { count: "exact", head: true }).eq("clinic_id", clinic.id).gte("date", weekStart),
    ]);

    const totalP = pAll.count || 0;
    const totalV = vAll.count || 0;
    const noShowCount = await supabase.from("appointments").select("id", { count: "exact", head: true })
      .eq("clinic_id", clinic.id).eq("status", "no-show");

    setMetrics({
      totalPatients: totalP,
      weeklyPatients: pWeek.count || 0,
      totalAppointments: aAll.count || 0,
      weeklyAppointments: aWeek.count || 0,
      totalVisits: totalV,
      weeklyVisits: vWeek.count || 0,
      totalPrescriptions: rxAll.count || 0,
      weeklyPrescriptions: rxWeek.count || 0,
      noShowRate: (aAll.count || 0) > 0 ? Math.round(((noShowCount.count || 0) / (aAll.count || 1)) * 100) : 0,
      avgVisitsPerPatient: totalP > 0 ? Math.round((totalV / totalP) * 10) / 10 : 0,
    });
    setLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!metrics) return null;

  const cards = [
    { label: "إجمالي المرضى", value: metrics.totalPatients, weekly: metrics.weeklyPatients, icon: Users, color: "text-primary" },
    { label: "المواعيد", value: metrics.totalAppointments, weekly: metrics.weeklyAppointments, icon: CalendarCheck, color: "text-success" },
    { label: "الزيارات", value: metrics.totalVisits, weekly: metrics.weeklyVisits, icon: Activity, color: "text-accent" },
    { label: "الوصفات", value: metrics.totalPrescriptions, weekly: metrics.weeklyPrescriptions, icon: FileText, color: "text-warning" },
  ];

  const healthScore = Math.min(100, Math.round(
    (metrics.weeklyAppointments > 0 ? 25 : 0) +
    (metrics.weeklyVisits > 0 ? 25 : 0) +
    (metrics.weeklyPatients > 0 ? 25 : 0) +
    (metrics.noShowRate < 20 ? 25 : metrics.noShowRate < 40 ? 15 : 5)
  ));

  const suggestions: { text: string; priority: "high" | "medium" | "low"; action?: string }[] = [];
  if (metrics.weeklyAppointments === 0) suggestions.push({ text: "لم يتم حجز أي مواعيد هذا الأسبوع. فعّل التذكيرات التلقائية لتشجيع الحجز.", priority: "high", action: "/appointments" });
  if (metrics.noShowRate > 30) suggestions.push({ text: `نسبة عدم الحضور ${metrics.noShowRate}% مرتفعة. استخدم نظام التذكيرات قبل الموعد بـ 24 ساعة.`, priority: "high", action: "/no-show" });
  if (metrics.totalPatients > 0 && metrics.avgVisitsPerPatient < 2) suggestions.push({ text: "معدل الزيارات لكل مريض منخفض. استخدم نظام المتابعات لتحسين العودة.", priority: "medium" });
  if (metrics.weeklyPrescriptions === 0 && metrics.weeklyVisits > 0) suggestions.push({ text: "لم يتم كتابة أي وصفات هذا الأسبوع رغم وجود زيارات.", priority: "low" });
  if (suggestions.length === 0) suggestions.push({ text: "🎉 أداء ممتاز! استمر في الحفاظ على هذا المستوى.", priority: "low" });

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />متابعة الأداء والاستخدام</h1>
          <p className="text-sm text-muted-foreground">تقرير أسبوعي لأداء عيادتك</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchMetrics}><BarChart3 className="h-4 w-4" />تحديث</Button>
      </div>

      {/* Health Score */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="clinic-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-foreground flex items-center gap-2"><Award className="h-5 w-5 text-warning" />مؤشر صحة العيادة</h2>
          <span className={`text-2xl font-bold font-en ${healthScore >= 75 ? "text-success" : healthScore >= 50 ? "text-warning" : "text-destructive"}`}>{healthScore}%</span>
        </div>
        <Progress value={healthScore} className="h-3 mb-3" />
        <p className="text-xs text-muted-foreground">
          {healthScore >= 75 ? "🟢 أداء ممتاز - استمر!" : healthScore >= 50 ? "🟡 أداء جيد - يمكن تحسينه" : "🔴 يحتاج تحسين - اتبع التوصيات أدناه"}
        </p>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="clinic-card p-4">
            <div className="flex items-center justify-between mb-2">
              <c.icon className={`h-5 w-5 ${c.color}`} />
              {c.weekly > 0 ? <ArrowUp className="h-3.5 w-3.5 text-success" /> : <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
            <p className="text-2xl font-bold text-foreground font-en">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="text-[10px] text-primary font-en mt-1">+{c.weekly} هذا الأسبوع</p>
          </motion.div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="clinic-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"><Clock className="h-4 w-4 text-accent" />نسبة عدم الحضور</h3>
          <p className={`text-3xl font-bold font-en ${metrics.noShowRate > 30 ? "text-destructive" : metrics.noShowRate > 15 ? "text-warning" : "text-success"}`}>{metrics.noShowRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">{metrics.noShowRate > 30 ? "مرتفعة - فعّل التذكيرات" : metrics.noShowRate > 15 ? "متوسطة" : "ممتازة!"}</p>
        </div>
        <div className="clinic-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />متوسط الزيارات / مريض</h3>
          <p className="text-3xl font-bold text-primary font-en">{metrics.avgVisitsPerPatient}</p>
          <p className="text-xs text-muted-foreground mt-1">{metrics.avgVisitsPerPatient >= 3 ? "معدل عودة ممتاز" : "يحتاج تحسين"}</p>
        </div>
      </div>

      {/* Suggestions */}
      <div className="clinic-card p-6">
        <h2 className="font-bold text-foreground mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />توصيات ذكية لتحسين الأداء</h2>
        <div className="space-y-3">
          {suggestions.map((s, i) => (
            <div key={i} className={`p-3 rounded-xl border text-sm flex items-start gap-3 ${
              s.priority === "high" ? "border-destructive/30 bg-destructive/5" : s.priority === "medium" ? "border-warning/30 bg-warning/5" : "border-success/30 bg-success/5"
            }`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                s.priority === "high" ? "bg-destructive" : s.priority === "medium" ? "bg-warning" : "bg-success"
              }`} />
              <div className="flex-1">
                <p className="text-foreground">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
