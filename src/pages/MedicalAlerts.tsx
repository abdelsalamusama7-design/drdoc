import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useClinic } from "@/hooks/useClinic";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { usePatients } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Plus, Shield, Pill, Heart, Search } from "lucide-react";
import { motion } from "framer-motion";

interface MedicalAlert {
  id: string;
  patient_id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-muted text-muted-foreground border-border",
};

const ALERT_ICONS: Record<string, any> = {
  allergy: AlertTriangle,
  drug_interaction: Pill,
  chronic_disease: Heart,
  other: Shield,
};

export default function MedicalAlerts() {
  const { clinic } = useClinic();
  const { user } = useAuth();
  const { lang } = useI18n();
  const { data: patients } = usePatients();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<MedicalAlert[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ patient_id: "", alert_type: "allergy", severity: "medium", title: "", description: "" });

  const fetchAlerts = useCallback(async () => {
    let query = (supabase.from("medical_alerts" as any) as any).select("*").order("created_at", { ascending: false });
    if (clinic?.id) query = query.eq("clinic_id", clinic.id);
    const { data } = await query;
    if (data) setAlerts(data);
  }, [clinic?.id]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  async function handleCreate() {
    if (!form.title || !form.patient_id) return;
    const { error } = await (supabase.from("medical_alerts" as any) as any).insert({
      ...form, clinic_id: clinic?.id, created_by: user?.id, is_active: true,
    });
    if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    toast({ title: lang === "ar" ? "تم إضافة التنبيه" : "Alert added" });
    setDialogOpen(false);
    setForm({ patient_id: "", alert_type: "allergy", severity: "medium", title: "", description: "" });
    fetchAlerts();
  }

  const filtered = alerts.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    patients.find(p => p.id === a.patient_id)?.name.includes(search)
  );

  const getPatientName = (id: string) => patients.find(p => p.id === id)?.name || id;

  return (
    <div className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            {lang === "ar" ? "التنبيهات الطبية" : "Medical Alerts"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "ar" ? "تنبيهات الحساسية والأمراض المزمنة وتفاعلات الأدوية" : "Allergy, chronic disease & drug interaction alerts"}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> {lang === "ar" ? "تنبيه جديد" : "New Alert"}</Button>
          </DialogTrigger>
          <DialogContent dir={lang === "ar" ? "rtl" : "ltr"}>
            <DialogHeader>
              <DialogTitle>{lang === "ar" ? "إضافة تنبيه طبي" : "Add Medical Alert"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Select value={form.patient_id} onValueChange={v => setForm({ ...form, patient_id: v })}>
                <SelectTrigger><SelectValue placeholder={lang === "ar" ? "اختر المريض" : "Select patient"} /></SelectTrigger>
                <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.alert_type} onValueChange={v => setForm({ ...form, alert_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allergy">{lang === "ar" ? "حساسية" : "Allergy"}</SelectItem>
                    <SelectItem value="drug_interaction">{lang === "ar" ? "تفاعل دوائي" : "Drug Interaction"}</SelectItem>
                    <SelectItem value="chronic_disease">{lang === "ar" ? "مرض مزمن" : "Chronic Disease"}</SelectItem>
                    <SelectItem value="other">{lang === "ar" ? "أخرى" : "Other"}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={form.severity} onValueChange={v => setForm({ ...form, severity: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">{lang === "ar" ? "عالية" : "High"}</SelectItem>
                    <SelectItem value="medium">{lang === "ar" ? "متوسطة" : "Medium"}</SelectItem>
                    <SelectItem value="low">{lang === "ar" ? "منخفضة" : "Low"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input placeholder={lang === "ar" ? "عنوان التنبيه" : "Alert title"} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder={lang === "ar" ? "تفاصيل التنبيه" : "Alert details"} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <Button className="w-full" onClick={handleCreate}>{lang === "ar" ? "إضافة" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pr-9" placeholder={lang === "ar" ? "بحث..." : "Search..."} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: lang === "ar" ? "إجمالي التنبيهات" : "Total", value: alerts.length, color: "text-foreground" },
          { label: lang === "ar" ? "خطورة عالية" : "High Severity", value: alerts.filter(a => a.severity === "high").length, color: "text-destructive" },
          { label: lang === "ar" ? "حساسية" : "Allergies", value: alerts.filter(a => a.alert_type === "allergy").length, color: "text-warning" },
          { label: lang === "ar" ? "تفاعلات دوائية" : "Drug Interactions", value: alerts.filter(a => a.alert_type === "drug_interaction").length, color: "text-primary" },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-muted-foreground">{lang === "ar" ? "لا توجد تنبيهات" : "No alerts"}</CardContent></Card>
        ) : (
          filtered.map((alert, i) => {
            const Icon = ALERT_ICONS[alert.alert_type] || Shield;
            return (
              <motion.div key={alert.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className={`border ${SEVERITY_COLORS[alert.severity] || ""}`}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{alert.title}</h3>
                        <Badge variant="outline" className="text-[10px]">
                          {alert.alert_type === "allergy" ? (lang === "ar" ? "حساسية" : "Allergy") :
                           alert.alert_type === "drug_interaction" ? (lang === "ar" ? "تفاعل دوائي" : "Drug") :
                           alert.alert_type === "chronic_disease" ? (lang === "ar" ? "مرض مزمن" : "Chronic") :
                           (lang === "ar" ? "أخرى" : "Other")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{getPatientName(alert.patient_id)}</p>
                      {alert.description && <p className="text-xs mt-1">{alert.description}</p>}
                    </div>
                    <Badge variant={alert.severity === "high" ? "destructive" : "secondary"} className="text-[10px] shrink-0">
                      {alert.severity === "high" ? (lang === "ar" ? "عالية" : "High") :
                       alert.severity === "medium" ? (lang === "ar" ? "متوسطة" : "Medium") :
                       (lang === "ar" ? "منخفضة" : "Low")}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
