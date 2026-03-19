import { useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, Loader2, Moon, Sun, Languages, User, Phone } from "lucide-react";
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

    if (isSignUp) {
      // Patient registration via edge function
      if (!fullName.trim() || !phone.trim()) {
        toast({ title: lang === "ar" ? "خطأ" : "Error", description: lang === "ar" ? "جميع الحقول مطلوبة" : "All fields required", variant: "destructive" });
        setSubmitting(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("patient-register", {
          body: { email: email.trim(), password, full_name: fullName.trim(), phone: phone.trim() },
        });

        if (error || data?.error) {
          toast({ title: lang === "ar" ? "خطأ" : "Error", description: data?.error || error?.message, variant: "destructive" });
          setSubmitting(false);
          return;
        }

        // Auto sign-in after registration
        const { error: signInError } = await signIn(email.trim(), password);
        if (signInError) {
          toast({ title: lang === "ar" ? "تم التسجيل" : "Registered", description: lang === "ar" ? "تم إنشاء حسابك، سجل دخول الآن" : "Account created, please sign in" });
          setIsSignUp(false);
        }
      } catch (err: any) {
        toast({ title: lang === "ar" ? "خطأ" : "Error", description: err.message, variant: "destructive" });
      }
    } else {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        toast({ title: t("login.error"), description: error.message, variant: "destructive" });
      }
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
              : (isSignUp
                ? (lang === "ar" ? "إنشاء حساب مريض جديد" : "Create Patient Account")
                : (lang === "ar" ? "تسجيل دخول المريض" : "Patient Login")
              )
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
              {isSignUp && (
                <>
                  <div>
                    <Label>{lang === "ar" ? "الاسم الكامل" : "Full Name"}</Label>
                    <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder={lang === "ar" ? "أحمد محمد" : "Ahmed Mohamed"} className="mt-1.5" required />
                  </div>
                  <div>
                    <Label>{lang === "ar" ? "رقم الهاتف" : "Phone Number"}</Label>
                    <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="01012345678" className="mt-1.5 font-en" dir="ltr" required />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {lang === "ar" ? "⚠️ يجب أن يكون نفس الرقم المسجل في العيادة" : "⚠️ Must match the number registered at the clinic"}
                    </p>
                  </div>
                </>
              )}
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
                {isSignUp
                  ? (lang === "ar" ? "إنشاء حساب" : "Create Account")
                  : (lang === "ar" ? "تسجيل الدخول" : "Sign In")
                }
              </Button>
            </form>
          )}

          <div className="mt-4 text-center">
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-primary hover:underline">
              {mode === "patient"
                ? (isSignUp
                  ? (lang === "ar" ? "لديك حساب؟ سجل دخول" : "Have an account? Sign in")
                  : (lang === "ar" ? "ليس لديك حساب؟ سجل الآن" : "No account? Register now")
                )
                : (isSignUp ? t("login.hasAccount") : t("login.noAccount"))
              }
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
