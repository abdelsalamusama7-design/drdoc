import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Loader2, Stethoscope, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";

const plans = [
  { value: "starter", label: "Starter Clinic", price: "10,000 ج.م" },
  { value: "professional", label: "Professional Clinic", price: "18,000 ج.م" },
  { value: "premium", label: "Premium Clinic", price: "25,000 ج.م" },
];

export default function RegisterClinic() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    name_en: "",
    phone: "",
    email: "",
    address: "",
    plan: "professional",
  });

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `clinic-${Date.now()}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", variant: "destructive" });
      return;
    }
    if (!form.name.trim()) {
      toast({ title: "خطأ", description: "اسم العيادة مطلوب", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const slug = generateSlug(form.name_en || form.name);
      const maxUsers = form.plan === "starter" ? 3 : form.plan === "professional" ? 10 : 999;

      const { data: clinic, error } = await (supabase.from("clinics" as any) as any)
        .insert({
          name: form.name,
          name_en: form.name_en || null,
          slug,
          phone: form.phone || null,
          email: form.email || null,
          address: form.address || null,
          subscription_plan: form.plan,
          max_users: maxUsers,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add user as clinic member
      await (supabase.from("clinic_members" as any) as any)
        .insert({ clinic_id: clinic.id, user_id: user.id, role: "owner" });

      toast({ title: "تم بنجاح", description: "تم إنشاء العيادة بنجاح" });
      navigate("/");
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="clinic-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">تسجيل عيادة جديدة</h1>
              <p className="text-sm text-muted-foreground">أنشئ حساب عيادتك وابدأ فوراً</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>اسم العيادة (عربي) *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="عيادة د. أحمد"
                  required
                />
              </div>
              <div>
                <Label>Clinic Name (English)</Label>
                <Input
                  value={form.name_en}
                  onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                  placeholder="Dr. Ahmed Clinic"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الهاتف</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                />
              </div>
              <div>
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="info@clinic.com"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <Label>العنوان</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="القاهرة، مصر"
              />
            </div>

            <div>
              <Label>الباقة</Label>
              <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label} — {p.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Stethoscope className="h-4 w-4" />}
              إنشاء العيادة
            </Button>

            <Link to="/" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              العودة للوحة التحكم
            </Link>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
