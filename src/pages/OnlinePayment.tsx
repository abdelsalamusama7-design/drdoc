import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import {
  Wallet, Smartphone, Upload, CheckCircle2, Clock, ArrowLeft,
  Copy, Loader2, FileImage, AlertCircle, Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PAYMENT_NUMBER = "01032320096";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

const paymentMethods = [
  { id: "instapay", label: "InstaPay", icon: Smartphone, desc: "تحويل فوري عبر انستاباي" },
  { id: "wallet", label: "المحفظة الإلكترونية", icon: Wallet, desc: "فودافون كاش / أورانج / اتصالات" },
];

export default function OnlinePayment() {
  const { toast } = useToast();
  const [params] = useSearchParams();
  const plan = params.get("plan") || "professional";
  const planName = plan === "starter" ? "باقة البداية" : plan === "premium" ? "الباقة المتقدمة" : "الباقة الاحترافية";
  const planPrice = plan === "starter" ? "10,000" : plan === "premium" ? "25,000" : "18,000";

  const [method, setMethod] = useState("instapay");
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const copyNumber = () => {
    navigator.clipboard.writeText(PAYMENT_NUMBER);
    toast({ title: "✅ تم النسخ", description: "تم نسخ الرقم بنجاح" });
  };

  const handleSubmit = async () => {
    if (!senderName.trim() || !senderPhone.trim()) {
      toast({ title: "خطأ", description: "يرجى ملء اسم المرسل ورقم الهاتف", variant: "destructive" });
      return;
    }
    if (!receiptFile) {
      toast({ title: "خطأ", description: "يرجى تحميل صورة الإيصال", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // Upload receipt
      const ext = receiptFile.name.split(".").pop();
      const fileName = `receipts/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from("patient-files")
        .upload(fileName, receiptFile);

      if (uploadError) throw uploadError;

      // Save payment record
      const { error } = await (supabase.from("subscription_payments" as any) as any).insert({
        plan,
        amount: parseFloat(planPrice.replace(",", "")),
        payment_method: method,
        sender_name: senderName,
        sender_phone: senderPhone,
        receipt_path: fileName,
        status: "pending",
      });

      if (error) throw error;

      setSubmitted(true);
      toast({ title: "✅ تم الإرسال بنجاح", description: "سنراجع الإيصال ونؤكد الدفع قريباً" });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
          <div className="bg-card rounded-2xl border border-border p-8 shadow-xl">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <Clock className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">تم استلام طلب الدفع</h1>
            <p className="text-muted-foreground mb-2">
              شكراً لك! تم استلام إيصال الدفع الخاص بك بنجاح.
            </p>
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-warning" />
                <span className="text-sm font-semibold text-warning">في انتظار التأكيد</span>
              </div>
              <p className="text-sm text-muted-foreground">
                سيتم مراجعة الإيصال وتأكيد الدفع خلال <strong className="text-foreground">24 ساعة</strong> كحد أقصى. سنتواصل معك عبر الهاتف أو واتساب للتأكيد.
              </p>
            </div>

            <div className="bg-muted/30 rounded-xl p-4 mb-6 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الباقة</span>
                <span className="font-semibold text-foreground">{planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المبلغ</span>
                <span className="font-semibold text-foreground">{planPrice} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">طريقة الدفع</span>
                <span className="font-semibold text-foreground">{method === "instapay" ? "InstaPay" : "محفظة إلكترونية"}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Link to="/pricing" className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  العودة للأسعار
                </Button>
              </Link>
              <a href={`https://wa.me/201032320096?text=${encodeURIComponent(`مرحباً، أرسلت إيصال دفع لباقة ${planName}. الاسم: ${senderName}`)}`} target="_blank" className="flex-1">
                <Button className="w-full gap-2">
                  تواصل معنا
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/pricing" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            العودة للأسعار
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground">د. خالد جادالله</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <motion.div initial="hidden" animate="show" variants={stagger}>
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">إتمام عملية الدفع</h1>
            <p className="text-muted-foreground">اختر طريقة الدفع وأرسل إيصال التحويل للتأكيد</p>
          </motion.div>

          {/* Plan Summary */}
          <motion.div variants={fadeUp} className="bg-card rounded-2xl border border-border p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">الباقة المختارة</p>
              <p className="text-lg font-bold text-foreground">{planName}</p>
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">المبلغ المطلوب</p>
              <p className="text-2xl font-extrabold text-primary font-en">{planPrice} <span className="text-sm font-normal text-muted-foreground">ج.م</span></p>
            </div>
          </motion.div>

          {/* Payment Method */}
          <motion.div variants={fadeUp} className="mb-6">
            <Label className="text-base font-semibold mb-3 block">اختر طريقة الدفع</Label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`relative p-4 rounded-xl border-2 text-right transition-all ${
                    method === m.id
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  {method === m.id && (
                    <div className="absolute top-2 left-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <m.icon className={`h-8 w-8 mb-2 ${method === m.id ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-bold text-foreground text-sm">{m.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Payment Details */}
          <motion.div variants={fadeUp} className="bg-card rounded-2xl border border-border p-5 mb-6">
            <h3 className="font-bold text-foreground mb-4">بيانات التحويل</h3>
            
            <div className="bg-muted/30 rounded-xl p-4 mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                {method === "instapay" ? "حوّل المبلغ عبر InstaPay على الرقم التالي:" : "حوّل المبلغ على المحفظة الإلكترونية التالية:"}
              </p>
              <div className="flex items-center gap-3 bg-background rounded-lg p-3 border border-border">
                <span className="text-2xl font-bold text-foreground font-en tracking-wider flex-1" dir="ltr">{PAYMENT_NUMBER}</span>
                <Button variant="outline" size="sm" onClick={copyNumber} className="gap-1.5 shrink-0">
                  <Copy className="h-3.5 w-3.5" />
                  نسخ
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {method === "instapay" ? "الاسم: د. خالد جادالله — بنك المشرق" : "فودافون كاش"}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm mb-1.5 block">اسم المرسل *</Label>
                <Input
                  value={senderName}
                  onChange={e => setSenderName(e.target.value)}
                  placeholder="الاسم كما يظهر في التحويل"
                  className="bg-muted/30"
                />
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">رقم هاتف المرسل *</Label>
                <Input
                  value={senderPhone}
                  onChange={e => setSenderPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="bg-muted/30 font-en"
                  dir="ltr"
                />
              </div>
            </div>
          </motion.div>

          {/* Receipt Upload */}
          <motion.div variants={fadeUp} className="bg-card rounded-2xl border border-border p-5 mb-6">
            <h3 className="font-bold text-foreground mb-4">تحميل إيصال التحويل *</h3>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    toast({ title: "خطأ", description: "حجم الملف أكبر من 5 ميجا", variant: "destructive" });
                    return;
                  }
                  setReceiptFile(file);
                }
              }}
            />

            {receiptFile ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-success/5 border border-success/20">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <FileImage className="h-6 w-6 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{receiptFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(receiptFile.size / 1024).toFixed(0)} KB</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setReceiptFile(null); if (fileRef.current) fileRef.current.value = ""; }}>
                  تغيير
                </Button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Upload className="h-7 w-7 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground text-sm">اضغط لتحميل صورة الإيصال</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG أو PDF — حد أقصى 5 ميجا</p>
                </div>
              </button>
            )}
          </motion.div>

          {/* Submit */}
          <motion.div variants={fadeUp}>
            <Button
              className="w-full h-14 text-base shadow-xl shadow-primary/20 gap-2"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
              إرسال إيصال الدفع
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              سيتم مراجعة الإيصال وتأكيد الاشتراك خلال 24 ساعة كحد أقصى
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
