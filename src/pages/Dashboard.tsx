import { motion } from "framer-motion";
import {
  Users, CalendarDays, DollarSign, TrendingUp,
  Clock, ArrowLeftCircle, AlertCircle
} from "lucide-react";
import { mockAppointments, mockPatients, visitTypeLabels, statusLabels } from "@/data/mockData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "tween" as const, ease: [0.2, 0, 0, 1], duration: 0.25 },
};

const revenueData = [
  { day: 'سبت', revenue: 2400 },
  { day: 'أحد', revenue: 3200 },
  { day: 'إثنين', revenue: 2800 },
  { day: 'ثلاثاء', revenue: 3600 },
  { day: 'أربعاء', revenue: 4100 },
  { day: 'خميس', revenue: 3800 },
  { day: 'جمعة', revenue: 0 },
];

const stats = [
  { label: "مواعيد اليوم", value: "٨", icon: CalendarDays, color: "text-primary", bg: "bg-primary/10" },
  { label: "إجمالي المرضى", value: "١٬٢٤٣", icon: Users, color: "text-accent", bg: "bg-accent/10" },
  { label: "إيراد اليوم", value: "٣٬٦٠٠", suffix: "ر.س", icon: DollarSign, color: "text-success", bg: "bg-success/10" },
  { label: "نمو شهري", value: "+١٢٪", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
];

const todayAppointments = mockAppointments.filter(a => a.date === '2025-03-16');

export default function Dashboard() {
  return (
    <motion.div {...pageTransition} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">
          مرحباً دكتور، لديك ٨ مواعيد اليوم
        </h1>
        <p className="text-sm text-muted-foreground mt-1">الأحد، ١٦ مارس ٢٠٢٥</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="clinic-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-[18px] w-[18px] ${stat.color}`} />
              </div>
            </div>
            <div className="stat-value text-foreground">
              {stat.value}
              {stat.suffix && <span className="text-sm font-normal text-muted-foreground mr-1">{stat.suffix}</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2 clinic-card">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">مواعيد اليوم</h2>
            <Link to="/appointments" className="text-xs text-primary hover:underline">عرض الكل</Link>
          </div>
          <div className="divide-y divide-border">
            {todayAppointments.map((apt) => (
              <div key={apt.id} className="p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted text-xs font-bold text-muted-foreground font-en tabular-nums">
                  {apt.time}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{apt.patientName}</p>
                  <p className="text-xs text-muted-foreground">{visitTypeLabels[apt.visitType]}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                  apt.status === 'in-progress' ? 'bg-primary/10 text-primary' :
                  apt.status === 'completed' ? 'bg-success/10 text-success' :
                  apt.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {statusLabels[apt.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Revenue Chart */}
          <div className="clinic-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-4">إيرادات الأسبوع</h2>
            <div className="h-[160px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(214, 32%, 91%)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(217, 91%, 60%)" strokeWidth={2} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Alerts */}
          <div className="clinic-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">تنبيهات</h2>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs">
                <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <span className="text-muted-foreground">٣ مرضى لم يعودوا منذ أكثر من ٣ أشهر</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">٢ مواعيد متابعة قادمة هذا الأسبوع</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <ArrowLeftCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span className="text-muted-foreground">تقرير مالي شهري جاهز للمراجعة</span>
              </div>
            </div>
          </div>

          {/* Recent Patients */}
          <div className="clinic-card">
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">آخر المرضى</h2>
            </div>
            <div className="divide-y divide-border">
              {mockPatients.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  to={`/patients/${p.id}`}
                  className="p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {p.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground font-en">{p.phone}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
