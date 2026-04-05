import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Stethoscope, Users, CalendarCheck, BarChart3, Shield, Zap, Star,
  CheckCircle2, Brain, Clock, TrendingUp, Sparkles, Play, Send, Loader2,
  Smartphone, Tablet, Monitor, FileText, ListOrdered, Heart,
  DollarSign, Globe, ChevronDown, Phone, Mail,
  Award, Layers, Lock, Rocket, MessageCircle, ArrowLeft
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
import DashboardGallery from "@/components/DashboardGallery";
import shotDashboard from "@/assets/shot-dashboard.png";
import shotRecords from "@/assets/shot-records.png";
import shotFinance from "@/assets/shot-finance.png";

/* ─── Animation Variants ─── */
const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] } } };
const fadeIn = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.6 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] } } };
const slideFromRight = { hidden: { opacity: 0, x: 60 }, show: { opacity: 1, x: 0, transition: { duration: 0.7 } } };
const slideFromLeft = { hidden: { opacity: 0, x: -60 }, show: { opacity: 1, x: 0, transition: { duration: 0.7 } } };

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
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

/* ─── Floating Particles ─── */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-primary/10 animate-float-slow"
          style={{
            width: `${20 + i * 15}px`,
            height: `${20 + i * 15}px`,
            left: `${10 + i * 15}%`,
            top: `${20 + i * 10}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${5 + i}s`,
          }}
        />
      ))}
      {[...Array(4)].map((_, i) => (
        <div
          key={`r-${i}`}
          className="absolute rounded-full bg-accent/8 animate-float-reverse"
          style={{
            width: `${30 + i * 20}px`,
            height: `${30 + i * 20}px`,
            right: `${5 + i * 12}%`,
            bottom: `${15 + i * 12}%`,
            animationDelay: `${i * 1.2}s`,
            animationDuration: `${6 + i}s`,
          }}
        />
      ))}
    </div>
  );
}

const stats = [
  { value: 500, suffix: "+", label: "عيادة تستخدم النظام", icon: Stethoscope, color: "primary" },
  { value: 50000, suffix: "+", label: "مريض مسجل", icon: Users, color: "accent" },
  { value: 95, suffix: "%", label: "رضا المستخدمين", icon: Star, color: "warning" },
  { value: 40, suffix: "%", label: "تقليل عدم الحضور", icon: TrendingUp, color: "success" },
];

