import { motion } from "framer-motion";
import { User, Shield, Bell, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "tween" as const, ease: [0.2, 0, 0, 1], duration: 0.25 },
};

export default function SettingsPage() {
  return (
    <motion.div {...pageTransition} className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">الإعدادات</h1>

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
