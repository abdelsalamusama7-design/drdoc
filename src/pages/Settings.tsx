import { useState } from "react";
import { motion } from "framer-motion";
import { User, Shield, Bell, Globe, Database, Download, Upload, Cloud, HardDrive, CheckCircle2, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useClinic } from "@/hooks/useClinic";
import { useToast } from "@/hooks/use-toast";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "tween" as const, ease: [0.2, 0, 0, 1] as const, duration: 0.25 },
};

const BACKUP_TABLES = [
  "patients",
  "appointments",
  "visits",
  "payments",
  "prescriptions",
  "prescription_medications",
  "services",
  "doctor_notes",
  "medical_alerts",
  "follow_ups",
  "therapy_sessions",
  "inventory_items",
  "expenses",
  "patient_files",
  "patient_ratings",
  "queue_entries",
  "visit_services",
] as const;

async function fetchAllData(clinicId: string | null) {
  const backup: Record<string, unknown[]> = {};
  for (const table of BACKUP_TABLES) {
    let query = supabase.from(table).select("*");
    if (clinicId) {
      query = query.eq("clinic_id", clinicId);
    }
    const { data } = await query;
    if (data && data.length > 0) {
      backup[table] = data;
    }
  }
  return backup;
}

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function SettingsPage() {
  const { currentClinicId } = useClinic();
  const { toast } = useToast();
  const [localBackupLoading, setLocalBackupLoading] = useState(false);
  const [cloudBackupLoading, setCloudBackupLoading] = useState(false);
  const [lastLocalBackup, setLastLocalBackup] = useState<string | null>(null);
  const [lastCloudBackup, setLastCloudBackup] = useState<string | null>(null);

  const handleLocalBackup = async () => {
    setLocalBackupLoading(true);
    try {
      const data = await fetchAllData(currentClinicId);
      const backupPayload = {
        version: "1.0",
        created_at: new Date().toISOString(),
        clinic_id: currentClinicId,
        tables: data,
      };
      const date = new Date().toISOString().slice(0, 10);
      downloadJson(backupPayload, `smart-clinic-backup-${date}.json`);
      setLastLocalBackup(new Date().toLocaleString("ar-EG"));
      toast({ title: "تم التحميل", description: "تم تحميل النسخة الاحتياطية على جهازك بنجاح" });
    } catch (e) {
      toast({ title: "خطأ", description: "حدث خطأ أثناء إنشاء النسخة الاحتياطية", variant: "destructive" });
    } finally {
      setLocalBackupLoading(false);
    }
  };

  const handleCloudBackup = async () => {
    setCloudBackupLoading(true);
    try {
      const data = await fetchAllData(currentClinicId);
      const backupPayload = {
        version: "1.0",
        created_at: new Date().toISOString(),
        clinic_id: currentClinicId,
        tables: data,
      };
      const date = new Date().toISOString().slice(0, 10);
      const fileName = `backups/clinic-${currentClinicId || "all"}/backup-${date}.json`;
      const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: "application/json" });
      const file = new File([blob], `backup-${date}.json`, { type: "application/json" });

      const { error } = await supabase.storage
        .from("clinic-backups")
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      setLastCloudBackup(new Date().toLocaleString("ar-EG"));
      toast({ title: "تم الحفظ", description: "تم حفظ النسخة الاحتياطية على السحابة بنجاح" });
    } catch (e: any) {
      console.error("Cloud backup error:", e);
      toast({
        title: "خطأ في النسخ السحابي",
        description: e?.message || "حدث خطأ أثناء رفع النسخة الاحتياطية",
        variant: "destructive",
      });
    } finally {
      setCloudBackupLoading(false);
    }
  };

  return (
    <motion.div {...pageTransition} className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">الإعدادات</h1>

      {/* Backup Section */}
      <div className="clinic-card p-4 lg:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">النسخ الاحتياطي</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          احفظ نسخة احتياطية من بيانات العيادة (المرضى، المواعيد، الزيارات، المدفوعات، الوصفات، المخزون وغيرها)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Local Backup */}
          <div className="border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <HardDrive className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">نسخة على الجهاز</p>
                <p className="text-[11px] text-muted-foreground">تحميل ملف JSON على جهازك</p>
              </div>
            </div>
            {lastLocalBackup && (
              <div className="flex items-center gap-1.5 text-[11px] text-green-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>آخر نسخة: {lastLocalBackup}</span>
              </div>
            )}
            <Button
              onClick={handleLocalBackup}
              disabled={localBackupLoading}
              variant="outline"
              className="w-full gap-2"
              size="sm"
            >
              {localBackupLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {localBackupLoading ? "جاري التحميل..." : "تحميل نسخة احتياطية"}
            </Button>
          </div>

          {/* Cloud Backup */}
          <div className="border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Cloud className="h-4.5 w-4.5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">نسخة سحابية</p>
                <p className="text-[11px] text-muted-foreground">حفظ على السحابة تلقائياً</p>
              </div>
            </div>
            {lastCloudBackup && (
              <div className="flex items-center gap-1.5 text-[11px] text-green-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>آخر نسخة: {lastCloudBackup}</span>
              </div>
            )}
            <Button
              onClick={handleCloudBackup}
              disabled={cloudBackupLoading}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              {cloudBackupLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {cloudBackupLoading ? "جاري الحفظ..." : "حفظ نسخة سحابية"}
            </Button>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="clinic-card p-4 lg:p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">الملف الشخصي</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>الاسم</Label>
            <Input defaultValue="د. سلطان الأحمدي" className="mt-1.5" />
          </div>
          <div>
            <Label>البريد الإلكتروني</Label>
            <Input defaultValue="dr.sultan@clinic.com" className="mt-1.5 font-en" dir="ltr" />
          </div>
          <div>
            <Label>رقم الهاتف</Label>
            <Input defaultValue="0501234567" className="mt-1.5 font-en" dir="ltr" />
          </div>
          <div>
            <Label>التخصص</Label>
            <Input defaultValue="أمراض الذكورة والعقم" className="mt-1.5" />
          </div>
        </div>
        <Button size="sm" className="mt-4">تحديث الملف الشخصي</Button>
      </div>

      {/* Roles */}
      <div className="clinic-card p-4 lg:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">الصلاحيات والأدوار</h2>
        </div>
        <div className="space-y-3">
          {[
            { name: "د. سلطان الأحمدي", role: "admin", roleLabel: "مدير" },
            { name: "نورة العتيبي", role: "receptionist", roleLabel: "موظفة استقبال" },
            { name: "د. فيصل الحربي", role: "doctor", roleLabel: "طبيب" },
          ].map((user, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.roleLabel}</p>
                </div>
              </div>
              <Select defaultValue={user.role}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">مدير</SelectItem>
                  <SelectItem value="doctor">طبيب</SelectItem>
                  <SelectItem value="receptionist">استقبال</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="clinic-card p-4 lg:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">الإشعارات</h2>
        </div>
        <div className="space-y-4">
          {[
            { label: "تذكير المواعيد", description: "إرسال تذكير للمرضى قبل الموعد" },
            { label: "تنبيهات المتابعة", description: "تنبيه عند وجود مرضى لم يعودوا" },
            { label: "تقارير يومية", description: "إرسال ملخص يومي" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Switch defaultChecked={i < 2} />
            </div>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="clinic-card p-4 lg:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">اللغة</h2>
        </div>
        <Select defaultValue="ar">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ar">العربية</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
}