const features = [
  { icon: Users, title: "إدارة المرضى", desc: "ملفات طبية كاملة لكل مريض تشمل التاريخ المرضي والأدوية والتحاليل.", color: "primary" },
  { icon: CalendarCheck, title: "إدارة المواعيد", desc: "حجز وتنظيم المواعيد مع تذكير تلقائي لتقليل الغياب.", color: "accent" },
  { icon: FileText, title: "الوصفات الإلكترونية", desc: "كتابة الوصفات وربطها مباشرة بملف المريض بضغطة زر.", color: "success" },
  { icon: DollarSign, title: "الإدارة المالية", desc: "تتبع المدفوعات والمصروفات ومعرفة أرباح العيادة.", color: "warning" },
  { icon: ListOrdered, title: "قائمة انتظار ذكية", desc: "تنظيم دخول المرضى وتقليل وقت الانتظار.", color: "primary" },
  { icon: BarChart3, title: "تقارير متقدمة", desc: "تقارير مفصلة عن أداء العيادة والإيرادات.", color: "accent" },
  { icon: Globe, title: "بوابة المريض", desc: "يتابع المريض مواعيده ووصفاته ونتائج تحاليله.", color: "success" },
  { icon: Brain, title: "ذكاء اصطناعي", desc: "مساعد ذكي يساعد في البحث الطبي وتلخيص السجلات.", color: "warning" },
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
  { q: "هل يمكنني تجربة النظام مجاناً؟", a: "نعم! نوفر تجربة مجانية مع جميع المميزات بدون بطاقة ائتمان." },
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
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const submitForm = async (type: "contact" | "demo") => {
    const form = contactForm;
    if (!form.clinic_name || !form.contact_name || !form.phone) {
      toast({ title: "خطأ", description: "يرجى ملء الحقول المطلوبة", variant: "destructive" });
      return;
    }
    setSubmitting(type);
    try {
      await (supabase.from("demo_requests" as any) as any).insert({ ...form, request_type: type });
      supabase.functions.invoke("notify-demo-request", {
        body: { ...form, request_type: type },
      }).catch(() => {});
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
      <nav className="sticky top-0 z-50 bg-background/40 backdrop-blur-2xl border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow"
            >
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </motion.div>
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
              <a key={link.href} href={link.href} className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all relative group">
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full group-hover:w-2/3 transition-all duration-300" />
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
              <Button size="sm" className="shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all gap-1.5 animate-gradient-shift bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] border-0">
                <Zap className="h-3.5 w-3.5" />
                ابدأ مجاناً
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════ Hero Section ══════════ */}
      <section ref={heroRef} className="relative overflow-hidden min-h-[90vh] flex items-center">
        <FloatingParticles />
        
        {/* Animated Background Blobs */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background" />
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/6 rounded-full blur-[100px] animate-morph" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent/6 rounded-full blur-[80px] animate-morph" style={{ animationDelay: '4s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-success/3 rounded-full blur-[120px] animate-morph" style={{ animationDelay: '2s' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,black,transparent)]" />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-7xl mx-auto px-4 sm:px-6 py-16 relative w-full">
          <motion.div initial="hidden" animate="show" variants={stagger} className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-primary text-sm font-semibold mb-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
              </span>
              نظام إدارة العيادات #1 في المنطقة العربية
            </motion.div>

            {/* Main Heading */}
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.1] mb-7 tracking-tight">
              أدِر عيادتك بكل{" "}
              <span className="relative inline-block">
                <motion.span
                  className="bg-gradient-to-l from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-shift"
                >
                  احترافية وذكاء
                </motion.span>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-accent/60 to-primary/40 rounded-full origin-right"
                />
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              نظام متكامل يجمع بين إدارة المرضى، المواعيد، الوصفات، والمالية — مدعوم بالذكاء الاصطناعي ويعمل على أي جهاز.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 flex-wrap mb-8">
              <Link to="/login">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" className="gap-2.5 text-base h-14 px-10 shadow-xl shadow-primary/30 transition-shadow hover:shadow-primary/50 relative overflow-hidden group">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <Play className="h-4.5 w-4.5" />
                    سجّل وجرّب مجاناً
                  </Button>
                </motion.div>
              </Link>
              <Link to="/login">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="outline" size="lg" className="gap-2.5 text-base h-14 px-10 glass-card hover:bg-primary/5 transition-all">
                    <Monitor className="h-4.5 w-4.5" />
                    استكشف الديمو التفاعلي
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-5 flex-wrap text-sm text-muted-foreground">
              {[
                { icon: Shield, text: "بدون بطاقة ائتمان" },
                { icon: Lock, text: "تشفير على مستوى البنوك" },
                { icon: Clock, text: "إعداد في أقل من دقيقة" },
              ].map((t, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + i * 0.15 }}
                  className="flex items-center gap-1.5"
                >
                  <t.icon className="h-4 w-4 text-success" />
                  {t.text}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 80, rotateX: 15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
            className="mt-16 max-w-5xl mx-auto relative perspective-1000"
          >
            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 z-10 glass-card rounded-2xl shadow-2xl p-3.5 hidden md:flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">الإيرادات اليوم</p>
                <p className="text-base font-bold text-foreground font-en">+12,450 ج.م</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-6 -left-6 z-10 glass-card rounded-2xl shadow-2xl p-3.5 hidden md:flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">مرضى جدد هذا الشهر</p>
                <p className="text-base font-bold text-foreground font-en">+127 مريض</p>
              </div>
            </motion.div>

            {/* Orbiting element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 hidden lg:block">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute"
                style={{ width: 240, height: 240, marginLeft: -120, marginTop: -120 }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
              </motion.div>
            </div>

            {/* Main screenshot */}
            <div className="relative rounded-2xl overflow-hidden border border-border/40 shadow-2xl shadow-primary/15 bg-card group">
              <div className="bg-muted/30 backdrop-blur-sm px-4 py-2.5 flex items-center gap-2 border-b border-border/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 max-w-xs mx-auto">
                  <div className="bg-background/60 rounded-md px-3 py-1 text-[10px] text-muted-foreground text-center font-mono">
                    app.smartclinic.com/dashboard
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden">
                <img src={problemSolutionImg} alt="المشكلة والحل - Smart Clinic" className="w-full group-hover:scale-[1.01] transition-transform duration-700" loading="eager" />
                <div className="absolute inset-0 bg-gradient-to-t from-card/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-7 h-11 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1.5">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </section>

      {/* ══════════ Stats Bar ══════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 animate-gradient-shift bg-[length:200%_100%]" />
        <div className="absolute inset-0 border-y border-border/50" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 relative">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(s => (
              <motion.div key={s.label} variants={scaleIn} className="text-center group">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  className={`w-16 h-16 rounded-2xl bg-${s.color}/10 flex items-center justify-center mx-auto mb-3 border border-${s.color}/15 shadow-lg shadow-${s.color}/5`}
                  style={{ background: `linear-gradient(135deg, hsl(var(--${s.color}) / 0.1), hsl(var(--${s.color}) / 0.05))` }}
                >
                  <s.icon className={`h-7 w-7 text-${s.color}`} />
                </motion.div>
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
      <section className="py-20 sm:py-28 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Problem side */}
            <motion.div variants={slideFromRight}>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-semibold mb-5 border border-destructive/20"
              >
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                المشكلة
              </motion.span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 leading-tight">
                إدارة العيادة يدوياً تضيع وقتك وتكلفك مرضى
              </h2>
              <div className="space-y-2.5">
                {[
                  "فوضى في المواعيد ومرضى بينسوا مواعيدهم",
                  "ملفات المرضى ضايعة بين الورق والملفات",
                  "مفيش تتبع حقيقي للإيرادات والمصروفات",
                  "المريض مش عارف يتابع حالته أو نتائجه",
                  "وقت الانتظار طويل وبيأثر على رضا المرضى",
                  "الروشتات بخط اليد والصيدلية مش بتفهمها",
                  "مفيش تنبيهات لحساسية الأدوية أو التعارضات",
                  "صعب تعرف أداء كل دكتور أو نسبة رجوع المرضى",
                ].map((problem, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/10 hover:bg-destructive/8 transition-colors group"
                  >
                    <div className="w-5 h-5 rounded-full bg-destructive/15 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      <span className="text-destructive text-xs font-bold">✕</span>
                    </div>
                    <span className="text-sm text-foreground">{problem}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Solution side */}
            <motion.div variants={slideFromLeft}>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-success/10 text-success text-xs font-semibold mb-5 border border-success/20"
              >
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                الحل
              </motion.span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 leading-tight">
                <span className="text-primary">Smart Clinic</span> يحوّل عيادتك لنظام رقمي ذكي
              </h2>
              <div className="space-y-2.5">
                {[
                  "تذكير تلقائي للمرضى وتقليل الغياب 40%",
                  "ملف إلكتروني متكامل لكل مريض بضغطة زر",
                  "تقارير مالية لحظية مع تتبع كل جنيه",
                  "بوابة مريض يتابع منها مواعيده ونتائجه",
                  "قائمة انتظار ذكية تقلل وقت الانتظار 60%",
                  "روشتات إلكترونية واضحة ومنظمة بالأدوية والجرعات",
                  "تنبيهات ذكية لحساسية الأدوية والتاريخ المرضي",
                  "تقارير أداء الأطباء ونسب الاحتفاظ بالمرضى",
                ].map((solution, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-success/5 border border-success/10 hover:bg-success/8 transition-colors group"
                  >
                    <div className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="h-3 w-3 text-success" />
                    </div>
                    <span className="text-sm text-foreground">{solution}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <PartnersSection />
      <DashboardGallery />

      {/* ══════════ Features Grid ══════════ */}
      <section id="features" className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-muted/20" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-card text-primary text-sm font-semibold mb-5">
              <Sparkles className="h-4 w-4" />
              مميزات قوية
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-extrabold text-foreground mb-5">كل ما تحتاجه لإدارة عيادتك</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-lg mx-auto text-lg">أدوات متكاملة صُممت خصيصاً للعيادات والمراكز الطبية</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, idx) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Top gradient line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Glow effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg"
                  style={{ background: `linear-gradient(135deg, hsl(var(--${f.color}) / 0.15), hsl(var(--${f.color}) / 0.05))` }}
                >
                  <f.icon className={`h-7 w-7 text-${f.color}`} />
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
              <motion.div key={s.label} variants={fadeUp} whileHover={{ y: -5 }} className="relative rounded-2xl overflow-hidden border border-border/40 shadow-xl group hover:shadow-primary/10 transition-all">
                <div className="bg-muted/30 backdrop-blur-sm px-3 py-2 flex items-center gap-2 border-b border-border/30">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
                  </div>
                  <span className="text-[10px] text-muted-foreground mx-auto font-mono">{s.label}</span>
                </div>
                <img src={s.img} alt={s.label} className="w-full group-hover:scale-[1.03] transition-transform duration-700" loading="lazy" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════ Detailed Features ══════════ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-28">

          {/* Section Intro */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-card text-primary text-sm font-semibold mb-5">
              <Layers className="h-4 w-4" />
              برنامج متكامل لإدارة العيادات والمراكز الطبية
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-extrabold text-foreground mb-5">
              نظام احترافي شامل لكل احتياجات عيادتك
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
              يساعد الأطباء على تنظيم العمل داخل العيادة بسهولة، وإدارة المرضى والمواعيد والسجلات الطبية والفواتير بشكل سريع وآمن.
            </motion.p>
          </motion.div>

          {/* ── إدارة المرضى ── */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div variants={slideFromRight}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 border border-primary/20">
                <Users className="h-4 w-4" />
                إدارة المرضى
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">إدارة بيانات المرضى بشكل منظم وسريع</h3>
              <p className="text-muted-foreground mb-6">نظام شامل لتسجيل وإدارة جميع بيانات المرضى مع إمكانية البحث والتصفية المتقدمة.</p>
              <div className="relative rounded-2xl overflow-hidden border border-border/40 shadow-xl group">
                <img src={shotDashboard} alt="لوحة تحكم Smart Clinic" className="w-full group-hover:scale-[1.02] transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-card/30 to-transparent" />
              </div>
            </motion.div>
            <motion.div variants={slideFromLeft} className="space-y-2.5">
              {[
                "تسجيل بيانات المريض الكاملة",
                "البحث عن المريض بالاسم أو الكود أو رقم الهاتف",
                "عرض وتعديل بيانات المريض بسهولة",
                "عرض الملف الطبي الكامل للمريض",
                "احتساب العمر تلقائياً عند تحديد تاريخ الميلاد والعكس",
                "فتح شات واتساب مع رقم هاتف المريض",
                "التحكم في بيانات المريض المطلوبة وتخصيصها",
                "عرض بيانات المرضى وعمل فلتر عليها",
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl glass-card hover:border-primary/30 transition-all group"
                >
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── إدارة المواعيد ── */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div variants={slideFromRight} className="order-2 lg:order-1 space-y-2.5">
              {[
                "حجز موعد للمريض في نفس اليوم أو في يوم لاحق",
                "تعديل أو تغيير مواعيد الحجز بسهولة",
                "إدارة مواعيد أكثر من طبيب في وقت واحد",
                "تحديد نوع الخدمة المقدمة للمريض",
                "تحصيل ثمن الحجز بأكثر من طريقة دفع",
                "طباعة فاتورة بالحجز والخدمات المقدمة",
                "إمكانية ترك مبلغ آجل وتحصيله لاحقاً",
                "تقسيط المبلغ مع إشعارات بمواعيد الدفع",
                "التحكم بفترة ظهور إشعارات الأقساط",
                "طباعة تقرير بالحجوزات",
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl glass-card hover:border-accent/30 transition-all group"
                >
                  <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <span className="text-sm text-foreground">{item}</span>
                </motion.div>
              ))}
            </motion.div>
            <motion.div variants={slideFromLeft} className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4 border border-accent/20">
                <CalendarCheck className="h-4 w-4" />
                إدارة المواعيد
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">نظام متكامل لتنظيم مواعيد العيادة</h3>
              <p className="text-muted-foreground mb-6">تنظيم حجوزات المرضى مع دعم أكثر من طبيب وطرق دفع متعددة وإشعارات تلقائية.</p>
            </motion.div>
          </motion.div>

          {/* ── الإيرادات والمصروفات ── */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div variants={slideFromRight}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-warning/10 text-warning text-sm font-semibold mb-4 border border-warning/20">
                <DollarSign className="h-4 w-4" />
                إدارة الإيرادات والمصروفات
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">متابعة الجوانب المالية للعيادة</h3>
              <p className="text-muted-foreground mb-6">نظام مالي متكامل لتتبع كل جنيه يدخل أو يخرج من العيادة.</p>
              <div className="relative rounded-2xl overflow-hidden border border-border/40 shadow-xl group">
                <img src={shotFinance} alt="إدارة الإيرادات - Smart Clinic" className="w-full group-hover:scale-[1.02] transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-card/30 to-transparent" />
              </div>
            </motion.div>
            <motion.div variants={slideFromLeft} className="space-y-2.5">
              {[
                "تسجيل رسوم الخدمات المقدمة",
                "إصدار الفواتير بشكل احترافي",
                "تسجيل المصروفات وتوزيع قيمتها على الأطباء",
                "طباعة كشف حساب لكل طبيب",
                "تقارير الإيرادات لأي فترة زمنية",
                "تقارير المصروفات لأي فترة زمنية",
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl glass-card hover:border-warning/30 transition-all group"
                >
                  <div className="w-6 h-6 rounded-lg bg-warning/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-3.5 w-3.5 text-warning" />
                  </div>
                  <span className="text-sm text-foreground">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── السجل الطبي ── */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div variants={slideFromRight} className="order-2 lg:order-1 space-y-2.5">
              {[
                "عرض جميع الزيارات السابقة بالتفصيل",
                "تسجيل تشخيص المريض مع البحث السريع (Auto Complete)",
                "إضافة التحاليل والفحوصات الطبية",
                "إضافة الأدوية من قاعدة بيانات الأدوية الشاملة",
                "إنشاء مجموعات أدوية جاهزة (مثل أدوية مرضى السكر)",
                "إنشاء مجموعات تحاليل وفحوصات جاهزة للإضافة السريعة",
                "إضافة ملاحظات خاصة بكل زيارة",
                "إرفاق صور الأشعة أو التحاليل مع ملف المريض",
                "إضافة تقرير طبي مع إمكانية نسخ تقرير سابق والتعديل عليه",
                "حفظ تلقائي لجميع البيانات في السجل الطبي عند انتهاء الزيارة",
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl glass-card hover:border-primary/30 transition-all group"
                >
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{item}</span>
                </motion.div>
              ))}
            </motion.div>
            <motion.div variants={slideFromLeft} className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 border border-primary/20">
                <Heart className="h-4 w-4" />
                السجل الطبي للمريض
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">سجل طبي كامل ومتكامل لكل مريض</h3>
              <p className="text-muted-foreground mb-6">كل معلومات المريض في مكان واحد — التشخيصات، الأدوية، التحاليل، الصور، والتقارير الطبية.</p>
              <div className="relative rounded-2xl overflow-hidden border border-border/40 shadow-xl group">
                <img src={shotRecords} alt="السجل الطبي للمريض - Smart Clinic" className="w-full group-hover:scale-[1.02] transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-card/30 to-transparent" />
              </div>
            </motion.div>
          </motion.div>

          {/* ── طباعة الروشتة ── */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-card to-accent/8" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.05),transparent_60%)]" />
            <div className="relative border border-border/40 rounded-3xl p-8 sm:p-10">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                <motion.div variants={fadeUp}>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4 border border-accent/20">
                    <FileText className="h-4 w-4" />
                    طباعة الروشتة والتقارير الطبية
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">طباعة احترافية بتصميم مخصص</h3>
                  <p className="text-muted-foreground mb-6">لكل طبيب تصميمه الخاص للروشتة والتقرير الطبي مع خيارات طباعة مرنة.</p>
                  <div className="space-y-2.5">
                    {[
                      "تصميم مخصص لكل طبيب للروشتة والتقرير الطبي",
                      "طباعة روشتة الأدوية بشكل واضح ومنظم",
                      "طباعة طلبات التحاليل والفحوصات",
                      "طباعة التقارير الطبية",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 group">
                        <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
                <motion.div variants={fadeUp}>
                  <div className="glass-card rounded-2xl p-6 space-y-4">
                    <h4 className="font-bold text-foreground flex items-center gap-2">
                      <span className="text-lg">🖨️</span> طرق الطباعة
                    </h4>
                    <div className="space-y-3">
                      <motion.div whileHover={{ x: -5 }} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">ورق أبيض بتصميم خاص</p>
                          <p className="text-xs text-muted-foreground">طباعة بتصميم مخصص لكل طبيب على ورق عادي</p>
                        </div>
                      </motion.div>
                      <motion.div whileHover={{ x: -5 }} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">دفاتر الروشتات المطبوعة</p>
                          <p className="text-xs text-muted-foreground">طباعة مباشرة على ورق من الدفاتر المطبوعة الجاهزة</p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* ── نظام عيادات الأسنان ── */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-success/10 text-success text-sm font-semibold mb-4 border border-success/20">
                <Stethoscope className="h-4 w-4" />
                نظام خاص لعيادات الأسنان
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">إصدار متخصص لعيادات ومراكز الأسنان</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">يحتوي على أدوات متقدمة مصممة خصيصاً لأطباء الأسنان مع رسم بياني للأسنان ومتابعة الإجراءات.</p>
            </div>
            <motion.div variants={fadeUp} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: "🦷", title: "Dental Chart", desc: "رسم بياني كامل لأسنان البالغين" },
                { icon: "👶", title: "Pedo Chart", desc: "رسم بياني لأسنان الأطفال" },
                { icon: "💰", title: "تعريف الخدمات والأسعار", desc: "تعريف خدمات الأسنان وعناصرها وأسعارها" },
                { icon: "✅", title: "تسجيل الإجراءات المنفذة", desc: "تسجيل ومتابعة الإجراءات التي تم تنفيذها" },
                { icon: "📋", title: "الإجراءات المتبقية", desc: "متابعة الإجراءات المتبقية للزيارات القادمة" },
                { icon: "📱", title: "ربط تطبيق الموبايل", desc: "حفظ صور الأشعة من الموبايل تلقائياً" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="flex items-start gap-4 p-5 rounded-2xl glass-card hover:border-success/30 hover:shadow-lg transition-all"
                >
                  <div className="text-3xl shrink-0">{item.icon}</div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Banner ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent animate-gradient-shift bg-[length:200%_200%]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
            {/* Floating shapes */}
            <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-white/5 animate-float-slow" />
            <div className="absolute bottom-10 left-20 w-16 h-16 rounded-full bg-white/5 animate-float-reverse" />
            
            <div className="relative p-10 sm:p-16 text-center">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-primary-foreground mb-4">
                🏥 نظام شامل لكل التخصصات
              </h3>
              <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8">
                أسنان · باطنة · جلدية · أطفال · عظام · نساء وتوليد · عيون · ذكورة · مراكز طبية متكاملة
              </p>
              <Link to="/login">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="inline-block">
                  <Button size="lg" variant="secondary" className="gap-2 text-base h-14 px-10 shadow-2xl transition-all">
                    <Zap className="h-4.5 w-4.5" />
                    ابدأ تجربتك المجانية الآن
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ Multi-Device ══════════ */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px] -translate-y-1/2" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={slideFromRight} className="flex justify-center">
              <motion.img
                whileHover={{ rotateY: 10, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200 }}
                src={screenshotMobile}
                alt="Smart Clinic على الهاتف"
                className="max-h-[500px] object-contain drop-shadow-2xl"
                loading="lazy"
              />
            </motion.div>
            <motion.div variants={slideFromLeft} className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold border border-accent/20">
                <Smartphone className="h-3.5 w-3.5" />
                يعمل في كل مكان
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight">اشتغل من أي مكان<br/>وعلى أي جهاز</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">سواء كنت في العيادة أو البيت أو حتى في إجازة — عيادتك معاك.</p>
              <div className="space-y-3">
                {[
                  { icon: Monitor, label: "كمبيوتر", desc: "لوحة تحكم متقدمة وتجربة كاملة" },
                  { icon: Tablet, label: "تابلت", desc: "مثالي أثناء الفحص داخل العيادة" },
                  { icon: Smartphone, label: "هاتف محمول", desc: "تطبيق PWA بدون تحميل من المتجر" },
                ].map((d, i) => (
                  <motion.div
                    key={d.label}
                    whileHover={{ x: -8 }}
                    className="flex items-center gap-4 p-4 rounded-xl glass-card hover:border-primary/30 transition-all group cursor-default"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all">
                      <d.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{d.label}</h3>
                      <p className="text-sm text-muted-foreground">{d.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ How It Works ══════════ */}
      <section id="how-it-works" className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-muted/20" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-extrabold text-foreground mb-4">ابدأ في 4 خطوات بسيطة</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg">من التسجيل للاستخدام الكامل في أقل من 5 دقائق</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                variants={fadeUp}
                whileHover={{ y: -10 }}
                className="relative text-center group"
              >
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -left-3 w-6 border-t-2 border-dashed border-primary/20" />
                )}
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-primary/15 relative shadow-lg"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1))' }}
                >
                  <s.icon className="h-8 w-8 text-primary" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg font-en">{s.step}</span>
                </motion.div>
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
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-extrabold text-foreground mb-4">مناسب لجميع التخصصات</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-10">مصمم ليناسب كل أنواع العيادات والمراكز الطبية</motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3">
              {clinicTypes.map((type, i) => (
                <motion.div
                  key={type}
                  whileHover={{ scale: 1.08, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl glass-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-default"
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
      <section id="pricing" className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-muted/20" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-extrabold text-foreground mb-4">خطط اشتراك مرنة</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg">اختر الخطة المناسبة لعيادتك — وابدأ بتجربة مجانية</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                whileHover={{ y: -10 }}
                className={`relative glass-card rounded-2xl p-6 transition-all hover:shadow-2xl ${
                  plan.popular
                    ? "border-primary shadow-xl shadow-primary/15 scale-[1.03] z-10"
                    : "hover:border-primary/20"
                }`}
              >
                {plan.popular && (
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold shadow-lg"
                  >
                    الأكثر شعبية ⭐
                  </motion.div>
                )}
                {/* Glow for popular */}
                {plan.popular && (
                  <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/20 to-accent/20 -z-10 blur-sm" />
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
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button className={`w-full ${plan.popular ? "shadow-lg shadow-primary/25" : ""}`} variant={plan.popular ? "default" : "outline"}>
                      ابدأ التجربة المجانية
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════ Testimonials ══════════ */}
      <section id="testimonials" className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-warning/5 rounded-full blur-[100px]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-card text-warning text-sm font-semibold mb-5">
              <Star className="h-4 w-4 fill-warning" />
              آراء عملائنا
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-extrabold text-foreground mb-4">ماذا يقول أطباؤنا؟</motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                className="glass-card rounded-2xl p-5 hover:border-warning/20 hover:shadow-xl transition-all relative group"
              >
                {/* Quote mark */}
                <div className="absolute top-3 left-3 text-4xl text-primary/10 font-serif leading-none">"</div>
                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4 relative z-10">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-3 border-t border-border/30">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg"
                  >
                    {t.avatar}
                  </motion.div>
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
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-muted/20" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-extrabold text-foreground mb-4">أسئلة شائعة</motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="glass-card rounded-xl overflow-hidden hover:border-primary/20 transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-right group"
                >
                  <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  </motion.div>
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
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
            <motion.div variants={slideFromRight} className="space-y-6">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">تواصل معنا</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">فريقنا جاهز لمساعدتك في اختيار الخطة المناسبة وترتيب عرض توضيحي مخصص لعيادتك.</p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Phone, label: "المبيعات", value: "01554400044", href: "tel:+201554400044" },
                  { icon: Phone, label: "الدعم الفني", value: "01227080430", href: "tel:+201227080430" },
                  { icon: Mail, label: "البريد الإلكتروني", value: "info@smartclinic.com", href: "mailto:info@smartclinic.com" },
                  { icon: MessageCircle, label: "واتساب", value: "راسلنا على واتساب", href: "https://wa.me/201554400044" },
                ].map(c => (
                  <motion.a
                    key={c.label}
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    whileHover={{ x: -5 }}
                    className="flex items-center gap-4 p-4 rounded-xl glass-card hover:border-primary/30 transition-all"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <c.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{c.label}</p>
                      <p className="font-semibold text-foreground text-sm font-en" dir="ltr">{c.value}</p>
                    </div>
                  </motion.a>
                ))}
              </div>

              <div className="p-5 rounded-xl glass-card border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl" />
                <div className="flex items-center gap-3 mb-2 relative">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="font-bold text-foreground">ضمان الرضا 100%</span>
                </div>
                <p className="text-sm text-muted-foreground relative">إذا لم يعجبك النظام خلال 30 يوم — نرد لك فلوسك بالكامل بدون أي أسئلة.</p>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div variants={slideFromLeft} className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
              <h3 className="text-xl font-bold text-foreground mb-6">اطلب عرض توضيحي مجاني</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm mb-1.5 block">اسم العيادة *</Label>
                    <Input value={contactForm.clinic_name} onChange={e => setContactForm(p => ({ ...p, clinic_name: e.target.value }))} placeholder="عيادة..." className="bg-muted/20 border-border/50 focus:border-primary/50" />
                  </div>
                  <div>
                    <Label className="text-sm mb-1.5 block">اسمك *</Label>
                    <Input value={contactForm.contact_name} onChange={e => setContactForm(p => ({ ...p, contact_name: e.target.value }))} placeholder="د. ..." className="bg-muted/20 border-border/50 focus:border-primary/50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm mb-1.5 block">رقم الهاتف *</Label>
                    <Input value={contactForm.phone} onChange={e => setContactForm(p => ({ ...p, phone: e.target.value }))} placeholder="01xxxxxxxxx" className="bg-muted/20 border-border/50 focus:border-primary/50 font-en" dir="ltr" />
                  </div>
                  <div>
                    <Label className="text-sm mb-1.5 block">البريد الإلكتروني</Label>
                    <Input type="email" value={contactForm.email} onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" className="bg-muted/20 border-border/50 focus:border-primary/50 font-en" dir="ltr" />
                  </div>
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">التخصص</Label>
                  <Select value={contactForm.specialty} onValueChange={v => setContactForm(p => ({ ...p, specialty: v }))}>
                    <SelectTrigger className="bg-muted/20 border-border/50"><SelectValue placeholder="اختر التخصص" /></SelectTrigger>
                    <SelectContent>
                      {clinicTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">رسالة (اختياري)</Label>
                  <Textarea value={contactForm.message} onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))} placeholder="أخبرنا عن احتياجات عيادتك..." rows={3} className="bg-muted/20 border-border/50 focus:border-primary/50" />
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="w-full h-12 text-base shadow-lg shadow-primary/25 gap-2 relative overflow-hidden group"
                    onClick={() => submitForm("demo")}
                    disabled={submitting === "demo"}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    {submitting === "demo" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    أرسل طلب العرض التوضيحي
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ Final CTA ══════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent animate-gradient-shift bg-[length:200%_200%]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        {/* Floating shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-white/5 animate-float-slow" />
        <div className="absolute bottom-16 left-16 w-24 h-24 rounded-full bg-white/5 animate-float-reverse" />
        <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-white/3 animate-morph" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-32 relative text-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={scaleIn} className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-2xl">
              <Heart className="h-10 w-10 text-white" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
              جاهز تبدأ رحلتك مع<br />Smart Clinic؟
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
              انضم لأكثر من 500 عيادة تستخدم النظام يومياً — وابدأ تجربتك المجانية الآن.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link to="/login">
                <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }} className="inline-block">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-3 h-14 px-10 text-lg font-bold shadow-2xl relative overflow-hidden group">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <Zap className="h-5 w-5" />
                    سجّل الآن مجاناً
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 flex items-center justify-center gap-6 text-sm text-white/70 flex-wrap">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-white/80" />بدون بطاقة ائتمان</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-white/80" />تجربة مجانية</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-white/80" />ضمان استرداد 30 يوم</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
