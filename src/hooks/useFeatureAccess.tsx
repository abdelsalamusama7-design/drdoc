import { useClinic } from "@/hooks/useClinic";

// ============================================================
// Feature-to-Plan mapping
// ============================================================
// Each feature key maps to the minimum plan required.
//   starter      → basic clinic management
//   professional → advanced analytics & automation
//   premium      → AI, multi-branch, full suite
// ============================================================

export type SubscriptionPlan = "starter" | "professional" | "premium";

export interface FeatureConfig {
  key: string;
  labelAr: string;
  labelEn: string;
  minPlan: SubscriptionPlan;
  descriptionAr: string;
  descriptionEn: string;
}

const PLAN_RANK: Record<SubscriptionPlan, number> = {
  starter: 0,
  professional: 1,
  premium: 2,
};

// Master feature registry – add new features here
export const FEATURES: FeatureConfig[] = [
  // ── Starter (free) ──────────────────────────
  { key: "dashboard",       labelAr: "لوحة التحكم",       labelEn: "Dashboard",           minPlan: "starter",       descriptionAr: "لوحة تحكم إحصائية",           descriptionEn: "Statistics dashboard" },
  { key: "patients",        labelAr: "المرضى",            labelEn: "Patients",            minPlan: "starter",       descriptionAr: "إدارة المرضى",               descriptionEn: "Patient management" },
  { key: "appointments",    labelAr: "المواعيد",           labelEn: "Appointments",        minPlan: "starter",       descriptionAr: "إدارة المواعيد",             descriptionEn: "Appointment management" },
  { key: "prescriptions",   labelAr: "الوصفات",           labelEn: "Prescriptions",       minPlan: "starter",       descriptionAr: "الوصفات الطبية",             descriptionEn: "Medical prescriptions" },
  { key: "services",        labelAr: "الخدمات",           labelEn: "Services",            minPlan: "starter",       descriptionAr: "إدارة الخدمات",              descriptionEn: "Service management" },
  { key: "finance",         labelAr: "المالية",            labelEn: "Finance",             minPlan: "starter",       descriptionAr: "الإدارة المالية",             descriptionEn: "Financial management" },
  { key: "users",           labelAr: "المستخدمين",         labelEn: "Users",               minPlan: "starter",       descriptionAr: "إدارة المستخدمين",           descriptionEn: "User management" },
  { key: "settings",        labelAr: "الإعدادات",          labelEn: "Settings",            minPlan: "starter",       descriptionAr: "إعدادات النظام",             descriptionEn: "System settings" },

  // ── Professional ────────────────────────────
  { key: "queue",            labelAr: "الطابور الذكي",     labelEn: "Smart Queue",         minPlan: "professional",  descriptionAr: "نظام إدارة الطابور",         descriptionEn: "Queue management system" },
  { key: "inventory",        labelAr: "المخزون",           labelEn: "Inventory",           minPlan: "professional",  descriptionAr: "إدارة المخزون والصيدلية",    descriptionEn: "Inventory & pharmacy" },
  { key: "noShow",           labelAr: "إدارة الغياب",      labelEn: "No-Show",             minPlan: "professional",  descriptionAr: "تتبع وتقليل الغياب",         descriptionEn: "No-show tracking" },
  { key: "doctorPerformance",labelAr: "أداء الأطباء",      labelEn: "Dr. Performance",     minPlan: "professional",  descriptionAr: "تحليل أداء الأطباء",         descriptionEn: "Doctor performance analytics" },
  { key: "reports",          labelAr: "التقارير",           labelEn: "Reports",             minPlan: "professional",  descriptionAr: "تقارير متقدمة",              descriptionEn: "Advanced reports" },

  // ── Premium ─────────────────────────────────
  { key: "aiAssistant",     labelAr: "مساعد AI",           labelEn: "AI Assistant",        minPlan: "premium",       descriptionAr: "مساعد العلاج بالذكاء الاصطناعي", descriptionEn: "AI treatment assistant" },
  { key: "patientPortal",   labelAr: "بوابة المريض",       labelEn: "Patient Portal",      minPlan: "premium",       descriptionAr: "بوابة المريض المتقدمة",       descriptionEn: "Advanced patient portal" },
  { key: "medicalAlerts",   labelAr: "التنبيهات الطبية",   labelEn: "Medical Alerts",      minPlan: "premium",       descriptionAr: "تنبيهات الحساسية والتفاعلات", descriptionEn: "Allergy & interaction alerts" },
  { key: "smartSearch",     labelAr: "البحث الذكي",        labelEn: "Smart Search",        minPlan: "premium",       descriptionAr: "بحث بالأعراض والتشخيصات",     descriptionEn: "Search by symptoms & diagnoses" },
  { key: "multiBranch",     labelAr: "الفروع المتعددة",    labelEn: "Multi-Branch",        minPlan: "premium",       descriptionAr: "دعم الفروع المتعددة",         descriptionEn: "Multi-branch support" },
  { key: "marketing",       labelAr: "التسويق الآلي",      labelEn: "Marketing",           minPlan: "premium",       descriptionAr: "حملات تسويقية آلية",          descriptionEn: "Automated marketing" },
  { key: "telemedicine",    labelAr: "الطب عن بُعد",       labelEn: "Telemedicine",        minPlan: "premium",       descriptionAr: "استشارات فيديو",              descriptionEn: "Video consultations" },
];

