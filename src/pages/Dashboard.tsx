import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users, CalendarDays, DollarSign, TrendingUp, TrendingDown,
  Clock, Activity, Stethoscope,
  FileText, ChevronLeft, Play, FolderOpen, StickyNote,
  UserPlus, Receipt, ArrowUpRight, Zap,
  Calendar, Star, Loader2, ExternalLink, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { useAppointments, usePatients, useExpenses, useFollowUps, useServices, useAllPayments, useAllAppointments } from "@/hooks/useSupabaseData";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } }
};

const itemAnim = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.2, 0, 0, 1] as const } }
};

export default function Dashboard() {
  const { t, lang } = useI18n();
  const [activeTab, setActiveTab] = useState<'all' | 'waiting' | 'in-progress'>('all');

  const today = new Date().toISOString().split("T")[0];
  const { data: todayApts, loading: aptsLoading } = useAppointments(today);
  const { data: allApts } = useAllAppointments();
  const { data: patients, loading: patsLoading } = usePatients();
  const { data: expenses } = useExpenses();
  const { data: followUps } = useFollowUps();
  const { data: services } = useServices();
  const { data: payments } = useAllPayments();

  const loading = aptsLoading || patsLoading;

  const stats = useMemo(() => {
    const pendingFollowups = followUps.filter(f => f.status === "pending").length;
    const todayPayments = payments.filter(p => p.created_at?.startsWith(today));
    const todayRevenue = todayPayments.reduce((s, p) => s + Number(p.amount), 0);
    const todayExpenses = expenses.filter(e => e.date === today).reduce((s, e) => s + Number(e.amount), 0);

    return {
      patientsToday: todayApts.length,
      appointmentCount: todayApts.length,
      todayRevenue: Math.round(todayRevenue),
      todayExpenses: Math.round(todayExpenses),
      pendingFollowups,
    };
  }, [todayApts, followUps, payments, expenses, today]);

  const revenueData = useMemo(() => {
    const now = new Date();
    const dayNames = [t("day.sun"), t("day.mon"), t("day.tue"), t("day.wed"), t("day.thu"), t("day.fri"), t("day.sat")];
    const result: { day: string; revenue: number; expenses: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayRevenue = payments.filter(p => p.created_at?.startsWith(dateStr)).reduce((s, p) => s + Number(p.amount), 0);
      const dayExp = expenses.filter(e => e.date === dateStr).reduce((s, e) => s + Number(e.amount), 0);
      result.push({ day: dayNames[d.getDay()], revenue: Math.round(dayRevenue), expenses: Math.round(dayExp) });
    }
    return result;
  }, [payments, expenses, t]);

  const quickActions = [
    { label: t("action.newPatient"), icon: UserPlus, path: "/patients" },
    { label: t("action.bookAppointment"), icon: CalendarDays, path: "/appointments" },
    { label: t("action.prescription"), icon: FileText, path: "/prescriptions" },
    { label: t("action.addExpense"), icon: Receipt, path: "/finance" },
  ];

  const filteredApts = activeTab === 'all' ? todayApts :
    activeTab === 'waiting' ? todayApts.filter(a => a.status === 'scheduled') :
    todayApts.filter(a => a.status === 'in-progress');

  const totalWeeklyRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const avgDailyRevenue = Math.round(totalWeeklyRevenue / 6);
  const currency = t("dash.sar");

  const statCards = [
    { label: t("dash.patientsToday"), value: String(stats.patientsToday), change: `+${stats.patientsToday}`, up: true, icon: Users, color: "text-primary", bg: "bg-primary/10", ringColor: "ring-primary/20" },
    { label: t("dash.appointmentCount"), value: String(stats.appointmentCount), change: `+${stats.appointmentCount}`, up: true, icon: CalendarDays, color: "text-accent", bg: "bg-accent/10", ringColor: "ring-accent/20" },
    { label: t("dash.todayRevenue"), value: stats.todayRevenue.toLocaleString(), suffix: currency, change: "+12%", up: true, icon: DollarSign, color: "text-success", bg: "bg-success/10", ringColor: "ring-success/20" },
    { label: t("dash.pendingFollowups"), value: String(stats.pendingFollowups), change: String(stats.pendingFollowups), up: false, icon: Clock, color: "text-warning", bg: "bg-warning/10", ringColor: "ring-warning/20" },
  ];

  const performanceInsights = useMemo(() => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthApts = allApts.filter(a => a.date?.startsWith(thisMonth));
    const totalRevenue = payments.reduce((s, p) => s + Number(p.amount), 0);
    const totalExp = expenses.reduce((s, e) => s + Number(e.amount), 0);

    // Find busiest day of week
    const dayCounts: Record<number, number> = {};
    allApts.forEach(a => { const d = new Date(a.date).getDay(); dayCounts[d] = (dayCounts[d] || 0) + 1; });
    const busiestDayIdx = Object.entries(dayCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0];
    const dayKeys = ["day.sun", "day.mon", "day.tue", "day.wed", "day.thu", "day.fri", "day.sat"];
    const busiestDay = busiestDayIdx ? t(dayKeys[Number(busiestDayIdx[0])]) : "—";

    return [
      { label: t("dash.monthConsultations"), value: String(monthApts.length), icon: Stethoscope, color: "text-primary" },
      { label: t("dash.followups"), value: String(followUps.filter(f => f.status === "pending").length), icon: Calendar, color: "text-accent" },
      { label: lang === "ar" ? "إجمالي الإيرادات" : "Total Revenue", value: totalRevenue.toLocaleString(), icon: DollarSign, color: "text-success" },
      { label: t("dash.busiestDay"), value: busiestDay, icon: Zap, color: "text-warning" },
    ];
  }, [allApts, payments, expenses, followUps, t, lang]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Header + Quick Actions */}
      <motion.div variants={itemAnim} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">{t("dash.welcome")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("dash.todayDate")} · <span className="text-primary font-semibold">{stats.appointmentCount} {t("dash.appointmentsToday")}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.path} className="group flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border hover:border-primary/30 transition-all text-xs font-medium text-foreground hover:text-primary" style={{ boxShadow: 'var(--card-shadow)' }}>
              <action.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="hidden md:inline">{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemAnim} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat, i) => (
          <motion.div key={i} variants={itemAnim} className="clinic-card p-4 group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-2xl ${stat.bg} ring-1 ${stat.ringColor} flex items-center justify-center transition-transform group-hover:scale-105`}>
                <stat.icon className={`h-[18px] w-[18px] ${stat.color}`} />
              </div>
              <span className={`flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${stat.up ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'}`}>
                {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {stat.change}
              </span>
            </div>
            <div className="animate-count-up">
              <p className="stat-value text-foreground font-en">
                {stat.value}
                {stat.suffix && <span className="text-xs font-normal text-muted-foreground mr-1">{stat.suffix}</span>}
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Today's Appointments */}
        <motion.div variants={itemAnim} className="lg:col-span-8 clinic-card">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">{t("dash.todayAppointments")}</h2>
                <p className="text-[10px] text-muted-foreground">{todayApts.length} {t("dash.appointmentsToday")}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {[
                { key: 'all' as const, label: t("dash.all") },
                { key: 'waiting' as const, label: t("dash.waiting") },
                { key: 'in-progress' as const, label: t("dash.inProgress") },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition-colors ${activeTab === tab.key ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-[10px] text-muted-foreground font-medium text-right px-4 py-2.5">{t("dash.time")}</th>
                  <th className="text-[10px] text-muted-foreground font-medium text-right px-4 py-2.5">{t("dash.patient")}</th>
                  <th className="text-[10px] text-muted-foreground font-medium text-right px-4 py-2.5 hidden sm:table-cell">{t("dash.visitType")}</th>
                  <th className="text-[10px] text-muted-foreground font-medium text-right px-4 py-2.5">{t("dash.status")}</th>
                  <th className="text-[10px] text-muted-foreground font-medium text-right px-4 py-2.5">{t("dash.action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredApts.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-sm text-muted-foreground">{lang === "ar" ? "لا توجد مواعيد اليوم" : "No appointments today"}</td></tr>
                ) : filteredApts.map((apt, idx) => (
                  <motion.tr key={apt.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold font-en tabular-nums text-foreground">{apt.time?.substring(0, 5)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                          {apt.patient_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold text-foreground">{apt.patient_name}</p>
                          <p className="text-[10px] text-muted-foreground font-en">{apt.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-[10px] px-2 py-1 rounded-lg font-medium ${
                        apt.visit_type === 'consultation' ? 'bg-primary/10 text-primary' :
                        apt.visit_type === 'followup' ? 'bg-accent/10 text-accent' :
                        apt.visit_type === 'procedure' ? 'bg-success/10 text-success' :
                        'bg-warning/10 text-warning'
                      }`}>
                        {t(`visit.${apt.visit_type}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-1 rounded-lg font-medium ${
                        apt.status === 'in-progress' ? 'status-in-progress' :
                        apt.status === 'completed' ? 'status-completed' :
                        apt.status === 'cancelled' ? 'status-cancelled' : 'status-waiting'
                      }`}>
                        {t(`status.${apt.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {apt.patient_id && (
                          <Link to={`/patients/${apt.patient_id}`} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" title={t("dash.openFile")}>
                            <FolderOpen className="h-3.5 w-3.5" />
                          </Link>
                        )}
                        <button className="p-1.5 rounded-lg hover:bg-primary/10 text-primary" title={t("dash.startVisit")}>
                          <Play className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">{filteredApts.length} {t("dash.appointmentsToday")}</p>
            <Link to="/appointments" className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1">
              {t("dash.viewAll")} <ChevronLeft className="h-3 w-3" />
            </Link>
          </div>
        </motion.div>

        {/* Right Column */}
        <motion.div variants={itemAnim} className="lg:col-span-4 space-y-4">
          {/* Revenue Chart */}
          <div className="clinic-card p-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-foreground">{t("dash.weeklyRevenue")}</h2>
              <ArrowUpRight className="h-4 w-4 text-success" />
            </div>
            <div className="flex items-baseline gap-3 mb-3">
              <p className="text-xl font-bold text-foreground font-en">{totalWeeklyRevenue.toLocaleString()}</p>
              <span className="text-[10px] text-muted-foreground">{currency}</span>
            </div>
            <div className="h-[140px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '8px 12px' }} formatter={(value: number) => [`${value.toLocaleString()} ${currency}`, '']} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(217, 91%, 60%)" strokeWidth={2} fill="url(#revGrad2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <div>
                <p className="text-[10px] text-muted-foreground">{t("dash.totalWeekly")}</p>
                <p className="text-sm font-bold text-foreground font-en">{totalWeeklyRevenue.toLocaleString()}</p>
              </div>
              <div className="text-left">
                <p className="text-[10px] text-muted-foreground">{t("dash.dailyAvg")}</p>
                <p className="text-sm font-bold text-foreground font-en">{avgDailyRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Quick Patient Access */}
          <div className="clinic-card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                {t("dash.quickAccess")}
              </h2>
              <Link to="/patients" className="text-[10px] text-primary hover:underline font-medium">{t("dash.allPatients")}</Link>
            </div>
            <div className="p-2">
              <p className="text-[9px] text-muted-foreground px-2 py-1 font-medium">{t("dash.recentPatients")}</p>
              {patients.slice(0, 4).map((p) => (
                <Link key={p.id} to={`/patients/${p.id}`} className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center text-[10px] font-bold text-primary">{p.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-foreground truncate">{p.name}</p>
                    <p className="text-[9px] text-muted-foreground font-en">{p.phone}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Performance */}
          <div className="clinic-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">{t("dash.clinicPerformance")}</h2>
            <div className="grid grid-cols-2 gap-2">
              {performanceInsights.map((p, i) => (
                <div key={i} className="bg-muted/50 rounded-xl p-3">
                  <p.icon className={`h-4 w-4 ${p.color} mb-2`} />
                  <p className="text-sm font-bold text-foreground">{p.value}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{p.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
