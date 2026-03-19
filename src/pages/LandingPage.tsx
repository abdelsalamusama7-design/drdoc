import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Stethoscope, Users, CalendarCheck, Bell, BarChart3, Shield, Zap, Star,
  MessageCircle, Phone, Mail, ChevronDown, CheckCircle2, ArrowLeft,
  Brain, Clock, TrendingUp, Sparkles, Play, Send, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

const stats = [
  { value: "500+", label: "عيادة نشطة" },
  { value: "50,000+", label: "مريض مسجل" },
  { value: "95%", label: "نسبة الرضا" },
  { value: "40%", label: "تقليل عدم الحضور" },
];

const features = [
  { icon: CalendarCheck, title: "إدارة المواعيد الذكية", desc: "حجز إلكتروني مع تذكيرات تلقائية تقلل نسبة عدم الحضور بنسبة 40%", color: "text-primary" },
  { icon: Users, title: "إدارة المرضى الشاملة", desc: "ملف طبي متكامل لكل مريض مع تاريخ الزيارات والوصفات والتحاليل", color: "text-success" },
  { icon: Brain, title: "مساعد ذكاء اصطناعي", desc: "AI يساعد في التشخيص والملخصات الطبية وتحليل سلوك المرضى", color: "text-warning" },
  { icon: BarChart3, title: "تقارير وتحليلات", desc: "لوحة تحكم متقدمة مع تقارير مالية وأداء الأطباء", color: "text-accent" },
  { icon: Bell, title: "تذكيرات تلقائية", desc: "إشعارات ذكية للمواعيد والأدوية والمتابعات", color: "text-destructive" },
  { icon: Shield, title: "أمان وخصوصية", desc: "تشفير كامل للبيانات مع نظام صلاحيات متعدد المستويات", color: "text-primary" },
];

const testimonials = [
  { name: "د. أحمد محمود", role: "طب أسنان - القاهرة", text: "النظام وفر لي 3 ساعات يومياً في إدارة العيادة وقلل عدم الحضور بشكل ملحوظ", rating: 5 },
  { name: "د. سارة خليل", role: "جلدية - الإسكندرية", text: "أفضل نظام استخدمته، الذكاء الاصطناعي يساعدني في تلخيص الحالات بسرعة", rating: 5 },
  { name: "د. محمد عبدالله", role: "عظام - الرياض", text: "بعد استخدام النظام، زادت إيرادات العيادة 30% بفضل إدارة المواعيد الذكية", rating: 5 },
];

const faqs = [
  { q: "هل يمكنني تجربة النظام مجاناً؟", a: "نعم! نوفر فترة تجريبية مجانية لمدة 14 يوماً مع جميع المميزات. لا يتطلب بطاقة ائتمان." },
  { q: "هل بياناتي آمنة؟", a: "نعم، نستخدم تشفير على مستوى البنوك مع نسخ احتياطية تلقائية وصلاحيات متعددة المستويات." },
  { q: "هل يمكنني استخدام النظام من الجوال؟", a: "بالتأكيد! النظام متوافق تماماً مع جميع الأجهزة مع تطبيق PWA يمكن تثبيته." },
  { q: "ماذا لو لم يعجبني النظام؟", a: "نوفر ضمان استرداد كامل خلال 30 يوماً من الاشتراك بدون أي أسئلة." },
];

