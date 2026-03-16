import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, CalendarDays, DollarSign, TrendingUp, TrendingDown,
  Clock, AlertCircle, Activity, Stethoscope,
  FileText, ChevronLeft, Play, FolderOpen, StickyNote,
  UserPlus, Plus, Receipt, ArrowUpRight, Zap,
  BarChart3, Calendar, Star, FlaskConical
} from "lucide-react";
import { mockAppointments, mockPatients, mockServices, visitTypeLabels, statusLabels } from "@/data/mockData";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.2, 0, 0, 1] } }
};

const revenueData = [
  { day: 'سبت', revenue: 2400, patients: 5 },
  { day: 'أحد', revenue: 3200, patients: 7 },
  { day: 'إثنين', revenue: 2800, patients: 6 },
  { day: 'ثلاثاء', revenue: 3600, patients: 8 },
  { day: 'أربعاء', revenue: 4100, patients: 9 },
  { day: 'خميس', revenue: 3800, patients: 7 },
  { day: 'جمعة', revenue: 0, patients: 0 },
];

const monthlyData = [
  { month: 'يناير', revenue: 45000 },
  { month: 'فبراير', revenue: 52000 },
  { month: 'مارس', revenue: 48000 },
  { month: 'أبريل', revenue: 61000 },
  { month: 'مايو', revenue: 55000 },
  { month: 'يونيو', revenue: 67000 },
];

const visitTypeData = [
  { name: 'استشارة', value: 42, color: 'hsl(217, 91%, 60%)' },
  { name: 'متابعة', value: 28, color: 'hsl(199, 89%, 48%)' },
  { name: 'إجراء', value: 18, color: 'hsl(142, 71%, 45%)' },
  { name: 'مختبر', value: 12, color: 'hsl(25, 95%, 53%)' },
];

const stats = [
  {
    label: "مرضى اليوم", value: "١٢", change: "+٣", up: true,
    icon: Users, color: "text-primary", bg: "bg-primary/10",
    ringColor: "ring-primary/20"
  },
  {
    label: "مواعيد اليوم", value: "٨", change: "+٢", up: true,
    icon: CalendarDays, color: "text-accent", bg: "bg-accent/10",
    ringColor: "ring-accent/20"
  },
  {
    label: "إيراد اليوم", value: "٣٬٦٠٠", suffix: "ر.س", change: "+١٢٪", up: true,
    icon: DollarSign, color: "text-success", bg: "bg-success/10",
    ringColor: "ring-success/20"
  },
  {
    label: "متابعات معلقة", value: "٥", change: "-٢", up: false,
    icon: Clock, color: "text-warning", bg: "bg-warning/10",
    ringColor: "ring-warning/20"
  },
];

const todayAppointments = mockAppointments.filter(a => a.date === '2025-03-16');

const performanceInsights = [
  { label: "استشارات هذا الشهر", value: "٤٧", icon: Stethoscope, color: "text-primary" },
  { label: "متابعات", value: "٢٣", icon: Calendar, color: "text-accent" },
  { label: "أعلى خدمة", value: "استشارة أولية", icon: Star, color: "text-warning" },
  { label: "أنشط يوم", value: "الأربعاء", icon: Zap, color: "text-success" },
];

