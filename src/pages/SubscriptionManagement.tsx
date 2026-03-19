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
import { Crown, Check, X, Loader2, Receipt, CreditCard, Zap, Star } from "lucide-react";
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

export default function SubscriptionManagement() {
  const { clinic } = useClinic();
  const { user } = useAuth();
  const { lang, t } = useI18n();
  const { currentPlan, availableFeatures, lockedFeatures } = useFeatureAccess();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
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
    <div className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {lang === "ar" ? "إدارة الاشتراك" : "Subscription Management"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "ar" ? "إدارة باقتك وعرض الفواتير" : "Manage your plan and view invoices"}
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
              {availableFeatures.length} {lang === "ar" ? "ميزة متاحة" : "features available"}
              {lockedFeatures.length > 0 && ` · ${lockedFeatures.length} ${lang === "ar" ? "مقفلة" : "locked"}`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const Icon = PLAN_ICONS[plan];
          const isCurrent = plan === currentPlan;
          const planFeatures = FEATURES.filter(f => {
            const ranks: Record<string, number> = { starter: 0, professional: 1, premium: 2 };
            return ranks[f.minPlan] <= ranks[plan];
          });

          return (
            <motion.div key={plan} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className={`h-full ${isCurrent ? "ring-2 ring-primary" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${getPlanColor(plan)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{getPlanLabel(plan, lang)}</CardTitle>
                      {isCurrent && (
                        <Badge variant="secondary" className="text-[10px] mt-0.5">
                          {lang === "ar" ? "الحالية" : "Current"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-bold">{PLAN_PRICES[plan].setup.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground"> {lang === "ar" ? "ج.م" : "EGP"}</span>
                    <p className="text-xs text-muted-foreground">
                      + {PLAN_PRICES[plan].monthly.toLocaleString()} {lang === "ar" ? "ج.م/شهرياً" : "EGP/mo"}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {planFeatures.slice(0, 6).map((f) => (
                    <div key={f.key} className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-green-500 shrink-0" />
                      <span>{lang === "ar" ? f.labelAr : f.labelEn}</span>
                    </div>
                  ))}
                  {planFeatures.length > 6 && (
                    <p className="text-[10px] text-muted-foreground">
                      +{planFeatures.length - 6} {lang === "ar" ? "ميزة أخرى" : "more"}
                    </p>
                  )}
                  <Button
                    className="w-full mt-3"
                    variant={isCurrent ? "outline" : "default"}
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
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

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
