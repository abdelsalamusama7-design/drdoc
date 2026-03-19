import { useFeatureAccess, ROUTE_FEATURE_MAP } from "@/hooks/useFeatureAccess";
import UpgradePrompt from "@/components/UpgradePrompt";

interface FeatureGuardProps {
  path: string;
  children: React.ReactNode;
}

export default function FeatureGuard({ path, children }: FeatureGuardProps) {
  const { hasRouteAccess, getFeatureConfig, getRequiredPlan } = useFeatureAccess();

  const featureKey = ROUTE_FEATURE_MAP[path];

  if (featureKey && !hasRouteAccess(path)) {
    const config = getFeatureConfig(featureKey);
    const requiredPlan = getRequiredPlan(featureKey);
    return (
      <UpgradePrompt
        featureKey={featureKey}
        featureLabelAr={config?.labelAr || featureKey}
        featureLabelEn={config?.labelEn || featureKey}
        requiredPlan={requiredPlan}
      />
    );
  }

  return <>{children}</>;
}
