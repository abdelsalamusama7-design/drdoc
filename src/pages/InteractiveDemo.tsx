import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users, CalendarCheck, FileText, DollarSign, BarChart3, Brain,
  ListOrdered, Bell, Stethoscope, Search, Plus, ChevronLeft, ChevronRight,
  Clock, CheckCircle2, XCircle, Phone, User, Activity, Pill, Printer,
  TrendingUp, ArrowLeft, Play, Eye, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Footer from "@/components/Footer";

/* ── Mock Data ── */
const mockPatients = [
  { id: 1, name: "أحمد محمد علي", phone: "01012345678", age: 35, gender: "ذكر", lastVisit: "2026-03-15", visits: 8, status: "نشط" },
  { id: 2, name: "فاطمة حسن", phone: "01098765432", age: 28, gender: "أنثى", lastVisit: "2026-03-18", visits: 3, status: "نشط" },
  { id: 3, name: "محمود السيد", phone: "01155667788", age: 45, gender: "ذكر", lastVisit: "2026-02-20", visits: 12, status: "متابعة" },
  { id: 4, name: "نور الدين", phone: "01234567890", age: 52, gender: "ذكر", lastVisit: "2026-03-10", visits: 5, status: "نشط" },
  { id: 5, name: "سارة أحمد", phone: "01567890123", age: 30, gender: "أنثى", lastVisit: "2026-01-05", visits: 2, status: "غير نشط" },
];

const mockAppointments = [
  { id: 1, patient: "أحمد محمد علي", time: "09:00", doctor: "د. محمد", status: "confirmed", type: "كشف" },
  { id: 2, patient: "فاطمة حسن", time: "09:30", doctor: "د. محمد", status: "waiting", type: "متابعة" },
  { id: 3, patient: "محمود السيد", time: "10:00", doctor: "د. سارة", status: "confirmed", type: "استشارة" },
  { id: 4, patient: "نور الدين", time: "10:30", doctor: "د. محمد", status: "cancelled", type: "كشف" },
  { id: 5, patient: "سارة أحمد", time: "11:00", doctor: "د. سارة", status: "confirmed", type: "إجراء" },
];

const mockQueue = [
  { num: 1, patient: "أحمد محمد علي", status: "with_doctor", waitTime: "0 دقيقة" },
  { num: 2, patient: "فاطمة حسن", status: "waiting", waitTime: "8 دقائق" },
  { num: 3, patient: "محمود السيد", status: "waiting", waitTime: "15 دقيقة" },
];

const demoFeatures = [
  { id: "dashboard", icon: BarChart3, label: "لوحة التحكم", color: "text-primary" },
  { id: "patients", icon: Users, label: "المرضى", color: "text-accent" },
  { id: "appointments", icon: CalendarCheck, label: "المواعيد", color: "text-success" },
  { id: "prescriptions", icon: Pill, label: "الوصفات", color: "text-accent" },
  { id: "queue", icon: ListOrdered, label: "قائمة الانتظار", color: "text-warning" },
  { id: "finance", icon: DollarSign, label: "المالية", color: "text-primary" },
  { id: "ai", icon: Brain, label: "المساعد الذكي", color: "text-accent" },
];

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  confirmed: { label: "مؤكد", variant: "default" },
  waiting: { label: "في الانتظار", variant: "secondary" },
  cancelled: { label: "ملغي", variant: "destructive" },
};

/* ── Sub-components ── */

