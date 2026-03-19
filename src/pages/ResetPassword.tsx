import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Loader2, HeartPulse, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const { lang, dir } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get("type") === "recovery") {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: lang === "ar" ? "خطأ" : "Error",
        description: lang === "ar" ? "كلمتا المرور غير متطابقتين" : "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: lang === "ar" ? "خطأ" : "Error",
        description: lang === "ar" ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({
        title: lang === "ar" ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: lang === "ar" ? "تم بنجاح" : "Success",
        description: lang === "ar" ? "تم تغيير كلمة المرور بنجاح" : "Password updated successfully",
      });
      navigate("/login");
    }
    setSubmitting(false);
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir={dir}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 p-8"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">
            {lang === "ar" ? "جارٍ التحقق من الرابط..." : "Verifying link..."}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4" dir={dir}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] space-y-6"
      >
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <HeartPulse className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {lang === "ar" ? "تعيين كلمة مرور جديدة" : "Set New Password"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {lang === "ar" ? "أدخل كلمة المرور الجديدة لحسابك" : "Enter your new password below"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              {lang === "ar" ? "كلمة المرور الجديدة" : "New Password"}
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <div className="space-y-1.5">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              {lang === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
            </Label>
            <Input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors font-en"
              dir="ltr"
              minLength={6}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20"
            disabled={submitting}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {lang === "ar" ? "تحديث كلمة المرور" : "Update Password"}
          </Button>
        </form>

        <div className="pt-4 border-t border-border/40">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              {lang === "ar" ? "تشفير كامل" : "Fully Encrypted"}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
