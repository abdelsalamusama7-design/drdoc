import { motion } from "framer-motion";
import { Check, Stethoscope, Star, Zap, Crown, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const packages = [
  {
    id: "starter",
    name: "Starter Clinic",
    nameAr: "باقة البداية",
    price: "10,000",
    monthly: "750",
    icon: Zap,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
    popular: false,
    features: [
      { text: "موقع إلكتروني احترافي للعيادة", included: true },
      { text: "تطبيق موبايل للمرضى", included: true },
      { text: "شات بوت للرد على الاستفسارات", included: true },
      { text: "لوحة تحكم لإدارة المواعيد", included: true },
      { text: "تصميم متوافق مع الموبايل", included: true },
      { text: "حتى 3 مستخدمين", included: true },
      { text: "إدارة الجلسات والباقات", included: false },
      { text: "تقارير يومية وشهرية", included: false },
      { text: "إشعارات تذكير بالمواعيد", included: false },
      { text: "مساعد ذكاء اصطناعي", included: false },
      { text: "CRM كامل", included: false },
      { text: "دعم فروع متعددة", included: false },
    ],
    specs: { users: "3", reports: "أساسية", messages: "50/شهر", ai: "شات بوت فقط", support: "بريد إلكتروني" },
  },
  {
    id: "professional",
    name: "Professional Clinic",
    nameAr: "الباقة الاحترافية",
    price: "18,000",
    monthly: "1,000",
    icon: Star,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    popular: true,
    features: [
      { text: "موقع إلكتروني احترافي كامل", included: true },
      { text: "تطبيق موبايل للمرضى", included: true },
      { text: "شات بوت ذكي متطور", included: true },
      { text: "لوحة تحكم متقدمة", included: true },
      { text: "إدارة الجلسات والباقات الطبية", included: true },
      { text: "إشعارات تذكير بالمواعيد", included: true },
      { text: "تقارير يومية وشهرية", included: true },
      { text: "حتى 10 مستخدمين", included: true },
      { text: "مساعد ذكاء اصطناعي", included: false },
      { text: "CRM كامل", included: false },
      { text: "دعم فروع متعددة", included: false },
      { text: "تحليلات متقدمة", included: false },
    ],
    specs: { users: "10", reports: "يومية + شهرية", messages: "500/شهر", ai: "شات بوت ذكي", support: "واتساب + هاتف" },
  },
  {
    id: "premium",
    name: "Premium Clinic",
    nameAr: "الباقة المتكاملة",
    price: "25,000",
    monthly: "1,500",
    icon: Crown,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
    popular: false,
    features: [
      { text: "كل مميزات الباقة الاحترافية", included: true },
      { text: "مساعد ذكاء اصطناعي متقدم", included: true },
      { text: "CRM كامل لإدارة المرضى", included: true },
      { text: "تحليلات ذكية لأداء العيادة", included: true },
      { text: "تتبع حالة المريض في الوقت الحقيقي", included: true },
      { text: "دعم فروع متعددة", included: true },
      { text: "جدولة الأطباء بين الفروع", included: true },
      { text: "عدد مستخدمين غير محدود", included: true },
      { text: "رسائل تذكير غير محدودة", included: true },
      { text: "تقارير مخصصة", included: true },
      { text: "أولوية في الدعم الفني", included: true },
      { text: "تدريب مجاني للفريق", included: true },
    ],
    specs: { users: "غير محدود", reports: "مخصصة + ذكية", messages: "غير محدود", ai: "مساعد AI كامل", support: "أولوية 24/7" },
  },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Instatech AI</h1>
              <p className="text-xs text-muted-foreground">حلول ذكية للعيادات والمراكز الطبية</p>
            </div>
          </div>
          <Link to="/booking">
            <Button variant="outline" size="sm">جرّب مجاناً</Button>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl lg:text-4xl font-bold text-foreground mb-3"
        >
          اختر الباقة المناسبة لعيادتك
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground max-w-xl mx-auto"
        >
          نظام إدارة عيادات متكامل يعمل بالذكاء الاصطناعي. ابدأ الآن وحسّن تجربة مرضاك
        </motion.p>
      </div>

      {/* Packages */}
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <motion.div
              key={pkg.id}
              variants={item}
              className={`relative clinic-card overflow-hidden ${pkg.popular ? `ring-2 ring-primary` : ""}`}
            >
              {pkg.popular && (
                <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center text-xs font-bold py-1.5">
                  ⭐ الأكثر طلباً
                </div>
              )}
              <div className={`p-6 ${pkg.popular ? "pt-10" : ""}`}>
                <div className={`w-12 h-12 rounded-2xl ${pkg.bg} flex items-center justify-center mb-4`}>
                  <pkg.icon className={`h-6 w-6 ${pkg.color}`} />
                </div>
                <h3 className="text-lg font-bold text-foreground">{pkg.nameAr}</h3>
                <p className="text-xs text-muted-foreground font-en mb-4">{pkg.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-foreground font-en">{pkg.price}</span>
                  <span className="text-sm text-muted-foreground">ج.م</span>
                </div>
                <p className="text-xs text-muted-foreground mb-6">
                  + <span className="font-en font-semibold">{pkg.monthly}</span> ج.م / شهرياً
                </p>
                <div className="space-y-2.5 mb-6">
                  {pkg.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className={`h-4 w-4 mt-0.5 shrink-0 ${f.included ? "text-success" : "text-muted-foreground/30"}`} />
                      <span className={`text-sm ${f.included ? "text-foreground" : "text-muted-foreground/50 line-through"}`}>{f.text}</span>
                    </div>
                  ))}
                </div>
                <Button
                  className={`w-full ${pkg.popular ? "" : "variant-outline"}`}
                  variant={pkg.popular ? "default" : "outline"}
                  asChild
                >
                  <a href="https://wa.me/201227080430" target="_blank" rel="noopener noreferrer">
                    تواصل معنا
                  </a>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Comparison Table */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <h3 className="text-xl font-bold text-foreground text-center mb-6">مقارنة تفصيلية</h3>
        <div className="clinic-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right p-4 text-muted-foreground font-medium">الميزة</th>
                <th className="p-4 text-center text-success font-semibold">Starter</th>
                <th className="p-4 text-center text-primary font-semibold">Professional</th>
                <th className="p-4 text-center text-warning font-semibold">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {[
                { label: "عدد المستخدمين", values: ["3", "10", "غير محدود"] },
                { label: "التقارير", values: ["أساسية", "يومية + شهرية", "مخصصة + ذكية"] },
                { label: "الرسائل", values: ["50/شهر", "500/شهر", "غير محدود"] },
                { label: "الذكاء الاصطناعي", values: ["شات بوت", "شات بوت ذكي", "مساعد AI كامل"] },
                { label: "الدعم الفني", values: ["بريد إلكتروني", "واتساب + هاتف", "أولوية 24/7"] },
                { label: "إدارة الباقات", values: ["✗", "✓", "✓"] },
                { label: "CRM", values: ["✗", "✗", "✓"] },
                { label: "فروع متعددة", values: ["✗", "✗", "✓"] },
                { label: "بوابة دفع", values: ["✗", "✓", "✓"] },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-muted/20">
                  <td className="p-4 font-medium text-foreground">{row.label}</td>
                  {row.values.map((v, j) => (
                    <td key={j} className={`p-4 text-center ${v === "✗" ? "text-muted-foreground/40" : v === "✓" ? "text-success font-bold" : "text-foreground"}`}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-card border-t border-border">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-3">جاهز لتطوير عيادتك؟</h3>
          <p className="text-muted-foreground mb-6">تواصل معنا الآن واحصل على استشارة مجانية</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button asChild size="lg">
              <a href="https://wa.me/201227080430" target="_blank" rel="noopener noreferrer" className="gap-2">
                <MessageCircle className="h-5 w-5" />
                واتساب
              </a>
            </Button>
            <Button variant="outline" asChild size="lg">
              <a href="tel:+201227080430" className="gap-2">
                <Phone className="h-5 w-5" />
                01227080430
              </a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            🌐 <a href="https://www.instatech.site/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.instatech.site</a>
          </p>
        </div>
      </div>
    </div>
  );
}
