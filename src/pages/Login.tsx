import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Stethoscope, Loader2, Languages, User, Eye, EyeOff,
  Shield, Clock, Users, ArrowRight, HeartPulse, Activity,
  CheckCircle2, Mail, Lock, UserPlus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

import screenshotDashboard from "@/assets/screenshot-dashboard.jpg";

export default function Login() {
  const { user, loading, signIn, signUp } = useAuth();
  const { t, lang, dir, toggleLang } = useI18n();
  const { toast } = useToast();

  const [mode, setMode] = useState<"staff" | "patient">("staff");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: t("login.error"), description: error.message, variant: "destructive" });
    } else {
      toast({
        title: lang === "ar" ? "تم الإرسال" : "Email Sent",
        description: lang === "ar" ? "تحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور" : "Check your email to reset your password",
      });
      setForgotMode(false);
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

  const features = lang === "ar"
    ? [
        { icon: Shield, text: "حماية كاملة لبيانات المرضى" },
        { icon: Clock, text: "إدارة المواعيد بذكاء" },
        { icon: Users, text: "فريق عمل متكامل" },
      ]
    : [
        { icon: Shield, text: "Complete patient data protection" },
        { icon: Clock, text: "Smart appointment management" },
        { icon: Users, text: "Integrated team workflow" },
      ];

  return (
    <div className="min-h-screen flex bg-background" dir={dir}>
      {/* Left Side - Branding Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={screenshotDashboard}
            alt="Dashboard Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-accent/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top - Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <HeartPulse className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Dr.Doc<span className="text-white/70">.</span>
              </h2>
              <p className="text-xs text-white/60">Smart Clinic System</p>
            </div>
          </motion.div>

          {/* Center - Main Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                {lang === "ar" ? (
                  <>
                    نظام إدارة
                    <br />
                    <span className="text-white/80">العيادات الأذكى</span>
                  </>
                ) : (
                  <>
                    The Smartest
                    <br />
                    <span className="text-white/80">Clinic Management</span>
                  </>
                )}
              </h1>
              <p className="text-lg text-white/70 max-w-md leading-relaxed">
                {lang === "ar"
                  ? "أدِر عيادتك بكفاءة عالية مع نظام متكامل يجمع بين الذكاء الاصطناعي وسهولة الاستخدام."
                  : "Manage your clinic efficiently with an integrated system combining AI and ease of use."
                }
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: lang === "ar" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.15 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/15">
                    <f.icon className="h-5 w-5 text-white/90" />
                  </div>
                  <span className="text-white/85 font-medium">{f.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom - Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex items-center gap-8"
          >
            {[
              { value: "+500", label: lang === "ar" ? "عيادة" : "Clinics" },
              { value: "+50K", label: lang === "ar" ? "مريض" : "Patients" },
              { value: "99.9%", label: lang === "ar" ? "وقت التشغيل" : "Uptime" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <HeartPulse className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-foreground">Dr.Doc</span>
          </div>
          <div className="lg:flex-1" />

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
              title="Toggle Language"
            >
              <Languages className="h-4 w-4" />
            </button>
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
                {lang === "ar" ? "الرئيسية" : "Home"}
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Form Area */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[420px] space-y-6"
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="lg:hidden w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {mode === "staff"
                  ? (forgotMode
                    ? (lang === "ar" ? "استعادة كلمة المرور" : "Reset Password")
                    : isSignUp
                      ? (lang === "ar" ? "إنشاء حساب جديد" : "Create Account")
                      : (lang === "ar" ? "مرحباً بعودتك" : "Welcome Back"))
                  : (lang === "ar" ? "بوابة المريض" : "Patient Portal")
                }
              </h1>
              <p className="text-muted-foreground text-sm">
                {mode === "staff"
                  ? (forgotMode
                    ? (lang === "ar" ? "أدخل بريدك الإلكتروني لاستعادة كلمة المرور" : "Enter your email to reset your password")
                    : isSignUp
                      ? (lang === "ar" ? "أنشئ حسابك وابدأ في إدارة عيادتك" : "Create your account to start managing your clinic")
                      : (lang === "ar" ? "سجّل دخولك للوصول إلى لوحة التحكم" : "Sign in to access your dashboard"))
                  : (lang === "ar" ? "سجّل دخولك لمتابعة مواعيدك وملفك الطبي" : "Sign in to view your appointments and medical records")
                }
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center bg-muted/50 rounded-xl p-1 border border-border/50">
              <button
                onClick={() => { setMode("staff"); setIsSignUp(false); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === "staff"
                    ? "bg-background text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Stethoscope className="h-4 w-4" />
                {lang === "ar" ? "طاقم العيادة" : "Clinic Staff"}
              </button>
              <button
                onClick={() => { setMode("patient"); setIsSignUp(false); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === "patient"
                    ? "bg-background text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="h-4 w-4" />
                {lang === "ar" ? "بوابة المريض" : "Patient Portal"}
              </button>
            </div>

            {/* Staff Form */}
            {mode === "staff" && !forgotMode && (
              <motion.form
                key={isSignUp ? "signup" : "signin"}
                initial={{ opacity: 0, x: isSignUp ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleStaffSubmit}
                className="space-y-4"
              >
                {isSignUp && (
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
                      {t("login.fullName")}
                    </Label>
                    <Input
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder={lang === "ar" ? "د. سلطان الأحمدي" : "Dr. John Smith"}
                      className="h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                      required
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("login.email")}
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="doctor@clinic.com"
                    className="h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors font-en"
                    dir="ltr"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("login.password")}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors font-en pe-10"
                      dir="ltr"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSignUp ? t("login.signUpBtn") : t("login.signInBtn")}
                </Button>

                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => setForgotMode(true)}
                    className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium transition-colors mt-2"
                  >
                    {lang === "ar" ? "نسيت كلمة المرور؟" : "Forgot password?"}
                  </button>
                )}

                {/* Divider */}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-3 text-muted-foreground">
                      {lang === "ar" ? "أو" : "OR"}
                    </span>
                  </div>
                </div>

                {/* Google Sign In */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 gap-2 text-sm font-medium"
                  disabled={submitting}
                  onClick={async () => {
                    setSubmitting(true);
                    const { error } = await lovable.auth.signInWithOAuth("google", {
                      redirect_uri: window.location.origin,
                    });
                    if (error) {
                      toast({ title: t("login.error"), description: error.message, variant: "destructive" });
                    }
                    setSubmitting(false);
                  }}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  {lang === "ar" ? "تسجيل الدخول بحساب Google" : "Sign in with Google"}
                </Button>
              </motion.form>
            )}

            {/* Forgot Password Form */}
            {mode === "staff" && forgotMode && (
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleForgotPassword}
                className="space-y-4"
              >
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/15">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {lang === "ar"
                      ? "💡 أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور."
                      : "💡 Enter your email and we'll send you a link to reset your password."}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("login.email")}
                  </Label>
                  <Input
                    type="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="doctor@clinic.com"
                    className="h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors font-en"
                    dir="ltr"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {lang === "ar" ? "إرسال رابط الاستعادة" : "Send Reset Link"}
                </Button>

                <button
                  type="button"
                  onClick={() => setForgotMode(false)}
                  className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {lang === "ar" ? "العودة لتسجيل الدخول" : "Back to Sign In"}
                </button>
              </motion.form>
            )}

            {/* Patient Form */}
            {mode === "patient" && (
              <motion.form
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                onSubmit={handlePatientSubmit}
                className="space-y-4"
              >
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/15">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {lang === "ar"
                      ? "💡 حساب المريض يتم إنشاؤه بواسطة العيادة. استخدم البيانات التي حصلت عليها من الاستقبال."
                      : "💡 Patient accounts are created by the clinic. Use the credentials provided by reception."
                    }
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("login.email")}
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="patient@email.com"
                    className="h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors font-en"
                    dir="ltr"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("login.password")}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors font-en pe-10"
                      dir="ltr"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {lang === "ar" ? "تسجيل الدخول" : "Sign In"}
                </Button>
              </motion.form>
            )}

            {/* Toggle Signup/Signin */}
            {mode === "staff" && !forgotMode && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {isSignUp ? t("login.hasAccount") : t("login.noAccount")}
                </button>
              </div>
            )}

            {/* Trust Badges */}
            <div className="pt-4 border-t border-border/40">
              <div className="flex items-center justify-center gap-4 flex-wrap text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  {lang === "ar" ? "تشفير كامل" : "Fully Encrypted"}
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  {lang === "ar" ? "متوافق مع HIPAA" : "HIPAA Compliant"}
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  {lang === "ar" ? "دعم 24/7" : "24/7 Support"}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
