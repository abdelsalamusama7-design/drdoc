import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useClinic } from "@/hooks/useClinic";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useFeatureAccess, getPlanLabel, getPlanColor, FEATURES, type SubscriptionPlan } from "@/hooks/useFeatureAccess";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Crown, Check, X, Loader2, Receipt, CreditCard, Zap, Star, MessageCircle, Phone } from "lucide-react";
import { motion } from "framer-motion";

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  payment_method: string | null;
  created_at: string;
}

const PLAN_PRICES: Record<SubscriptionPlan, { setup: number; monthly: number }> = {
  starter: { setup: 10000, monthly: 2000 },
  professional: { setup: 18000, monthly: 3000 },
  premium: { setup: 25000, monthly: 4000 },
};

const PLAN_ICONS: Record<SubscriptionPlan, any> = {
  starter: Zap,
  professional: Star,
  premium: Crown,
};

const PLAN_FEATURES: Record<SubscriptionPlan, string[]> = {
  starter: [
    "موقع إلكتروني احترافي",
    "نظام حجز مواعيد",
    "إدارة المرضى",
    "شات بوت أساسي",
    "لوحة تحكم",
  ],
  professional: [
    "كل مميزات الباقة الأساسية",
    "نظام التذكير التلقائي",
    "تقارير تفصيلية",
    "إدارة الباقات والجلسات",
    "تحسين تجربة المستخدم",
  ],
  premium: [
    "كل مميزات الباقة الاحترافية",
    "AI Assistant متكامل",
    "CRM لإدارة المرضى",
    "تحليلات متقدمة",
    "دعم الفروع المتعددة",
  ],
};

const COMPARISON_ROWS = [
  { label: "عدد المستخدمين", values: ["محدود", "متوسط", "غير محدود"] },
  { label: "التقارير", values: ["أساسية", "متقدمة", "ذكية"] },
  { label: "الرسائل", values: ["لا يوجد", "متاح", "متكامل"] },
  { label: "الذكاء الاصطناعي", values: ["أساسي", "متوسط", "متقدم"] },
  { label: "الدعم", values: ["عادي", "سريع", "أولوية"] },
];

