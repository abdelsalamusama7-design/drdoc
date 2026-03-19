import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Stethoscope, Users, CalendarCheck, BarChart3, Shield, Zap, Star,
  CheckCircle2, Brain, Clock, TrendingUp, Sparkles, Play, Send, Loader2,
  Smartphone, Tablet, Monitor, FileText, ListOrdered, Heart,
  DollarSign, Globe, ArrowLeft, ChevronDown, Phone, Mail,
  Award, Layers, Lock, Rocket, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";
import screenshotDashboard from "@/assets/screenshot-dashboard.jpg";
import problemSolutionImg from "@/assets/problem-solution.png";
import screenshotPatients from "@/assets/screenshot-patients.jpg";
import screenshotAppointments from "@/assets/screenshot-appointments.jpg";
import screenshotMobile from "@/assets/screenshot-mobile.png";
import PartnersSection from "@/components/PartnersSection";

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const fadeIn = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1, transition: { duration: 0.5 } } };

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1800;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const stats = [
  { value: 500, suffix: "+", label: "عيادة تستخدم النظام", icon: Stethoscope },
  { value: 50000, suffix: "+", label: "مريض مسجل", icon: Users },
  { value: 95, suffix: "%", label: "رضا المستخدمين", icon: Star },
  { value: 40, suffix: "%", label: "تقليل عدم الحضور", icon: TrendingUp },
];

const features = [
  { icon: Users, title: "إدارة المرضى", desc: "ملفات طبية كاملة لكل مريض تشمل التاريخ المرضي والأدوية والتحاليل.", gradient: "from-primary to-accent" },
  { icon: CalendarCheck, title: "إدارة المواعيد", desc: "حجز وتنظيم المواعيد مع تذكير تلقائي لتقليل الغياب.", gradient: "from-accent to-success" },
  { icon: FileText, title: "الوصفات الإلكترونية", desc: "كتابة الوصفات وربطها مباشرة بملف المريض بضغطة زر.", gradient: "from-success to-primary" },
  { icon: DollarSign, title: "الإدارة المالية", desc: "تتبع المدفوعات والمصروفات ومعرفة أرباح العيادة.", gradient: "from-warning to-destructive" },
  { icon: ListOrdered, title: "قائمة انتظار ذكية", desc: "تنظيم دخول المرضى وتقليل وقت الانتظار.", gradient: "from-primary to-accent" },
  { icon: BarChart3, title: "تقارير متقدمة", desc: "تقارير مفصلة عن أداء العيادة والإيرادات.", gradient: "from-accent to-success" },
  { icon: Globe, title: "بوابة المريض", desc: "يتابع المريض مواعيده ووصفاته ونتائج تحاليله.", gradient: "from-success to-primary" },
  { icon: Brain, title: "ذكاء اصطناعي", desc: "مساعد ذكي يساعد في البحث الطبي وتلخيص السجلات.", gradient: "from-warning to-destructive" },
];

const steps = [
  { step: "01", title: "سجّل عيادتك", desc: "أنشئ حسابك في دقيقة واحدة فقط", icon: Rocket },
  { step: "02", title: "أضف بياناتك", desc: "خدماتك وفريقك ومواعيدك", icon: Layers },
  { step: "03", title: "استقبل مرضاك", desc: "نظام حجز وتذكيرات ذكية", icon: CalendarCheck },
  { step: "04", title: "تابع أداءك", desc: "تقارير وتحليلات متقدمة", icon: TrendingUp },
];

const testimonials = [
  { name: "د. أحمد محمود", role: "طب أسنان — القاهرة", text: "النظام وفر لي 3 ساعات يومياً في إدارة العيادة وقلل عدم الحضور بشكل ملحوظ. أنصح به بشدة!", avatar: "أ" },
  { name: "د. سارة خليل", role: "جلدية — الإسكندرية", text: "أفضل نظام استخدمته. الذكاء الاصطناعي يساعدني في تلخيص الحالات بسرعة فائقة.", avatar: "س" },
  { name: "د. محمد عبدالله", role: "عظام — الرياض", text: "بعد استخدام النظام زادت إيرادات العيادة 30% بفضل إدارة المواعيد الذكية.", avatar: "م" },
  { name: "د. فاطمة حسن", role: "أطفال — جدة", text: "سهل الاستخدام جداً وفريق الدعم سريع في الاستجابة. النظام غيّر طريقة عمل عيادتي.", avatar: "ف" },
];

