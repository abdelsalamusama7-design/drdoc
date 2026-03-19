import { useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, Loader2, Moon, Sun, Languages, User, Phone, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const { user, loading, signIn, signUp } = useAuth();
  const { t, lang, dir, toggleLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  // "staff" = normal clinic login, "patient" = patient portal
  const [mode, setMode] = useState<"staff" | "patient">("staff");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (isSignUp && !fullName.trim()) return;

    setSubmitting(true);
    const { error } = isSignUp
      ? await signUp(email.trim(), password, fullName.trim())
      : await signIn(email.trim(), password);

    if (error) {
      toast({ title: t("login.error"), description: error.message, variant: "destructive" });
    } else if (isSignUp) {
      toast({ title: t("login.accountCreated"), description: t("login.welcomeMsg") });
    }
    setSubmitting(false);
  };

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    if (error) {
      toast({ title: t("login.error"), description: error.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir={dir}>
      {/* Top corner controls */}
      <div className="fixed top-4 left-4 flex items-center gap-1 z-10">
        <button onClick={toggleLang} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
          <Languages className="h-4 w-4" />
        </button>
        <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full max-w-sm">
        <div className="clinic-card p-6 lg:p-8">
          {/* Logo */}
          <div className="text-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Stethoscope className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">
              Smart Clinic<span className="text-primary">.</span>
            </h1>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-muted/50 rounded-xl p-1 mb-5">
            <button
              onClick={() => { setMode("staff"); setIsSignUp(false); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                mode === "staff" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Stethoscope className="h-3.5 w-3.5" />
              {lang === "ar" ? "طاقم العيادة" : "Clinic Staff"}
            </button>
            <button
              onClick={() => { setMode("patient"); setIsSignUp(false); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                mode === "patient" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              {lang === "ar" ? "بوابة المريض" : "Patient Portal"}
            </button>
          </div>

          <p className="text-sm text-muted-foreground text-center mb-4">
            {mode === "staff"
              ? (isSignUp ? t("login.signup") : t("login.title"))
              : (lang === "ar" ? "تسجيل دخول المريض" : "Patient Login")
            }
          </p>

          {/* Staff Form */}
          {mode === "staff" && (
            <form onSubmit={handleStaffSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <Label>{t("login.fullName")}</Label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder={lang === "ar" ? "د. سلطان الأحمدي" : "Dr. John Smith"} className="mt-1.5" required />
                </div>
              )}
              <div>
                <Label>{t("login.email")}</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="doctor@clinic.com" className="mt-1.5 font-en" dir="ltr" required />
              </div>
              <div>
                <Label>{t("login.password")}</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="mt-1.5 font-en" dir="ltr" minLength={6} required />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSignUp ? t("login.signUpBtn") : t("login.signInBtn")}
              </Button>
            </form>
          )}

          {/* Patient Form */}
          {mode === "patient" && (
            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 mb-2">
                <p className="text-xs text-muted-foreground">
                  {lang === "ar" 
                    ? "💡 حساب المريض يتم إنشاؤه بواسطة العيادة. استخدم البيانات التي حصلت عليها من الاستقبال."
                    : "💡 Patient accounts are created by the clinic. Use the credentials provided by reception."
                  }
                </p>
              </div>
              <div>
                <Label>{t("login.email")}</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="patient@email.com" className="mt-1.5 font-en" dir="ltr" required />
              </div>
              <div>
                <Label>{t("login.password")}</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="mt-1.5 font-en" dir="ltr" minLength={6} required />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {lang === "ar" ? "تسجيل الدخول" : "Sign In"}
              </Button>
            </form>
          )}

          {/* Only show signup toggle for staff mode */}
          {mode === "staff" && (
            <div className="mt-4 text-center">
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-primary hover:underline">
                {isSignUp ? t("login.hasAccount") : t("login.noAccount")}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
