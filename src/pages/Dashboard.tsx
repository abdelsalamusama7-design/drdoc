import { motion } from "framer-motion";
import {
  Users, CalendarDays, DollarSign, TrendingUp, TrendingDown,
  Clock, ArrowLeftCircle, AlertCircle, Activity, Stethoscope,
  FileText, ChevronLeft
} from "lucide-react";
import { mockAppointments, mockPatients, mockServices, visitTypeLabels, statusLabels } from "@/data/mockData";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { Link } from "react-router-dom";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "tween" as const, ease: [0.2, 0, 0, 1] as const, duration: 0.25 },
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
    label: "مواعيد اليوم", value: "٨", change: "+٢", up: true,
    icon: CalendarDays, color: "text-primary", bg: "bg-primary/10",
    gradient: "from-primary/5 to-primary/[0.02]"
  },
  {
    label: "إجمالي المرضى", value: "١٬٢٤٣", change: "+١٨", up: true,
    icon: Users, color: "text-accent", bg: "bg-accent/10",
    gradient: "from-accent/5 to-accent/[0.02]"
  },
  {
    label: "إيراد اليوم", value: "٣٬٦٠٠", suffix: "ر.س", change: "+١٢٪", up: true,
    icon: DollarSign, color: "text-success", bg: "bg-success/10",
    gradient: "from-success/5 to-success/[0.02]"
  },
  {
    label: "الوصفات", value: "٢٤", change: "-٣", up: false,
    icon: FileText, color: "text-warning", bg: "bg-warning/10",
    gradient: "from-warning/5 to-warning/[0.02]"
  },
];

const todayAppointments = mockAppointments.filter(a => a.date === '2025-03-16');

// Time slots for mini schedule
const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00'];

