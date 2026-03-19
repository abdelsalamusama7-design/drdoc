import { useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { SubscriptionPlan, getPlanLabel, getPlanColor } from "@/hooks/useFeatureAccess";
import { Button } from "@/components/ui/button";
import { Lock, Crown, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface UpgradePromptProps {
  featureKey: string;
  featureLabelAr: string;
  featureLabelEn: string;
  requiredPlan: SubscriptionPlan;
}

export default function UpgradePrompt({ featureKey, featureLabelAr, featureLabelEn, requiredPlan }: UpgradePromptProps) {
  const { lang } = useI18n();
  const navigate = useNavigate();

  const planFeatures: Record<SubscriptionPlan, { ar: string[]; en: string[] }> = {
    starter: { ar: [], en: [] },
    professional: {
      ar: ["الطابور الذكي", "إدارة المخزون", "إدارة الغياب", "أداء الأطباء", "تقارير متقدمة"],
      en: ["Smart Queue", "Inventory", "No-Show Management", "Doctor Performance", "Advanced Reports"],
    },
    premium: {
      ar: ["مساعد الذكاء الاصطناعي", "بوابة المريض", "التنبيهات الطبية", "البحث الذكي", "الفروع المتعددة", "التسويق الآلي"],
      en: ["AI Assistant", "Patient Portal", "Medical Alerts", "Smart Search", "Multi-Branch", "Marketing Automation"],
    },
  };

  const features = planFeatures[requiredPlan]?.[lang] || [];

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
        className="max-w-md w-full text-center"
      >
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-6">
          <Lock className="h-8 w-8 text-amber-500" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {lang === "ar" ? "ميزة مقفلة" : "Feature Locked"}
        </h2>
        <p className="text-muted-foreground mb-1">
          <span className="font-semibold text-foreground">{lang === "ar" ? featureLabelAr : featureLabelEn}</span>
          {" "}
          {lang === "ar" ? "متاحة في باقة" : "is available on the"}
          {" "}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${getPlanColor(requiredPlan)}`}>
            <Crown className="h-3 w-3" />
            {getPlanLabel(requiredPlan, lang)}
          </span>
        </p>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          {lang === "ar"
            ? "قم بترقية باقتك للوصول إلى هذه الميزة والمزيد"
            : "Upgrade your plan to access this feature and more"}
        </p>

        {/* Plan features */}
        {features.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4 mb-6 text-right">
            <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              {lang === "ar"
                ? `ميزات باقة ${getPlanLabel(requiredPlan, lang)}`
                : `${getPlanLabel(requiredPlan, lang)} plan features`}
            </p>
            <div className="space-y-2">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <Button
          onClick={() => navigate("/pricing")}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
        >
          {lang === "ar" ? "ترقية الباقة" : "Upgrade Plan"}
          <ArrowRight className="h-4 w-4 mr-2" />
        </Button>

        <button
          onClick={() => navigate("/")}
          className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {lang === "ar" ? "العودة للوحة التحكم" : "Back to Dashboard"}
        </button>
      </motion.div>
    </div>
  );
}