export default function LandingPage() {
  const { toast } = useToast();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ clinic_name: "", contact_name: "", phone: "", email: "", specialty: "", patient_count: "", message: "" });
  const [demoForm, setDemoForm] = useState({ clinic_name: "", contact_name: "", phone: "", email: "", specialty: "" });
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"contact" | "demo">("demo");

  const submitForm = async (type: "contact" | "demo") => {
    const form = type === "demo" ? demoForm : contactForm;
    if (!form.clinic_name || !form.contact_name || !form.phone) {
      toast({ title: "خطأ", description: "يرجى ملء الحقول المطلوبة", variant: "destructive" });
      return;
    }
    setSubmitting(type);
    try {
      await (supabase.from("demo_requests" as any) as any).insert({
        ...form,
        request_type: type,
      });
      toast({ title: "✅ تم الإرسال بنجاح", description: type === "demo" ? "سنتواصل معك خلال 24 ساعة لترتيب العرض التوضيحي" : "شكراً لتواصلك، سنرد عليك قريباً" });
      if (type === "demo") setDemoForm({ clinic_name: "", contact_name: "", phone: "", email: "", specialty: "" });
      else setContactForm({ clinic_name: "", contact_name: "", phone: "", email: "", specialty: "", patient_count: "", message: "" });
    } catch {
      toast({ title: "خطأ", description: "حدث خطأ، حاول مرة أخرى", variant: "destructive" });
    }
    setSubmitting(null);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Smart Clinic<span className="text-primary">.</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">المميزات</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">الأسعار</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">آراء العملاء</a>
            <a href="#contact" className="hover:text-foreground transition-colors">تواصل معنا</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">تسجيل الدخول</Button></Link>
            <a href="#demo"><Button size="sm" className="gap-1.5"><Play className="h-3.5 w-3.5" />احجز عرض مجاني</Button></a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="max-w-7xl mx-auto px-4 py-20 lg:py-28 relative">
          <motion.div initial="hidden" animate="show" variants={stagger} className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />مدعوم بالذكاء الاصطناعي
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              نظام إدارة العيادات<br />
              <span className="text-primary">الأذكى في المنطقة</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              زد عدد مرضاك بنسبة 30% وقلل عدم الحضور بنسبة 40% مع نظام متكامل يعمل بالذكاء الاصطناعي.
              من المواعيد للوصفات للتقارير - كل شيء في مكان واحد.
            </motion.p>
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 flex-wrap">
              <a href="#demo"><Button size="lg" className="gap-2 text-base h-12 px-8"><Play className="h-4 w-4" />جرّب مجاناً لمدة 14 يوم</Button></a>
              <Button variant="outline" size="lg" className="gap-2 text-base h-12 px-8" onClick={() => window.open("https://wa.me/201227080430?text=" + encodeURIComponent("مرحباً، أريد معرفة المزيد عن نظام Smart Clinic"), "_blank")}>
                <MessageCircle className="h-4 w-4" />تحدث معنا
              </Button>
            </motion.div>
            <motion.p variants={fadeUp} className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-success" />بدون بطاقة ائتمان</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-success" />ضمان استرداد 30 يوم</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-success" />دعم فني على مدار الساعة</span>
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(s => (
              <motion.div key={s.label} variants={fadeUp} className="text-center">
                <div className="text-3xl font-bold text-primary font-en">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-foreground mb-3">كل ما تحتاجه لإدارة عيادتك</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-lg mx-auto">أدوات متكاملة صُممت خصيصاً للعيادات والمراكز الطبية</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <motion.div key={f.title} variants={fadeUp} className="clinic-card p-6 hover:shadow-lg transition-shadow">
                <f.icon className={`h-8 w-8 ${f.color} mb-4`} />
                <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 bg-card/50 border-y border-border">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-foreground mb-3">كيف يعمل النظام؟</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "سجل عيادتك", desc: "أنشئ حسابك في دقيقة واحدة", icon: Zap },
              { step: "2", title: "أضف بياناتك", desc: "خدماتك وفريقك ومواعيدك", icon: Users },
              { step: "3", title: "استقبل مرضاك", desc: "نظام حجز وتذكيرات ذكية", icon: CalendarCheck },
              { step: "4", title: "تابع أداءك", desc: "تقارير وتحليلات متقدمة", icon: TrendingUp },
            ].map(s => (
              <motion.div key={s.step} variants={fadeUp} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary font-en">{s.step}</span>
                </div>
                <h3 className="font-bold text-foreground mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-3xl font-bold text-foreground mb-3">خطط أسعار مرنة</motion.h2>
          <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-muted-foreground mb-8">ابدأ مجاناً واختر الباقة المناسبة لحجم عيادتك</motion.p>
          <Link to="/pricing"><Button size="lg" variant="outline" className="gap-2">عرض جميع الباقات والأسعار <ArrowLeft className="h-4 w-4" /></Button></Link>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-20 bg-card/50 border-y border-border">
        <div className="max-w-5xl mx-auto px-4">
          <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-3xl font-bold text-foreground text-center mb-12">ماذا يقول عملاؤنا؟</motion.h2>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <motion.div key={t.name} variants={fadeUp} className="clinic-card p-6">
                <div className="flex items-center gap-1 mb-3">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-warning text-warning" />)}</div>
                <p className="text-sm text-foreground mb-4 leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="text-sm font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Demo Booking + Contact Form ── */}
      <section id="demo" className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-3">ابدأ رحلتك الآن</h2>
            <div className="flex items-center justify-center bg-muted/50 rounded-xl p-1 max-w-xs mx-auto">
              <button onClick={() => setActiveSection("demo")} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${activeSection === "demo" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
                احجز عرض مجاني
              </button>
              <button onClick={() => setActiveSection("contact")} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${activeSection === "contact" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
                تواصل معنا
              </button>
            </div>
          </div>

          {activeSection === "demo" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="clinic-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Play className="h-5 w-5 text-primary" /></div>
                <div>
                  <h3 className="font-bold text-foreground">احجز عرضاً توضيحياً مجانياً</h3>
                  <p className="text-xs text-muted-foreground">سنعرض لك النظام بالكامل مع سيناريو حقيقي لعيادتك</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>اسم العيادة *</Label>
                  <Input value={demoForm.clinic_name} onChange={e => setDemoForm({ ...demoForm, clinic_name: e.target.value })} placeholder="عيادة د. أحمد" className="mt-1" />
                </div>
                <div>
                  <Label>اسمك *</Label>
                  <Input value={demoForm.contact_name} onChange={e => setDemoForm({ ...demoForm, contact_name: e.target.value })} placeholder="د. أحمد محمد" className="mt-1" />
                </div>
                <div>
                  <Label>رقم الهاتف *</Label>
                  <Input value={demoForm.phone} onChange={e => setDemoForm({ ...demoForm, phone: e.target.value })} placeholder="01xxxxxxxxx" className="mt-1" dir="ltr" />
                </div>
                <div>
                  <Label>البريد الإلكتروني</Label>
                  <Input value={demoForm.email} onChange={e => setDemoForm({ ...demoForm, email: e.target.value })} placeholder="doctor@email.com" className="mt-1" dir="ltr" />
                </div>
                <div className="col-span-2">
                  <Label>التخصص</Label>
                  <Select value={demoForm.specialty} onValueChange={v => setDemoForm({ ...demoForm, specialty: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="اختر التخصص" /></SelectTrigger>
                    <SelectContent>
                      {["أسنان", "جلدية", "عظام", "باطنة", "أطفال", "نساء وتوليد", "عيون", "أنف وأذن", "تجميل", "أخرى"].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full mt-6 gap-2" onClick={() => submitForm("demo")} disabled={submitting === "demo"}>
                {submitting === "demo" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                احجز العرض المجاني
              </Button>
            </motion.div>
          )}

          {activeSection === "contact" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="clinic-card p-8" id="contact">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><Mail className="h-5 w-5 text-accent" /></div>
                <div>
                  <h3 className="font-bold text-foreground">تواصل معنا</h3>
                  <p className="text-xs text-muted-foreground">أرسل لنا استفسارك وسنرد خلال 24 ساعة</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>اسم العيادة *</Label>
                  <Input value={contactForm.clinic_name} onChange={e => setContactForm({ ...contactForm, clinic_name: e.target.value })} placeholder="عيادة د. أحمد" className="mt-1" />
                </div>
                <div>
                  <Label>اسمك *</Label>
                  <Input value={contactForm.contact_name} onChange={e => setContactForm({ ...contactForm, contact_name: e.target.value })} placeholder="د. أحمد" className="mt-1" />
                </div>
                <div>
                  <Label>رقم الهاتف *</Label>
                  <Input value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} placeholder="01xxxxxxxxx" className="mt-1" dir="ltr" />
                </div>
                <div>
                  <Label>البريد الإلكتروني</Label>
                  <Input value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} placeholder="doctor@email.com" className="mt-1" dir="ltr" />
                </div>
                <div className="col-span-2">
                  <Label>الرسالة</Label>
                  <Textarea value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} placeholder="اكتب استفسارك هنا..." className="mt-1" rows={4} />
                </div>
              </div>
              <Button className="w-full mt-6 gap-2" onClick={() => submitForm("contact")} disabled={submitting === "contact"}>
                {submitting === "contact" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                أرسل الرسالة
              </Button>
            </motion.div>
          )}

          {/* WhatsApp Float */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button variant="outline" className="gap-2" onClick={() => window.open("https://wa.me/201227080430?text=" + encodeURIComponent("مرحباً، أريد حجز عرض توضيحي لنظام Smart Clinic"), "_blank")}>
              <MessageCircle className="h-4 w-4 text-success" />تواصل عبر واتساب
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <a href="tel:+201227080430"><Phone className="h-4 w-4" />اتصل بنا</a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-card/50 border-t border-border">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-10">الأسئلة الشائعة</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="clinic-card overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-right">
                  <span className="font-semibold text-foreground text-sm">{f.q}</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-5 pb-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">جاهز لتحويل عيادتك؟</h2>
          <p className="text-muted-foreground mb-6">ابدأ تجربتك المجانية الآن - بدون بطاقة ائتمان وبضمان استرداد كامل</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/register-clinic"><Button size="lg" className="gap-2"><Zap className="h-4 w-4" />ابدأ تجربة مجانية</Button></Link>
            <Link to="/pricing"><Button size="lg" variant="outline">عرض الأسعار</Button></Link>
          </div>
        </div>
      </section>

      {/* WhatsApp floating button */}
      <a href="https://wa.me/201227080430" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-success rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all">
        <MessageCircle className="h-6 w-6 text-success-foreground" />
      </a>

      <Footer />
    </div>
  );
}
