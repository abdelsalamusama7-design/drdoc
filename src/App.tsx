import { useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ClinicProvider } from "@/hooks/useClinic";
import { I18nProvider } from "@/hooks/useI18n";
import { ThemeProvider } from "@/hooks/useTheme";
import SplashScreen from "@/components/SplashScreen";

import AIChatbot from "@/components/AIChatbot";
import ClinicLayout from "@/components/ClinicLayout";
import FeatureGuard from "@/components/FeatureGuard";
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import PatientDetail from "@/pages/PatientDetail";
import Appointments from "@/pages/Appointments";
import Prescriptions from "@/pages/Prescriptions";
import Services from "@/pages/Services";
import Finance from "@/pages/Finance";
import Reports from "@/pages/Reports";
import SettingsPage from "@/pages/Settings";
import Login from "@/pages/Login";
import UserManagement from "@/pages/UserManagement";
import Booking from "@/pages/Booking";
import Pricing from "@/pages/Pricing";
import RegisterClinic from "@/pages/RegisterClinic";
import ReceptionDashboard from "@/pages/ReceptionDashboard";
import AccountantDashboard from "@/pages/AccountantDashboard";
import PatientPortal from "@/pages/PatientPortal";
import QueueManagement from "@/pages/QueueManagement";
import DoctorPerformance from "@/pages/DoctorPerformance";
import InventoryPage from "@/pages/Inventory";
import NoShowManagement from "@/pages/NoShowManagement";
import SubscriptionManagement from "@/pages/SubscriptionManagement";
import AITreatmentAssistant from "@/pages/AITreatmentAssistant";
import MedicalAlerts from "@/pages/MedicalAlerts";
import SmartSearch from "@/pages/SmartSearch";
import PatientJourney from "@/pages/PatientJourney";
import NotFound from "@/pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Patient portal - separate layout
  if (role === "patient") {
    return (
      <ClinicLayout>
        <Routes>
          <Route path="/" element={<PatientPortal />} />
          <Route path="*" element={<PatientPortal />} />
        </Routes>
      </ClinicLayout>
    );
  }

  const isReceptionist = role === "receptionist";
  const isAccountant = role === "accountant";

  // Pick the right dashboard based on role
  const DashboardComponent = isReceptionist ? ReceptionDashboard : isAccountant ? AccountantDashboard : Dashboard;

  return (
    <ClinicLayout>
      <Routes>
        <Route path="/" element={<DashboardComponent />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/:id" element={<PatientDetail />} />
        <Route path="/patient-journey" element={<PatientJourney />} />
        <Route path="/appointments" element={<Appointments />} />
        {!isAccountant && <Route path="/prescriptions" element={<Prescriptions />} />}
        {!isAccountant && <Route path="/services" element={<Services />} />}
        <Route
          path="/finance"
          element={isReceptionist ? <Navigate to="/" replace /> : isAccountant ? <AccountantDashboard /> : <Finance />}
        />
        <Route
          path="/reports"
          element={isReceptionist || isAccountant ? <Navigate to="/" replace /> : <FeatureGuard path="/reports"><Reports /></FeatureGuard>}
        />
        <Route
          path="/settings"
          element={isReceptionist || isAccountant ? <Navigate to="/" replace /> : <SettingsPage />}
        />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/queue" element={<FeatureGuard path="/queue"><QueueManagement /></FeatureGuard>} />
        <Route path="/doctor-performance" element={<FeatureGuard path="/doctor-performance"><DoctorPerformance /></FeatureGuard>} />
        <Route path="/inventory" element={<FeatureGuard path="/inventory"><InventoryPage /></FeatureGuard>} />
        <Route path="/no-show" element={<FeatureGuard path="/no-show"><NoShowManagement /></FeatureGuard>} />
        <Route path="/subscription" element={<SubscriptionManagement />} />
        <Route path="/ai-assistant" element={<FeatureGuard path="/ai-assistant"><AITreatmentAssistant /></FeatureGuard>} />
        <Route path="/medical-alerts" element={<FeatureGuard path="/medical-alerts"><MedicalAlerts /></FeatureGuard>} />
        <Route path="/smart-search" element={<FeatureGuard path="/smart-search"><SmartSearch /></FeatureGuard>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ClinicLayout>
  );
}

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashComplete = useCallback(() => setShowSplash(false), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
            
            <BrowserRouter>
              <AuthProvider>
                <ClinicProvider>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/booking" element={<Booking />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/register-clinic" element={<RegisterClinic />} />
                    <Route path="/*" element={<ProtectedRoutes />} />
                  </Routes>
                  <AIChatbot />
                </ClinicProvider>
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