export default function SubscriptionManagement() {
  const { clinic } = useClinic();
  const { user } = useAuth();
  const { lang, t } = useI18n();
  const { currentPlan } = useFeatureAccess();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    if (clinic?.id) fetchStatus();
  }, [clinic?.id]);

  async function fetchStatus() {
    if (!clinic?.id) return;
    const { data } = await supabase.functions.invoke("manage-subscription", {
      body: { action: "get_status", clinic_id: clinic.id },
    });
    if (data?.invoices) setInvoices(data.invoices);
  }

  async function handleUpgrade(plan: SubscriptionPlan) {
    if (!clinic?.id) return;
    setUpgrading(plan);
    try {
      const { data, error } = await supabase.functions.invoke("manage-subscription", {
        body: { action: "upgrade", clinic_id: clinic.id, plan },
      });
      if (error) throw error;
      toast({ title: lang === "ar" ? "تم الترقية بنجاح" : "Upgrade successful" });
      window.location.reload();
    } catch (err: any) {
      toast({ title: lang === "ar" ? "خطأ" : "Error", description: err.message, variant: "destructive" });
    }
    setUpgrading(null);
  }

  const plans: SubscriptionPlan[] = ["starter", "professional", "premium"];

  return (
    <div className="space-y-8" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {lang === "ar" ? "الأسعار والاشتراكات" : "Pricing & Subscriptions"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "ar" ? "اختر الباقة المناسبة لعيادتك وتابع فواتيرك" : "Choose the right plan and manage invoices"}
        </p>
      </div>

      {/* Current Plan Banner */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6 flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getPlanColor(currentPlan)}`}>
            <Crown className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "باقتك الحالية" : "Current Plan"}
            </p>
            <h2 className="text-xl font-bold text-foreground">{getPlanLabel(currentPlan, lang)}</h2>
            <p className="text-xs text-muted-foreground">
              {PLAN_PRICES[currentPlan].setup.toLocaleString()} {lang === "ar" ? "ج.م تأسيس" : "EGP setup"} + {PLAN_PRICES[currentPlan].monthly.toLocaleString()} {lang === "ar" ? "ج.م/شهرياً" : "EGP/mo"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const Icon = PLAN_ICONS[plan];
          const isCurrent = plan === currentPlan;
          const isPopular = plan === "professional";
          const features = PLAN_FEATURES[plan];

          return (
            <motion.div key={plan} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className={`h-full relative overflow-hidden ${isCurrent ? "ring-2 ring-primary" : ""} ${isPopular ? "ring-2 ring-primary" : ""}`}>
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center text-xs font-bold py-1">
                    ⭐ {lang === "ar" ? "الأكثر طلباً" : "Most Popular"}
                  </div>
                )}
                <CardHeader className={`pb-3 ${isPopular ? "pt-8" : ""}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      plan === "starter" ? "bg-success/10 text-success" :
                      plan === "professional" ? "bg-primary/10 text-primary" :
                      "bg-warning/10 text-warning"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {lang === "ar"
                          ? plan === "starter" ? "باقة البداية" : plan === "professional" ? "الباقة الاحترافية" : "الباقة المتكاملة"
                          : plan === "starter" ? "Starter" : plan === "professional" ? "Professional" : "Premium"
                        }
                      </CardTitle>
                      {isCurrent && (
                        <Badge variant="secondary" className="text-[10px] mt-0.5">
                          {lang === "ar" ? "الحالية" : "Current"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold font-en">{PLAN_PRICES[plan].setup.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">{lang === "ar" ? "ج.م" : "EGP"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      + <span className="font-en font-semibold">{PLAN_PRICES[plan].monthly.toLocaleString()}</span> {lang === "ar" ? "ج.م / شهرياً" : "EGP/mo"}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <Check className="h-3.5 w-3.5 text-success shrink-0" />
                      <span className="text-foreground">{f}</span>
                    </div>
                  ))}
                  <div className="pt-3 space-y-2">
                    <Button
                      className="w-full"
                      variant={isCurrent ? "outline" : isPopular ? "default" : "outline"}
                      disabled={isCurrent || !!upgrading}
                      onClick={() => handleUpgrade(plan)}
                    >
                      {upgrading === plan ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isCurrent ? (
                        lang === "ar" ? "الباقة الحالية" : "Current Plan"
                      ) : (
                        lang === "ar" ? "ترقية" : "Upgrade"
                      )}
                    </Button>
                    <Button
                      className="w-full"
                      variant="secondary"
                      size="sm"
                      onClick={() => window.open(`https://wa.me/201227080430?text=${encodeURIComponent(`مرحباً، أريد الاشتراك في ${plan === "starter" ? "باقة البداية" : plan === "professional" ? "الباقة الاحترافية" : "الباقة المتكاملة"}`)}`, "_blank")}
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      {lang === "ar" ? "تواصل عبر واتساب" : "Contact via WhatsApp"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 {lang === "ar" ? "الفرق بين الباقات" : "Plan Comparison"}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right p-3 text-muted-foreground font-medium">{lang === "ar" ? "الميزة" : "Feature"}</th>
                <th className="p-3 text-center text-success font-semibold">Starter</th>
                <th className="p-3 text-center text-primary font-semibold">Professional</th>
                <th className="p-3 text-center text-warning font-semibold">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={i} className="hover:bg-muted/20">
                  <td className="p-3 font-medium text-foreground">{row.label}</td>
                  {row.values.map((v, j) => (
                    <td key={j} className="p-3 text-center text-foreground text-xs">{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-bold text-foreground mb-2">
            {lang === "ar" ? "جاهز لتطوير عيادتك؟" : "Ready to upgrade?"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {lang === "ar" ? "تواصل معنا الآن واحصل على استشارة مجانية" : "Contact us now for a free consultation"}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button asChild>
              <a href="https://wa.me/201227080430" target="_blank" rel="noopener noreferrer" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                {lang === "ar" ? "واتساب" : "WhatsApp"}
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="tel:+201227080430" className="gap-2">
                <Phone className="h-4 w-4" />
                01227080430
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="h-5 w-5" />
            {lang === "ar" ? "الفواتير" : "Invoices"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {lang === "ar" ? "لا توجد فواتير بعد" : "No invoices yet"}
            </p>
          ) : (
            <div className="space-y-2">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{inv.amount.toLocaleString()} {inv.currency}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(inv.created_at).toLocaleDateString(lang === "ar" ? "ar-EG" : "en")}
                      </p>
                    </div>
                  </div>
                  <Badge variant={inv.status === "paid" ? "default" : "secondary"}>
                    {inv.status === "paid" ? (lang === "ar" ? "مدفوعة" : "Paid") : (lang === "ar" ? "معلقة" : "Pending")}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