const faqs = [
  { q: "هل يمكنني تجربة النظام مجاناً؟", a: "نعم! نوفر فترة تجريبية مجانية لمدة 14 يوماً مع جميع المميزات بدون بطاقة ائتمان." },
  { q: "هل بياناتي آمنة؟", a: "نعم، نستخدم تشفير على مستوى البنوك مع نسخ احتياطية تلقائية وصلاحيات متعددة المستويات." },
  { q: "هل يمكنني استخدام النظام من الجوال؟", a: "بالتأكيد! النظام متوافق مع جميع الأجهزة مع تطبيق PWA يمكن تثبيته." },
  { q: "ماذا لو لم يعجبني النظام؟", a: "نوفر ضمان استرداد كامل خلال 30 يوماً بدون أي أسئلة." },
  { q: "هل النظام مناسب لتخصصي؟", a: "Smart Clinic مصمم لجميع التخصصات: أسنان، باطنة، جلدية، أطفال، مراكز طبية وغيرها." },
];

const clinicTypes = [
  "عيادات الأسنان", "عيادات الجلدية", "عيادات الأطفال",
  "عيادات الباطنة", "عيادات العظام", "عيادات النساء والتوليد",
  "عيادات العيون", "أمراض الذكورة والعقم", "المراكز الطبية",
];

const pricingPlans = [
  {
    name: "Starter", nameAr: "باقة البداية", price: "10,000", monthlyPrice: "2,000", popular: false,
    features: ["موقع إلكتروني احترافي", "نظام حجز مواعيد", "إدارة المرضى", "شات بوت أساسي", "لوحة تحكم"],
  },
  {
    name: "Professional", nameAr: "الباقة الاحترافية", price: "18,000", monthlyPrice: "3,000", popular: true,
    features: ["كل مميزات الباقة الأساسية", "نظام التذكير التلقائي", "تقارير تفصيلية", "إدارة الباقات والجلسات", "تحسين تجربة المستخدم"],
  },
  {
    name: "Premium", nameAr: "الباقة المتكاملة", price: "25,000", monthlyPrice: "4,000", popular: false,
    features: ["كل مميزات الباقة الاحترافية", "تخصيص كامل", "دعم فني مخصص", "تدريب الفريق", "API مخصص"],
  },
];