// Route-path → feature key mapping
export const ROUTE_FEATURE_MAP: Record<string, string> = {
  "/":                    "dashboard",
  "/patients":            "patients",
  "/appointments":        "appointments",
  "/prescriptions":       "prescriptions",
  "/services":            "services",
  "/finance":             "finance",
  "/reports":             "reports",
  "/users":               "users",
  "/settings":            "settings",
  "/queue":               "queue",
  "/inventory":           "inventory",
  "/no-show":             "noShow",
  "/doctor-performance":  "doctorPerformance",
  "/ai-assistant":        "aiAssistant",
  "/medical-alerts":      "medicalAlerts",
  "/smart-search":        "smartSearch",
};

// Nav key (labelKey from ClinicLayout) → feature key
export const NAV_FEATURE_MAP: Record<string, string> = {
  "nav.dashboard":          "dashboard",
  "nav.patients":           "patients",
  "nav.appointments":       "appointments",
  "nav.prescriptions":      "prescriptions",
  "nav.services":           "services",
  "nav.finance":            "finance",
  "nav.reports":            "reports",
  "nav.users":              "users",
  "nav.settings":           "settings",
  "nav.queue":              "queue",
  "nav.inventory":          "inventory",
  "nav.noShow":             "noShow",
  "nav.doctorPerformance":  "doctorPerformance",
};

// ── Hook ──────────────────────────────────────

export function useFeatureAccess() {
  const { clinic } = useClinic();
  const currentPlan = (clinic?.subscription_plan || "starter") as SubscriptionPlan;
  const currentRank = PLAN_RANK[currentPlan] ?? 0;

  /** Check if a feature key is available on the current plan */
  const hasFeature = (featureKey: string): boolean => {
    const feat = FEATURES.find(f => f.key === featureKey);
    if (!feat) return true; // unknown features are allowed
    return currentRank >= PLAN_RANK[feat.minPlan];
  };

  /** Check if a route path is available */
  const hasRouteAccess = (path: string): boolean => {
    const featureKey = ROUTE_FEATURE_MAP[path];
    if (!featureKey) return true;
    return hasFeature(featureKey);
  };

  /** Check if a nav item (by labelKey) is available */
  const hasNavAccess = (labelKey: string): boolean => {
    const featureKey = NAV_FEATURE_MAP[labelKey];
    if (!featureKey) return true;
    return hasFeature(featureKey);
  };

  /** Get the feature config for a key */
  const getFeatureConfig = (featureKey: string): FeatureConfig | undefined => {
    return FEATURES.find(f => f.key === featureKey);
  };

  /** Get required plan for a feature */
  const getRequiredPlan = (featureKey: string): SubscriptionPlan => {
    const feat = FEATURES.find(f => f.key === featureKey);
    return feat?.minPlan || "starter";
  };

  /** Get all features available on current plan */
  const availableFeatures = FEATURES.filter(f => currentRank >= PLAN_RANK[f.minPlan]);

  /** Get all locked features */
  const lockedFeatures = FEATURES.filter(f => currentRank < PLAN_RANK[f.minPlan]);

  return {
    currentPlan,
    hasFeature,
    hasRouteAccess,
    hasNavAccess,
    getFeatureConfig,
    getRequiredPlan,
    availableFeatures,
    lockedFeatures,
  };
}

export function getPlanLabel(plan: SubscriptionPlan, lang: "ar" | "en"): string {
  const labels: Record<SubscriptionPlan, Record<string, string>> = {
    starter:      { ar: "المبتدئة", en: "Starter" },
    professional: { ar: "الاحترافية", en: "Professional" },
    premium:      { ar: "المميزة", en: "Premium" },
  };
  return labels[plan]?.[lang] || plan;
}

export function getPlanColor(plan: SubscriptionPlan): string {
  switch (plan) {
    case "premium": return "bg-gradient-to-r from-amber-500 to-orange-500 text-white";
    case "professional": return "bg-gradient-to-r from-primary to-blue-500 text-white";
    default: return "bg-muted text-foreground";
  }
}