const quickActions = [
  { label: "مريض جديد", icon: UserPlus, path: "/patients", color: "bg-primary" },
  { label: "حجز موعد", icon: CalendarDays, path: "/appointments", color: "bg-accent" },
  { label: "وصفة طبية", icon: FileText, path: "/prescriptions", color: "bg-success" },
  { label: "إضافة مصروف", icon: Receipt, path: "/finance", color: "bg-warning" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'all' | 'waiting' | 'in-progress'>('all');

  const filteredApts = activeTab === 'all' ? todayAppointments :
    activeTab === 'waiting' ? todayAppointments.filter(a => a.status === 'scheduled') :
    todayAppointments.filter(a => a.status === 'in-progress');

  const totalWeeklyRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const avgDailyRevenue = Math.round(totalWeeklyRevenue / 6);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* Header + Quick Actions */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">
            مرحباً دكتور 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            الأحد، ١٦ مارس ٢٠٢٥ · لديك <span className="text-primary font-semibold">٨ مواعيد</span> اليوم
          </p>
        </div>
        <div className="flex items-center gap-2">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className="group flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border hover:border-primary/30 transition-all text-xs font-medium text-foreground hover:text-primary"
              style={{ boxShadow: 'var(--card-shadow)' }}
            >
              <action.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="hidden md:inline">{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            variants={item}
            className="clinic-card p-4 group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-2xl ${stat.bg} ring-1 ${stat.ringColor} flex items-center justify-center transition-transform group-hover:scale-105`}>
                <stat.icon className={`h-[18px] w-[18px] ${stat.color}`} />
              </div>
              <span className={`flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                stat.up ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'
              }`}>
                {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {stat.change}
              </span>
            </div>
            <div className="animate-count-up">
              <p className="stat-value text-foreground">
                {stat.value}
                {stat.suffix && <span className="text-xs font-normal text-muted-foreground mr-1">{stat.suffix}</span>}
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid: Appointments Table + Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Today's Appointments Table */}
        <motion.div variants={item} className="lg:col-span-8 clinic-card">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">مواعيد اليوم</h2>
                <p className="text-[10px] text-muted-foreground">{todayAppointments.length} مواعيد</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Tab filters */}
              {[
                { key: 'all' as const, label: 'الكل' },
                { key: 'waiting' as const, label: 'بانتظار' },
                { key: 'in-progress' as const, label: 'جاري' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-[10px] text-muted-foreground font-medium text-right px-4 py-2.5">الوقت</th>
                  <th className="text-[10px] text-muted-foreground font-medium text-right px-4 py-2.5">المريض</th>
                  <th className="text-[10px] text-muted-foreground font-medium text-right px-4 py-2.5 hidden sm:table-cell">نوع الزيارة</th>
                  <th className="text-[10px] text-muted-foreground font-medium text-right px-4 py-2.5 hidden md:table-cell">الطبيب</th>
                  <th className="text-[10px] text-muted-foreground font-medium text-right px-4 py-2.5">الحالة</th>
                  <th className="text-[10px] text-muted-foreground font-medium text-right px-4 py-2.5">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredApts.map((apt, idx) => (
                  <motion.tr
                    key={apt.id}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold font-en tabular-nums text-foreground">{apt.time}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                          {apt.patientName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold text-foreground">{apt.patientName}</p>
                          <p className="text-[10px] text-muted-foreground font-en">{apt.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-[10px] px-2 py-1 rounded-lg font-medium ${
                        apt.visitType === 'consultation' ? 'bg-primary/8 text-primary' :
                        apt.visitType === 'followup' ? 'bg-accent/8 text-accent' :
                        apt.visitType === 'procedure' ? 'bg-success/8 text-success' :
                        'bg-warning/8 text-warning'
                      }`}>
                        {visitTypeLabels[apt.visitType]}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-[11px] text-muted-foreground">{apt.doctor}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {apt.status === 'in-progress' && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                        )}
                        <span className={`text-[10px] px-2 py-1 rounded-lg font-medium ${
                          apt.status === 'in-progress' ? 'status-in-progress' :
                          apt.status === 'completed' ? 'status-completed' :
                          apt.status === 'cancelled' ? 'status-cancelled' :
                          'status-waiting'
                        }`}>
                          {apt.status === 'scheduled' ? 'بانتظار' : statusLabels[apt.status]}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/patients/${apt.patientId}`} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" title="فتح الملف">
                          <FolderOpen className="h-3.5 w-3.5" />
                        </Link>
                        <button className="p-1.5 rounded-lg hover:bg-primary/10 text-primary" title="بدء الزيارة">
                          <Play className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" title="إضافة ملاحظة">
                          <StickyNote className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">{filteredApts.length} مواعيد</p>
            <Link to="/appointments" className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1">
              عرض الكل <ChevronLeft className="h-3 w-3" />
            </Link>
          </div>
        </motion.div>

        {/* Right Column: Revenue + Patient Quick Access */}
        <motion.div variants={item} className="lg:col-span-4 space-y-4">
          {/* Revenue Chart */}
          <div className="clinic-card p-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-foreground">إيرادات الأسبوع</h2>
              <ArrowUpRight className="h-4 w-4 text-success" />
            </div>
            <div className="flex items-baseline gap-3 mb-3">
              <p className="text-xl font-bold text-foreground font-en">{totalWeeklyRevenue.toLocaleString()}</p>
              <span className="text-[10px] text-muted-foreground">ر.س</span>
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
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(214, 32%, 91%)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      padding: '8px 12px',
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} ر.س`, '']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(217, 91%, 60%)" strokeWidth={2} fill="url(#revGrad2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <div>
                <p className="text-[10px] text-muted-foreground">إجمالي أسبوعي</p>
                <p className="text-sm font-bold text-foreground font-en">{totalWeeklyRevenue.toLocaleString()}</p>
              </div>
              <div className="text-left">
                <p className="text-[10px] text-muted-foreground">متوسط يومي</p>
                <p className="text-sm font-bold text-foreground font-en">{avgDailyRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Patient Quick Access */}
          <div className="clinic-card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                وصول سريع
              </h2>
              <Link to="/patients" className="text-[10px] text-primary hover:underline font-medium">الكل</Link>
            </div>
            <div className="p-2">
              <p className="text-[9px] text-muted-foreground px-2 py-1 font-medium">آخر المرضى</p>
              {mockPatients.slice(0, 3).map((p) => (
                <Link
                  key={p.id}
                  to={`/patients/${p.id}`}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold truncate text-foreground">{p.name}</p>
                    <p className="text-[9px] text-muted-foreground font-en">{p.phone}</p>
                  </div>
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                </Link>
              ))}
              <div className="mt-1 pt-1 border-t border-border/50">
                <p className="text-[9px] text-muted-foreground px-2 py-1 font-medium">يحتاجون متابعة</p>
                {mockPatients.slice(3, 5).map((p) => (
                  <Link
                    key={p.id}
                    to={`/patients/${p.id}`}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-warning/10 flex items-center justify-center text-[10px] font-bold text-warning shrink-0">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold truncate text-foreground">{p.name}</p>
                      <p className="text-[9px] text-warning">آخر زيارة: {p.lastVisit}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Third Row: Charts + Performance + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Monthly Revenue */}
        <motion.div variants={item} className="lg:col-span-5 clinic-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">الإيرادات الشهرية</h2>
              <p className="text-[10px] text-muted-foreground">آخر ٦ أشهر</p>
            </div>
            <Link to="/finance" className="text-[10px] text-primary hover:underline font-medium">التفاصيل</Link>
          </div>
          <div className="h-[180px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={35} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(0, 0%, 100%)',
                    border: '1px solid hsl(214, 32%, 91%)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} ر.س`, '']}
                />
                <Bar dataKey="revenue" fill="hsl(217, 91%, 60%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Visit Types Donut */}
        <motion.div variants={item} className="lg:col-span-3 clinic-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-1">أنواع الزيارات</h2>
          <p className="text-[10px] text-muted-foreground mb-2">هذا الشهر</p>
          <div className="h-[130px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visitTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={58}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {visitTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'hsl(0, 0%, 100%)',
                    border: '1px solid hsl(214, 32%, 91%)',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                  formatter={(value: number) => [`${value}%`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {visitTypeData.map((t) => (
              <div key={t.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                <span className="text-[10px] text-muted-foreground">{t.name}</span>
                <span className="text-[10px] font-bold text-foreground mr-auto font-en">{t.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Performance + Alerts */}
        <motion.div variants={item} className="lg:col-span-4 space-y-4">
          {/* Performance Insights */}
          <div className="clinic-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              أداء العيادة
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {performanceInsights.map((insight) => (
                <div key={insight.label} className="p-2.5 rounded-xl bg-muted/40 border border-border/30">
                  <insight.icon className={`h-3.5 w-3.5 ${insight.color} mb-1.5`} />
                  <p className="text-sm font-bold text-foreground">{insight.value}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{insight.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="clinic-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning" />
              تنبيهات
            </h2>
            <div className="space-y-2">
              {[
                { text: "فهد القحطاني - تحليل جاهز", icon: FlaskConical, color: "text-accent", bg: "bg-accent/5 border-accent/10" },
                { text: "٣ مرضى متأخرون عن المتابعة", icon: AlertCircle, color: "text-warning", bg: "bg-warning/5 border-warning/10" },
                { text: "٢ مواعيد متابعة هذا الأسبوع", icon: Clock, color: "text-primary", bg: "bg-primary/5 border-primary/10" },
              ].map((alert, i) => (
                <div key={i} className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${alert.bg} transition-colors hover:brightness-95 cursor-pointer`}>
                  <alert.icon className={`h-3.5 w-3.5 ${alert.color} shrink-0`} />
                  <p className="text-[11px] text-foreground">{alert.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Services */}
          <div className="clinic-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" />
              أكثر الخدمات طلباً
            </h2>
            <div className="space-y-2">
              {mockServices.slice(0, 3).map((service, i) => {
                const counts = [32, 24, 18];
                const maxCount = 32;
                return (
                  <div key={service.id} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-muted-foreground font-en w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[11px] font-medium text-foreground truncate">{service.name}</p>
                        <span className="text-[10px] font-bold text-foreground font-en">{counts[i]}</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(counts[i] / maxCount) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