function DemoDashboard() {
  const stats = [
    { label: "مرضى اليوم", value: "24", icon: Users, change: "+12%", color: "text-primary", bg: "bg-primary/10" },
    { label: "مواعيد اليوم", value: "18", icon: CalendarCheck, change: "+5%", color: "text-success", bg: "bg-success/10" },
    { label: "إيرادات اليوم", value: "12,500", icon: DollarSign, change: "+18%", color: "text-warning", bg: "bg-warning/10" },
    { label: "متوسط الانتظار", value: "8 د", icon: Clock, change: "-25%", color: "text-accent", bg: "bg-accent/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs font-mono">{s.change}</Badge>
                </div>
                <p className="text-2xl font-bold text-foreground font-mono">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              نشاط اليوم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { text: "تم تسجيل مريض جديد: سارة أحمد", time: "منذ 5 دقائق", icon: Plus },
              { text: "موعد مؤكد: أحمد محمد - 09:00", time: "منذ 15 دقيقة", icon: CheckCircle2 },
              { text: "وصفة طبية جديدة: محمود السيد", time: "منذ 30 دقيقة", icon: FileText },
              { text: "دفعة مستلمة: 500 ج.م", time: "منذ ساعة", icon: DollarSign },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <a.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              إحصائيات الأسبوع
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "المرضى الجدد", value: 32, max: 50, color: "bg-primary" },
              { label: "المواعيد المكتملة", value: 85, max: 100, color: "bg-success" },
              { label: "نسبة الحضور", value: 92, max: 100, color: "bg-accent" },
              { label: "رضا المرضى", value: 95, max: 100, color: "bg-warning" },
            ].map((s, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground">{s.label}</span>
                  <span className="text-sm font-mono font-semibold text-foreground">{s.value}{s.max === 100 ? "%" : ""}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.value / s.max) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.15 }}
                    className={`h-full ${s.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DemoPatients() {
  const [search, setSearch] = useState("");
  const filtered = mockPatients.filter(p => p.name.includes(search) || p.phone.includes(search));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن مريض بالاسم أو رقم الهاتف..."
            className="pr-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button size="sm" className="gap-1.5 shrink-0"><Plus className="h-4 w-4" />إضافة مريض</Button>
      </div>

      <Card className="border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-right p-3 font-medium text-muted-foreground">المريض</th>
                <th className="text-right p-3 font-medium text-muted-foreground">الهاتف</th>
                <th className="text-center p-3 font-medium text-muted-foreground">العمر</th>
                <th className="text-center p-3 font-medium text-muted-foreground">الزيارات</th>
                <th className="text-center p-3 font-medium text-muted-foreground">الحالة</th>
                <th className="text-center p-3 font-medium text-muted-foreground">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="hover:bg-muted/20">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.gender} • {p.age} سنة</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-muted-foreground text-xs">{p.phone}</td>
                  <td className="p-3 text-center text-foreground">{p.age}</td>
                  <td className="p-3 text-center font-mono text-foreground">{p.visits}</td>
                  <td className="p-3 text-center">
                    <Badge variant={p.status === "نشط" ? "default" : p.status === "متابعة" ? "secondary" : "outline"} className="text-xs">
                      {p.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-center">
                    <Button variant="ghost" size="sm" className="gap-1 text-xs"><Eye className="h-3.5 w-3.5" />عرض</Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function DemoAppointments() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
          <span className="text-sm font-semibold text-foreground">اليوم - 19 مارس 2026</span>
          <Button variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
        </div>
        <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />موعد جديد</Button>
      </div>

      <div className="grid gap-3">
        {mockAppointments.map((apt, i) => (
          <motion.div key={apt.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className={`border-border/50 overflow-hidden ${apt.status === "cancelled" ? "opacity-60" : ""}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="text-center shrink-0 w-16">
                  <p className="text-lg font-bold font-mono text-foreground">{apt.time}</p>
                  <p className="text-xs text-muted-foreground">{apt.type}</p>
                </div>
                <div className="h-10 w-px bg-border" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{apt.patient}</p>
                  <p className="text-xs text-muted-foreground">{apt.doctor}</p>
                </div>
                <Badge variant={statusMap[apt.status]?.variant || "secondary"}>
                  {statusMap[apt.status]?.label || apt.status}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DemoQueue() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "في الانتظار", value: "2", color: "text-warning", bg: "bg-warning/10" },
          { label: "مع الطبيب", value: "1", color: "text-primary", bg: "bg-primary/10" },
          { label: "مكتملة اليوم", value: "8", color: "text-success", bg: "bg-success/10" },
        ].map((s, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-4 text-center">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                <ListOrdered className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold font-mono text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {mockQueue.map((q, i) => (
          <motion.div key={q.num} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={`border-border/50 ${q.status === "with_doctor" ? "ring-2 ring-primary/30" : ""}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold font-mono ${q.status === "with_doctor" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                  {q.num}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{q.patient}</p>
                  <p className="text-xs text-muted-foreground">وقت الانتظار: {q.waitTime}</p>
                </div>
                <Badge variant={q.status === "with_doctor" ? "default" : "secondary"}>
                  {q.status === "with_doctor" ? "مع الطبيب" : "في الانتظار"}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DemoFinance() {
  const transactions = [
    { patient: "أحمد محمد", amount: 500, type: "كشف", method: "كاش", time: "09:30" },
    { patient: "فاطمة حسن", amount: 300, type: "متابعة", method: "فيزا", time: "10:00" },
    { patient: "محمود السيد", amount: 1200, type: "إجراء", method: "كاش", time: "10:45" },
    { patient: "نور الدين", amount: 500, type: "كشف", method: "كاش", time: "11:15" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "إيرادات اليوم", value: "2,500 ج.م", color: "text-success", bg: "bg-success/10" },
          { label: "إيرادات الشهر", value: "45,000 ج.م", color: "text-primary", bg: "bg-primary/10" },
          { label: "مصروفات الشهر", value: "12,000 ج.م", color: "text-destructive", bg: "bg-destructive/10" },
          { label: "صافي الربح", value: "33,000 ج.م", color: "text-warning", bg: "bg-warning/10" },
        ].map((s, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">معاملات اليوم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transactions.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.patient}</p>
                    <p className="text-xs text-muted-foreground">{t.type} • {t.method}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold font-mono text-success">+{t.amount} ج.م</p>
                  <p className="text-xs text-muted-foreground font-mono">{t.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DemoAI() {
  const [messages] = useState([
    { role: "user", text: "ما هي أعراض ارتفاع ضغط الدم؟" },
    { role: "ai", text: "أعراض ارتفاع ضغط الدم تشمل:\n\n• صداع شديد خاصة في مؤخرة الرأس\n• دوخة وعدم اتزان\n• ضيق في التنفس\n• نزيف من الأنف\n• تشوش في الرؤية\n• ألم في الصدر\n\nملاحظة: ارتفاع ضغط الدم يُعرف بـ\"القاتل الصامت\" لأنه قد لا يسبب أعراضاً واضحة في مراحله المبكرة." },
    { role: "user", text: "ما العلاج المقترح؟" },
    { role: "ai", text: "يعتمد العلاج على شدة الحالة:\n\n1. **تغيير نمط الحياة**: تقليل الملح، ممارسة الرياضة، إنقاص الوزن\n2. **أدوية شائعة**: مثبطات ACE، حاصرات بيتا، مدرات البول\n3. **متابعة دورية**: قياس الضغط بانتظام\n\n⚠️ هذه معلومات استرشادية. يجب مراجعة الطبيب المختص للتشخيص والعلاج المناسب." },
  ]);

  return (
    <div className="space-y-4">
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-accent" />
            المساعد الطبي الذكي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-80 overflow-y-auto mb-4">
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-line ${
                  m.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
                }`}>
                  {m.text}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="اسأل المساعد الذكي..." className="flex-1" disabled />
            <Button size="icon" disabled><Brain className="h-4 w-4" /></Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">هذا عرض توضيحي — في النسخة الكاملة يمكنك التفاعل مع المساعد الذكي</p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Main Demo Page ── */
export default function InteractiveDemo() {
  const [activeFeature, setActiveFeature] = useState("dashboard");

  const renderContent = () => {
    switch (activeFeature) {
      case "dashboard": return <DemoDashboard />;
      case "patients": return <DemoPatients />;
      case "appointments": return <DemoAppointments />;
      case "queue": return <DemoQueue />;
      case "finance": return <DemoFinance />;
      case "ai": return <DemoAI />;
      default: return <DemoDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/landing" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Stethoscope className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Instatech AI</h1>
                <p className="text-[10px] text-muted-foreground leading-none">عرض توضيحي تفاعلي</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 text-xs">
              <Play className="h-3 w-3" />
              وضع العرض
            </Badge>
            <Link to="/login">
              <Button size="sm">ابدأ الآن</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Demo hint banner */}
      <div className="bg-primary/5 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2 text-sm text-primary">
          <Eye className="h-4 w-4" />
          <span>هذا عرض توضيحي ببيانات تجريبية — اضغط على الأقسام لاستكشاف المميزات</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Feature tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {demoFeatures.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFeature(f.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeFeature === f.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card border border-border text-foreground hover:bg-muted/50"
              }`}
            >
              <f.icon className="h-4 w-4" />
              {f.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFeature}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="bg-card border-t border-border mt-12">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-3">أعجبك ما رأيت؟</h3>
          <p className="text-muted-foreground mb-6">ابدأ الآن واحصل على تجربة مجانية لمدة 14 يوم</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/login">
              <Button size="lg" className="gap-2">
                <Play className="h-5 w-5" />
                ابدأ التجربة المجانية
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="gap-2"
              onClick={() => window.open("https://wa.me/201554400044?text=" + encodeURIComponent("مرحباً، أريد الاشتراك في النظام"), "_blank")}>
              <MessageCircle className="h-5 w-5" />
              تواصل معنا
            </Button>
            <Link to="/pricing">
              <Button variant="outline" size="lg" className="gap-2">
                <DollarSign className="h-5 w-5" />
                الأسعار
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