export default function Dashboard() {
  return (
    <motion.div {...pageTransition} className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">
            مرحباً دكتور 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            الأحد، ١٦ مارس ٢٠٢٥ · لديك <span className="text-primary font-semibold">٨ مواعيد</span> اليوم
          </p>
        </div>
        <Link
          to="/appointments"
          className="hidden lg:flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
        >
          عرض الجدول
          <ChevronLeft className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className={`clinic-card p-4 bg-gradient-to-b ${stat.gradient}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-[18px] w-[18px] ${stat.color}`} />
              </div>
              <span className={`flex items-center gap-0.5 text-[10px] font-medium ${stat.up ? 'text-success' : 'text-destructive'}`}>
                {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {stat.change}
              </span>
            </div>
            <div className="stat-value text-foreground">
              {stat.value}
              {stat.suffix && <span className="text-sm font-normal text-muted-foreground mr-1">{stat.suffix}</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Revenue Chart - spans 8 cols */}
        <div className="lg:col-span-8 clinic-card">
          <div className="flex items-center justify-between p-4 pb-0">
            <div>
              <h2 className="text-sm font-semibold text-foreground">نظرة مالية</h2>
              <p className="text-xs text-muted-foreground mt-0.5">إيرادات الأسبوع الحالي</p>
            </div>
            <div className="text-left">
              <p className="stat-value text-lg text-foreground">١٩٬٩٠٠ <span className="text-xs font-normal text-muted-foreground">ر.س</span></p>
              <p className="text-[10px] text-success flex items-center gap-0.5 justify-end">
                <TrendingUp className="h-3 w-3" /> +١٥٪ عن الأسبوع الماضي
              </p>
            </div>
          </div>
          <div className="h-[220px] p-4 pt-2" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(0, 0%, 100%)',
                    border: '1px solid hsl(214, 32%, 91%)',
                    borderRadius: '10px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} ر.س`, 'الإيراد']}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(217, 91%, 60%)" strokeWidth={2.5} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visit Types Pie Chart - spans 4 cols */}
        <div className="lg:col-span-4 clinic-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-1">أنواع الزيارات</h2>
          <p className="text-xs text-muted-foreground mb-3">هذا الشهر</p>
          <div className="h-[150px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visitTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
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
                    borderRadius: '10px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`${value}%`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {visitTypeData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] text-muted-foreground">{item.name}</span>
                <span className="text-[11px] font-semibold text-foreground mr-auto font-en">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Today's Schedule - Timeline */}
        <div className="lg:col-span-5 clinic-card">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">جدول اليوم</h2>
            </div>
            <Link to="/appointments" className="text-[10px] text-primary hover:underline font-medium">عرض الكل</Link>
          </div>
          <div className="p-3 space-y-1">
            {timeSlots.map((time) => {
              const apt = todayAppointments.find(a => a.time === time);
              return (
                <div key={time} className="flex items-stretch gap-3 min-h-[48px]">
                  <div className="w-12 text-[11px] font-en text-muted-foreground pt-1.5 text-center tabular-nums shrink-0">
                    {time}
                  </div>
                  <div className="w-px bg-border relative">
                    <div className={`absolute top-2 -right-[3px] w-[7px] h-[7px] rounded-full border-2 ${
                      apt
                        ? apt.status === 'in-progress'
                          ? 'bg-primary border-primary'
                          : apt.status === 'completed'
                          ? 'bg-success border-success'
                          : 'bg-card border-primary'
                        : 'bg-card border-border'
                    }`} />
                  </div>
                  {apt ? (
                    <div className={`flex-1 rounded-lg px-3 py-2 transition-colors ${
                      apt.status === 'in-progress'
                        ? 'bg-primary/[0.06] border border-primary/20'
                        : apt.status === 'completed'
                        ? 'bg-success/[0.06] border border-success/20'
                        : 'bg-muted/50 border border-transparent hover:border-border'
                    }`}>
                      <p className="text-sm font-medium text-foreground">{apt.patientName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{visitTypeLabels[apt.visitType]}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                          apt.status === 'in-progress' ? 'bg-primary/10 text-primary' :
                          apt.status === 'completed' ? 'bg-success/10 text-success' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {statusLabels[apt.status]}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 rounded-lg px-3 py-2 border border-dashed border-border/50">
                      <p className="text-[11px] text-muted-foreground/50">متاح</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Revenue Bar + Alerts + Recent Patients */}
        <div className="lg:col-span-7 space-y-4">
          {/* Monthly Bar Chart */}
          <div className="clinic-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-1">الإيرادات الشهرية</h2>
            <p className="text-xs text-muted-foreground mb-3">آخر ٦ أشهر</p>
            <div className="h-[160px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(214, 32%, 91%)',
                      borderRadius: '10px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} ر.س`, 'الإيراد']}
                  />
                  <Bar dataKey="revenue" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Alerts */}
            <div className="clinic-card p-4">
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-warning" />
                تنبيهات
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-warning/[0.04] border border-warning/10">
                  <AlertCircle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-medium text-foreground">مرضى متأخرون</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">٣ مرضى لم يعودوا منذ ٣+ أشهر</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-primary/[0.04] border border-primary/10">
                  <Clock className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-medium text-foreground">متابعات قادمة</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">٢ مواعيد متابعة هذا الأسبوع</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-accent/[0.04] border border-accent/10">
                  <ArrowLeftCircle className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-medium text-foreground">تقرير شهري</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">جاهز للمراجعة</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Patients */}
            <div className="clinic-card">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  آخر المرضى
                </h2>
                <Link to="/patients" className="text-[10px] text-primary hover:underline font-medium">عرض الكل</Link>
              </div>
              <div className="divide-y divide-border">
                {mockPatients.slice(0, 4).map((p) => (
                  <Link
                    key={p.id}
                    to={`/patients/${p.id}`}
                    className="p-2.5 flex items-center gap-2.5 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-[10px] font-bold text-primary">
                      {p.name.charAt(0)}{p.name.split(' ')[1]?.charAt(0) || ''}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium truncate">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground font-en">{p.phone}</p>
                    </div>
                    <span className="text-[9px] text-muted-foreground font-en">{p.lastVisit}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Services Stats */}
          <div className="clinic-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" />
              أكثر الخدمات طلباً
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {mockServices.slice(0, 3).map((service) => (
                <div key={service.id} className="text-center p-3 rounded-xl bg-muted/50">
                  <p className="text-lg font-bold text-foreground font-en">
                    {Math.floor(Math.random() * 30 + 10)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{service.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