export default function LandingPage() {
  const { toast } = useToast();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ clinic_name: "", contact_name: "", phone: "", email: "", specialty: "", patient_count: "", message: "" });
  const [submitting, setSubmitting] = useState<string | null>(null);

  const submitForm = async (type: "contact" | "demo") => {
    const form = contactForm;
    if (!form.clinic_name || !form.contact_name || !form.phone) {
      toast({ title: "خطأ", description: "يرجى ملء الحقول المطلوبة", variant: "destructive" });
      return;
    }
    setSubmitting(type);
    try {
      await (supabase.from("demo_requests" as any) as any).insert({ ...form, request_type: type });
      toast({ title: "✅ تم الإرسال بنجاح", description: "سنتواصل معك قريباً" });
      setContactForm({ clinic_name: "", contact_name: "", phone: "", email: "", specialty: "", patient_count: "", message: "" });
    } catch {
      toast({ title: "خطأ", description: "حدث خطأ، حاول مرة أخرى", variant: "destructive" });
    }
    setSubmitting(null);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* ══════════ Navigation ══════════ */}
      <nav className="sticky top-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground leading-none">Smart Clinic</span>
              <span className="text-[10px] text-muted-foreground leading-none mt-0.5">نظام إدارة العيادات</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1 text-sm">
            {[
              { href: "#features", label: "المميزات" },
              { href: "#how-it-works", label: "كيف يعمل" },
              { href: "#pricing", label: "الأسعار" },
              { href: "#testimonials", label: "آراء العملاء" },
              { href: "#contact", label: "تواصل معنا" },
            ].map(link => (
              <a key={link.href} href={link.href} className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                تسجيل الدخول
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                ابدأ مجاناً
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════ Hero Section ══════════ */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/8 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 lg:pt-28 pb-8 relative">
          <motion.div initial="hidden" animate="show" variants={stagger} className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 border border-primary/20 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
              نظام إدارة العيادات #1 في المنطقة العربية
            </motion.div>

            {/* Main Heading */}
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-foreground leading-[1.15] mb-6 tracking-tight">
              أدِر عيادتك بكل{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-l from-primary via-accent to-primary bg-clip-text text-transparent">
                  احترافية وذكاء
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 8.5C50 2.5 100 2 150 5.5C200 9 250 4.5 298 7" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
                </svg>
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              نظام متكامل يجمع بين إدارة المرضى، المواعيد، الوصفات، والمالية — مدعوم بالذكاء الاصطناعي ويعمل على أي جهاز.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 flex-wrap mb-6">
              <Link to="/login">
                <Button size="lg" className="gap-2.5 text-base h-14 px-10 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Play className="h-4.5 w-4.5" />
                  سجّل وجرّب مجاناً — 14 يوم
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="gap-2.5 text-base h-14 px-10 hover:bg-muted/50 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Monitor className="h-4.5 w-4.5" />
                  استكشف الديمو التفاعلي
                </Button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-5 flex-wrap text-sm text-muted-foreground">
              {[
                { icon: Shield, text: "بدون بطاقة ائتمان" },
                { icon: Lock, text: "تشفير على مستوى البنوك" },
                { icon: Clock, text: "إعداد في أقل من دقيقة" },
              ].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <t.icon className="h-4 w-4 text-success" />
                  {t.text}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Screenshot with floating elements */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 max-w-5xl mx-auto relative"
          >
            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 z-10 bg-card rounded-xl border border-border shadow-xl p-3 hidden md:flex items-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-4.5 w-4.5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">الإيرادات اليوم</p>
                <p className="text-sm font-bold text-foreground font-en">+12,450 ج.م</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-4 -left-4 z-10 bg-card rounded-xl border border-border shadow-xl p-3 hidden md:flex items-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">مرضى جدد هذا الشهر</p>
                <p className="text-sm font-bold text-foreground font-en">+127 مريض</p>
              </div>
            </motion.div>

            {/* Main screenshot */}
            <div className="relative rounded-2xl overflow-hidden border border-border/60 shadow-2xl shadow-primary/10 bg-card">
              <div className="bg-muted/50 backdrop-blur-sm px-4 py-2.5 flex items-center gap-2 border-b border-border/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/50" />
                  <div className="w-3 h-3 rounded-full bg-warning/50" />
                  <div className="w-3 h-3 rounded-full bg-success/50" />
                </div>
                <div className="flex-1 max-w-xs mx-auto">
                  <div className="bg-background/80 rounded-md px-3 py-1 text-[10px] text-muted-foreground text-center font-mono">
                    app.smartclinic.com/dashboard
                  </div>
                </div>
              </div>
              <img src={problemSolutionImg} alt="المشكلة والحل - Smart Clinic" className="w-full" loading="eager" />
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex justify-center pb-8"
        >
          <ChevronDown className="h-6 w-6 text-muted-foreground/50" />
        </motion.div>
      </section>

      {/* ══════════ Stats Bar ══════════ */}
      <section className="border-y border-border bg-card/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 relative">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(s => (
              <motion.div key={s.label} variants={scaleIn} className="text-center group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform border border-primary/10">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-foreground font-en">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════ Problem → Solution ══════════ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Problem side */}
            <motion.div variants={fadeUp}>
              <span className="inline-block px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold mb-4">المشكلة</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 leading-tight">
                إدارة العيادة يدوياً تضيع وقتك وتكلفك مرضى
              </h2>
              <div className="space-y-3">
                {[
                  "فوضى في المواعيد ومرضى بينسوا مواعيدهم",
                  "ملفات المرضى ضايعة بين الورق والملفات",
                  "مفيش تتبع حقيقي للإيرادات والمصروفات",
                  "المريض مش عارف يتابع حالته أو نتائجه",
                  "وقت الانتظار طويل وبيأثر على رضا المرضى",
                ].map((problem, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-destructive text-xs">✕</span>
                    </div>
                    <span className="text-sm text-foreground">{problem}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Solution side */}
            <motion.div variants={fadeUp}>
              <span className="inline-block px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold mb-4">الحل</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 leading-tight">
                <span className="text-primary">Smart Clinic</span> يحوّل عيادتك لنظام رقمي ذكي
              </h2>
              <div className="space-y-3">
                {[
                  "تذكير تلقائي للمرضى وتقليل الغياب 40%",
                  "ملف إلكتروني متكامل لكل مريض بضغطة زر",
                  "تقارير مالية لحظية مع تتبع كل جنيه",
                  "بوابة مريض يتابع منها مواعيده ونتائجه",
                  "قائمة انتظار ذكية تقلل وقت الانتظار 60%",
                ].map((solution, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/10">
                    <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="h-3 w-3 text-success" />
                    </div>
                    <span className="text-sm text-foreground">{solution}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ Features Grid ══════════ */}
      <section id="features" className="py-20 sm:py-28 bg-muted/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              مميزات قوية
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-foreground mb-4">كل ما تحتاجه لإدارة عيادتك</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-lg mx-auto text-lg">أدوات متكاملة صُممت خصيصاً للعيادات والمراكز الطبية</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(f => (
              <motion.div key={f.title} variants={fadeUp} className="group relative bg-card rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
                {/* Gradient accent on hover */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`} style={{ background: `linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1))` }}>
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Feature Screenshots */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mt-16 grid md:grid-cols-2 gap-6">
            {[
              { img: screenshotPatients, label: "إدارة المرضى" },
              { img: screenshotAppointments, label: "إدارة المواعيد" },
            ].map(s => (
              <motion.div key={s.label} variants={fadeUp} className="relative rounded-2xl overflow-hidden border border-border/50 shadow-xl group hover:shadow-primary/10 transition-all hover:border-primary/20">
                <div className="bg-muted/50 backdrop-blur-sm px-3 py-2 flex items-center gap-2 border-b border-border/50">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-warning/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-success/50" />
                  </div>
                  <span className="text-[10px] text-muted-foreground mx-auto font-mono">{s.label}</span>
                </div>
                <img src={s.img} alt={s.label} className="w-full group-hover:scale-[1.02] transition-transform duration-500" loading="lazy" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════ Multi-Device Section ══════════ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp} className="flex justify-center">
              <img src={screenshotMobile} alt="Smart Clinic على الهاتف" className="max-h-[500px] object-contain drop-shadow-2xl" loading="lazy" />
            </motion.div>
            <motion.div variants={fadeUp} className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold border border-accent/20">
                <Smartphone className="h-3.5 w-3.5" />
                يعمل في كل مكان
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">اشتغل من أي مكان<br/>وعلى أي جهاز</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">سواء كنت في العيادة أو البيت أو حتى في إجازة — عيادتك معاك.</p>
              <div className="space-y-3">
                {[
                  { icon: Monitor, label: "كمبيوتر", desc: "لوحة تحكم متقدمة وتجربة كاملة" },
                  { icon: Tablet, label: "تابلت", desc: "مثالي أثناء الفحص داخل العيادة" },
                  { icon: Smartphone, label: "هاتف محمول", desc: "تطبيق PWA بدون تحميل من المتجر" },
                ].map(d => (
                  <div key={d.label} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <d.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{d.label}</h3>
                      <p className="text-sm text-muted-foreground">{d.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ How It Works ══════════ */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-foreground mb-4">ابدأ في 4 خطوات بسيطة</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg">من التسجيل للاستخدام الكامل في أقل من 5 دقائق</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div key={s.step} variants={fadeUp} className="relative text-center group">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -left-3 w-6 border-t-2 border-dashed border-primary/20" />
                )}
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform border border-primary/10 relative">
                  <s.icon className="h-8 w-8 text-primary" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg font-en">{s.step}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════ Clinic Types ══════════ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-foreground mb-4">مناسب لجميع التخصصات</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-10">مصمم ليناسب كل أنواع العيادات والمراكز الطبية</motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3">
              {clinicTypes.map(type => (
                <motion.div
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-default"
                >
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  <span className="text-sm font-semibold text-foreground">{type}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ Pricing ══════════ */}
      <section id="pricing" className="py-20 sm:py-28 bg-muted/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-foreground mb-4">خطط اشتراك مرنة</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg">اختر الخطة المناسبة لعيادتك — وابدأ بتجربة مجانية 14 يوم</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricingPlans.map(plan => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                className={`relative bg-card rounded-2xl border p-6 transition-all hover:shadow-xl ${
                  plan.popular
                    ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                    : "border-border hover:border-primary/20"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg">
                    الأكثر شعبية ⭐
                  </div>
                )}
                <div className="text-center mb-6 pt-2">
                  <h3 className="text-lg font-bold text-foreground mb-1">{plan.nameAr}</h3>
                  <p className="text-xs text-muted-foreground font-en">{plan.name}</p>
                  <div className="mt-4">
                    <div className="mb-1">
                      <span className="text-3xl font-extrabold text-foreground font-en">{plan.price}</span>
                      <span className="text-sm text-muted-foreground mr-1">ج.م</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-en font-semibold text-foreground">{plan.monthlyPrice}</span> ج.م / شهر
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      <span className="text-sm text-foreground">{f}</span>
                    </div>
                  ))}
                </div>
                <Link to="/login" className="block">
                  <Button className={`w-full ${plan.popular ? "shadow-lg shadow-primary/20" : ""}`} variant={plan.popular ? "default" : "outline"}>
                    ابدأ التجربة المجانية
                  </Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════ Testimonials ══════════ */}
      <section id="testimonials" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-warning/10 text-warning text-sm font-semibold mb-4 border border-warning/20">
              <Star className="h-3.5 w-3.5" />
              آراء عملائنا
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-foreground mb-4">ماذا يقول أطباؤنا؟</motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {testimonials.map(t => (
              <motion.div key={t.name} variants={fadeUp} className="bg-card rounded-2xl border border-border p-5 hover:border-primary/20 hover:shadow-lg transition-all">
                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════ FAQ ══════════ */}
      <section className="py-20 sm:py-28 bg-muted/30 border-y border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-foreground mb-4">أسئلة شائعة</motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/20 transition-colors">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-right"
                >
                  <span className="font-semibold text-foreground text-sm">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════ Contact Form ══════════ */}
      <section id="contact" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid lg:grid-cols-2 gap-12">
            {/* Info */}
            <motion.div variants={fadeUp} className="space-y-6">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">تواصل معنا</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">فريقنا جاهز لمساعدتك في اختيار الخطة المناسبة وترتيب عرض توضيحي مخصص لعيادتك.</p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Phone, label: "اتصل بنا", value: "+20 100 000 0000" },
                  { icon: Mail, label: "البريد الإلكتروني", value: "info@smartclinic.com" },
                  { icon: MessageCircle, label: "واتساب", value: "راسلنا على واتساب" },
                ].map(c => (
                  <div key={c.label} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <c.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{c.label}</p>
                      <p className="font-semibold text-foreground text-sm font-en" dir="ltr">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="font-bold text-foreground">ضمان الرضا 100%</span>
                </div>
                <p className="text-sm text-muted-foreground">إذا لم يعجبك النظام خلال 30 يوم — نرد لك فلوسك بالكامل بدون أي أسئلة.</p>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div variants={fadeUp} className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xl">
              <h3 className="text-xl font-bold text-foreground mb-6">اطلب عرض توضيحي مجاني</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm mb-1.5 block">اسم العيادة *</Label>
                    <Input value={contactForm.clinic_name} onChange={e => setContactForm(p => ({ ...p, clinic_name: e.target.value }))} placeholder="عيادة..." className="bg-muted/30" />
                  </div>
                  <div>
                    <Label className="text-sm mb-1.5 block">اسمك *</Label>
                    <Input value={contactForm.contact_name} onChange={e => setContactForm(p => ({ ...p, contact_name: e.target.value }))} placeholder="د. ..." className="bg-muted/30" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm mb-1.5 block">رقم الهاتف *</Label>
                    <Input value={contactForm.phone} onChange={e => setContactForm(p => ({ ...p, phone: e.target.value }))} placeholder="01xxxxxxxxx" className="bg-muted/30 font-en" dir="ltr" />
                  </div>
                  <div>
                    <Label className="text-sm mb-1.5 block">البريد الإلكتروني</Label>
                    <Input type="email" value={contactForm.email} onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" className="bg-muted/30 font-en" dir="ltr" />
                  </div>
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">التخصص</Label>
                  <Select value={contactForm.specialty} onValueChange={v => setContactForm(p => ({ ...p, specialty: v }))}>
                    <SelectTrigger className="bg-muted/30"><SelectValue placeholder="اختر التخصص" /></SelectTrigger>
                    <SelectContent>
                      {clinicTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">رسالة (اختياري)</Label>
                  <Textarea value={contactForm.message} onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))} placeholder="أخبرنا عن احتياجات عيادتك..." rows={3} className="bg-muted/30" />
                </div>
                <Button
                  className="w-full h-12 text-base shadow-lg shadow-primary/20 gap-2"
                  onClick={() => submitForm("demo")}
                  disabled={submitting === "demo"}
                >
                  {submitting === "demo" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  أرسل طلب العرض التوضيحي
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ Final CTA ══════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28 relative text-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 border border-white/20">
              <Heart className="h-8 w-8 text-white" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
              جاهز تبدأ رحلتك مع<br />Smart Clinic؟
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
              انضم لأكثر من 500 عيادة تستخدم النظام يومياً — وابدأ تجربتك المجانية الآن.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-3 h-14 px-10 text-lg font-bold shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                  <Zap className="h-5 w-5" />
                  سجّل الآن مجاناً
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 flex items-center justify-center gap-6 text-sm text-white/70 flex-wrap">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-white/80" />بدون بطاقة ائتمان</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-white/80" />14 يوم تجربة مجانية</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-white/80" />ضمان استرداد 30 يوم</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <PartnersSection />
      <Footer />
    </div>
  );
}
