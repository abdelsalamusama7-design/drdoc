import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Gift, Users, Star, Send, Loader2, Check, Copy, Share2,
  MessageCircle, Award, TrendingUp, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useClinic } from "@/hooks/useClinic";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Referral {
  id: string;
  referred_clinic_name: string;
  referred_contact: string;
  referred_phone: string;
  status: string;
  reward_applied: boolean;
  created_at: string;
}

interface Satisfaction {
  id: string;
  rating: number;
  category: string;
  comment: string;
  created_at: string;
}

export default function ClinicReferrals() {
  const { clinic } = useClinic();
  const { user } = useAuth();
  const { toast } = useToast();

  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [satisfaction, setSatisfaction] = useState<Satisfaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [referralForm, setReferralForm] = useState({ name: "", contact: "", phone: "", email: "" });
  const [surveyForm, setSurveyForm] = useState({ rating: 5, category: "general", comment: "" });

  useEffect(() => {
    if (!clinic) return;
    fetchData();
  }, [clinic]);

  const fetchData = async () => {
    if (!clinic) return;
    setLoading(true);
    const [r, s] = await Promise.all([
      (supabase.from("clinic_referrals" as any) as any).select("*").eq("referrer_clinic_id", clinic.id).order("created_at", { ascending: false }),
      (supabase.from("clinic_satisfaction" as any) as any).select("*").eq("clinic_id", clinic.id).order("created_at", { ascending: false }),
    ]);
    setReferrals((r.data || []) as Referral[]);
    setSatisfaction((s.data || []) as Satisfaction[]);
    setLoading(false);
  };

  const submitReferral = async () => {
    if (!clinic || !referralForm.name || !referralForm.contact || !referralForm.phone) {
      toast({ title: "خطأ", description: "يرجى ملء الحقول المطلوبة", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await (supabase.from("clinic_referrals" as any) as any).insert({
        referrer_clinic_id: clinic.id,
        referred_clinic_name: referralForm.name,
        referred_contact: referralForm.contact,
        referred_phone: referralForm.phone,
        referred_email: referralForm.email || null,
      });
      toast({ title: "✅ تم إرسال الإحالة بنجاح", description: "سنتواصل مع العيادة المُحالة وسيتم احتساب مكافأتك عند اشتراكهم" });
      setReferralForm({ name: "", contact: "", phone: "", email: "" });
      fetchData();
    } catch { toast({ title: "خطأ", variant: "destructive" }); }
    setSubmitting(false);
  };

  const submitSurvey = async () => {
    if (!clinic) return;
    setSubmitting(true);
    try {
      await (supabase.from("clinic_satisfaction" as any) as any).insert({
        clinic_id: clinic.id,
        user_id: user?.id,
        rating: surveyForm.rating,
        category: surveyForm.category,
        comment: surveyForm.comment || null,
      });
      toast({ title: "✅ شكراً لتقييمك!" });
      setSurveyForm({ rating: 5, category: "general", comment: "" });
      fetchData();
    } catch { toast({ title: "خطأ", variant: "destructive" }); }
    setSubmitting(false);
  };

  const shareLink = `https://wa.me/201227080430?text=${encodeURIComponent(`مرحباً، عيادة ${clinic?.name || ""} رشحت لي نظام د. خالد جادالله. أريد معرفة المزيد!`)}`;

  const rewards = referrals.filter(r => r.reward_applied).length;
  const pendingRewards = referrals.filter(r => r.status === "converted" && !r.reward_applied).length;
  const avgRating = satisfaction.length > 0 ? (satisfaction.reduce((a, b) => a + b.rating, 0) / satisfaction.length).toFixed(1) : "0";

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><Gift className="h-5 w-5 text-warning" />الإحالات والولاء</h1>
        <p className="text-sm text-muted-foreground">ادعُ عيادات أخرى واحصل على مكافآت مجانية</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "إحالات مرسلة", value: referrals.length, icon: Send, color: "text-primary" },
          { label: "مكافآت مكتسبة", value: rewards, icon: Award, color: "text-warning" },
          { label: "بانتظار التفعيل", value: pendingRewards, icon: Gift, color: "text-success" },
          { label: "متوسط التقييم", value: avgRating, icon: Star, color: "text-accent" },
        ].map(c => (
          <div key={c.label} className="clinic-card p-4">
            <c.icon className={`h-5 w-5 ${c.color} mb-2`} />
            <p className="text-2xl font-bold text-foreground font-en">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="referral" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="referral">إحالة عيادة</TabsTrigger>
          <TabsTrigger value="history">سجل الإحالات</TabsTrigger>
          <TabsTrigger value="satisfaction">رضا العملاء</TabsTrigger>
        </TabsList>

        {/* Referral Form */}
        <TabsContent value="referral" className="space-y-4">
          <div className="clinic-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center"><Gift className="h-5 w-5 text-warning" /></div>
              <div>
                <h3 className="font-bold text-foreground">ادعُ عيادة واحصل على شهر مجاني!</h3>
                <p className="text-xs text-muted-foreground">عند اشتراك العيادة المُحالة، تحصل على شهر مجاني لكل إحالة ناجحة</p>
              </div>
            </div>

            {/* Reward tiers */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { count: "1 إحالة", reward: "شهر مجاني", icon: "🎁" },
                { count: "3 إحالات", reward: "ترقية مجانية", icon: "⭐" },
                { count: "5+ إحالات", reward: "شريك ذهبي", icon: "👑" },
              ].map(r => (
                <div key={r.count} className="p-3 rounded-xl bg-warning/5 border border-warning/20 text-center">
                  <p className="text-xl mb-1">{r.icon}</p>
                  <p className="text-xs font-bold text-foreground">{r.count}</p>
                  <p className="text-[10px] text-muted-foreground">{r.reward}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>اسم العيادة المُحالة *</Label>
                <Input value={referralForm.name} onChange={e => setReferralForm({ ...referralForm, name: e.target.value })} placeholder="عيادة د. محمد" className="mt-1" />
              </div>
              <div>
                <Label>اسم الشخص المسؤول *</Label>
                <Input value={referralForm.contact} onChange={e => setReferralForm({ ...referralForm, contact: e.target.value })} placeholder="د. محمد" className="mt-1" />
              </div>
              <div>
                <Label>رقم الهاتف *</Label>
                <Input value={referralForm.phone} onChange={e => setReferralForm({ ...referralForm, phone: e.target.value })} placeholder="01xxxxxxxxx" className="mt-1" dir="ltr" />
              </div>
              <div>
                <Label>البريد الإلكتروني</Label>
                <Input value={referralForm.email} onChange={e => setReferralForm({ ...referralForm, email: e.target.value })} placeholder="doctor@email.com" className="mt-1" dir="ltr" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button className="flex-1 gap-2" onClick={submitReferral} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}إرسال الإحالة
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => window.open(shareLink, "_blank")}>
                <MessageCircle className="h-4 w-4" />شارك عبر واتساب
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Referral History */}
        <TabsContent value="history">
          <div className="clinic-card">
            {referrals.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">لم ترسل أي إحالات بعد. ابدأ بإحالة عيادة واحصل على مكافآت!</div>
            ) : (
              <div className="divide-y divide-border">
                {referrals.map(r => (
                  <div key={r.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{r.referred_clinic_name}</p>
                      <p className="text-xs text-muted-foreground">{r.referred_contact} · {r.referred_phone}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString("ar-SA")}</p>
                    </div>
                    <div className="text-left">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        r.status === "converted" ? "bg-success/10 text-success" : r.status === "contacted" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                      }`}>
                        {r.status === "converted" ? "✅ مشترك" : r.status === "contacted" ? "📞 تم التواصل" : "⏳ قيد المعالجة"}
                      </span>
                      {r.reward_applied && <p className="text-[10px] text-warning font-semibold mt-1">🎁 مكافأة مُطبقة</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Satisfaction */}
        <TabsContent value="satisfaction" className="space-y-4">
          <div className="clinic-card p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Heart className="h-5 w-5 text-destructive" />قيّم تجربتك مع النظام</h3>
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setSurveyForm({ ...surveyForm, rating: n })} className="transition-transform hover:scale-110">
                  <Star className={`h-8 w-8 ${n <= surveyForm.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                </button>
              ))}
              <span className="text-lg font-bold text-foreground font-en mr-2">{surveyForm.rating}/5</span>
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {[
                { val: "general", label: "عام" },
                { val: "support", label: "الدعم الفني" },
                { val: "features", label: "المميزات" },
                { val: "performance", label: "الأداء" },
                { val: "pricing", label: "السعر" },
              ].map(c => (
                <button key={c.val} onClick={() => setSurveyForm({ ...surveyForm, category: c.val })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${surveyForm.category === c.val ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {c.label}
                </button>
              ))}
            </div>
            <Textarea value={surveyForm.comment} onChange={e => setSurveyForm({ ...surveyForm, comment: e.target.value })} placeholder="أخبرنا المزيد عن تجربتك..." rows={3} className="mb-4" />
            <Button className="w-full gap-2" onClick={submitSurvey} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}إرسال التقييم
            </Button>
          </div>

          {satisfaction.length > 0 && (
            <div className="clinic-card p-6">
              <h3 className="font-bold text-foreground mb-3">التقييمات السابقة</h3>
              <div className="space-y-3">
                {satisfaction.slice(0, 5).map(s => (
                  <div key={s.id} className="p-3 rounded-xl bg-muted/30 flex items-start gap-3">
                    <div className="flex items-center gap-0.5">{Array.from({ length: s.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-warning text-warning" />)}</div>
                    <div className="flex-1">
                      {s.comment && <p className="text-sm text-foreground">{s.comment}</p>}
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(s.created_at).toLocaleDateString("ar-SA")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
