import { useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, Loader2, Moon, Sun, Languages } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { user, loading, signIn, signUp } = useAuth();
  const { t, lang, dir, toggleLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (isSignUp && !fullName.trim()) return;

    setSubmitting(true);
    const { error } = isSignUp
      ? await signUp(email.trim(), password, fullName.trim())
      : await signIn(email.trim(), password);

    if (error) {
      toast({
        title: t("login.error"),
        description: error.message,
        variant: "destructive",
      });
    } else if (isSignUp) {
      toast({
        title: t("login.accountCreated"),
        description: t("login.welcomeMsg"),
      });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir={dir}>
      {/* Top corner controls */}
      <div className="fixed top-4 left-4 flex items-center gap-1 z-10">
        <button
          onClick={toggleLang}
          className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
        >
          <Languages className="h-4 w-4" />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <div className="clinic-card p-6 lg:p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Stethoscope className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">
              Smart Clinic<span className="text-primary">.</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isSignUp ? t("login.signup") : t("login.title")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <Label>{t("login.fullName")}</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={lang === "ar" ? "د. سلطان الأحمدي" : "Dr. John Smith"}
                  className="mt-1.5"
                  required
                />
              </div>
            )}
            <div>
              <Label>{t("login.email")}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@clinic.com"
                className="mt-1.5 font-en"
                dir="ltr"
                required
              />
            </div>
            <div>
              <Label>{t("login.password")}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 font-en"
                dir="ltr"
                minLength={6}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSignUp ? t("login.signUpBtn") : t("login.signInBtn")}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp ? t("login.hasAccount") : t("login.noAccount")}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
