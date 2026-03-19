import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Shield, ShieldCheck, UserCog, Trash2, Loader2,
  Mail, Phone, Stethoscope, Search,
  AlertTriangle, Check, UserPlus, Eye, EyeOff, Lock, Calculator
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from "@/components/ui/dialog";

interface ManagedUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  full_name: string;
  phone: string;
  specialty: string;
  role: "admin" | "doctor" | "receptionist" | "accountant" | "patient" | null;
}

const roleLabels: Record<string, string> = {
  admin: "مدير",
  doctor: "طبيب",
  receptionist: "موظف استقبال",
  accountant: "محاسب",
  patient: "مريض",
};

const roleColors: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive",
  doctor: "bg-primary/10 text-primary",
  receptionist: "bg-accent/10 text-accent",
  accountant: "bg-warning/10 text-warning",
  patient: "bg-success/10 text-success",
};

const roleIcons: Record<string, typeof Shield> = {
  admin: ShieldCheck,
  doctor: Stethoscope,
  receptionist: UserCog,
  accountant: Calculator,
  patient: Users,
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function UserManagement() {
  const { role, user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleDialog, setRoleDialog] = useState<{ open: boolean; user: ManagedUser | null }>({ open: false, user: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: ManagedUser | null }>({ open: false, user: null });
  const [createDialog, setCreateDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  // Create user form
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newRole, setNewRole] = useState<string>("doctor");
  const [showPassword, setShowPassword] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await supabase.functions.invoke("admin-users", {
        method: "GET",
      });

      if (res.error) throw res.error;
      setUsers(res.data as ManagedUser[]);
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (role === "admin") fetchUsers();
  }, [role]);

  if (role !== "admin") return <Navigate to="/" replace />;

  const resetCreateForm = () => {
    setNewEmail("");
    setNewPassword("");
    setNewFullName("");
    setNewPhone("");
    setNewSpecialty("");
    setNewRole("doctor");
    setShowPassword(false);
  };

  const handleCreateUser = async () => {
    if (!newEmail.trim() || !newPassword || !newRole) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "خطأ", description: "كلمة المرور يجب أن تكون ٦ أحرف على الأقل", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await supabase.functions.invoke("admin-users", {
        body: {
          action: "create_user",
          email: newEmail.trim(),
          password: newPassword,
          full_name: newFullName.trim(),
          phone: newPhone.trim(),
          specialty: newSpecialty.trim(),
          role: newRole,
        },
      });
      if (res.error) throw res.error;
      if (res.data?.error) throw new Error(res.data.error);

      toast({ title: "تم إنشاء الحساب", description: `تم إنشاء حساب ${newFullName || newEmail} بنجاح` });
      setCreateDialog(false);
      resetCreateForm();
      fetchUsers();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleAssignRole = async () => {
    if (!roleDialog.user || !selectedRole) return;
    setSubmitting(true);
    try {
      const res = await supabase.functions.invoke("admin-users", {
        body: {
          action: "assign_role",
          user_id: roleDialog.user.id,
          role: selectedRole,
        },
      });
      if (res.error) throw res.error;
      toast({ title: "تم تحديث الدور", description: `تم تعيين ${roleLabels[selectedRole]} بنجاح` });
      setRoleDialog({ open: false, user: null });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleDeleteUser = async () => {
    if (!deleteDialog.user) return;
    setSubmitting(true);
    try {
      const res = await supabase.functions.invoke("admin-users", {
        body: {
          action: "delete_user",
          user_id: deleteDialog.user.id,
        },
      });
      if (res.error) throw res.error;
      toast({ title: "تم حذف المستخدم", description: "تم حذف الحساب بنجاح" });
      setDeleteDialog({ open: false, user: null });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
  );

  const roleCounts = {
    all: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    doctor: users.filter((u) => u.role === "doctor").length,
    receptionist: users.filter((u) => u.role === "receptionist").length,
    accountant: users.filter((u) => u.role === "accountant").length,
    patient: users.filter((u) => u.role === "patient").length,
    none: users.filter((u) => !u.role).length,
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            إدارة المستخدمين
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة حسابات الموظفين والمرضى وصلاحياتهم
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setCreateDialog(true)}
            size="sm"
            className="gap-1.5"
          >
            <UserPlus className="h-4 w-4" />
            إضافة مستخدم
          </Button>
          <Button onClick={fetchUsers} variant="outline" size="sm" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "تحديث"}
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-4 sm:grid-cols-7 gap-3">
        {[
          { label: "إجمالي", count: roleCounts.all, color: "text-foreground", bg: "bg-muted" },
          { label: "مدراء", count: roleCounts.admin, color: "text-destructive", bg: "bg-destructive/10" },
          { label: "أطباء", count: roleCounts.doctor, color: "text-primary", bg: "bg-primary/10" },
          { label: "استقبال", count: roleCounts.receptionist, color: "text-accent", bg: "bg-accent/10" },
          { label: "محاسبين", count: roleCounts.accountant, color: "text-warning", bg: "bg-warning/10" },
          { label: "مرضى", count: roleCounts.patient, color: "text-success", bg: "bg-success/10" },
          { label: "بدون دور", count: roleCounts.none, color: "text-muted-foreground", bg: "bg-muted" },
        ].map((s) => (
          <div key={s.label} className="clinic-card p-3 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div variants={item}>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو البريد أو الهاتف..."
            className="w-full h-10 pr-9 pl-4 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div variants={item} className="clinic-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="h-8 w-8 mb-2" />
            <p className="text-sm">لا يوجد مستخدمين</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-[10px] text-muted-foreground font-medium text-right px-4 py-3">المستخدم</th>
                  <th className="text-[10px] text-muted-foreground font-medium text-right px-4 py-3 hidden sm:table-cell">البريد</th>
                  <th className="text-[10px] text-muted-foreground font-medium text-right px-4 py-3 hidden md:table-cell">التخصص</th>
                  <th className="text-[10px] text-muted-foreground font-medium text-right px-4 py-3">الدور</th>
                  <th className="text-[10px] text-muted-foreground font-medium text-right px-4 py-3 hidden lg:table-cell">آخر دخول</th>
                  <th className="text-[10px] text-muted-foreground font-medium text-right px-4 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredUsers.map((u, idx) => {
                  const RoleIcon = u.role ? roleIcons[u.role] : Shield;
                  const isSelf = u.id === user?.id;
                  return (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                            {u.full_name ? u.full_name.charAt(0) : u.email?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[12px] font-semibold text-foreground">
                              {u.full_name || "—"}
                              {isSelf && (
                                <span className="text-[9px] text-primary font-normal mr-1">(أنت)</span>
                              )}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-en sm:hidden">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-[11px] text-muted-foreground font-en">{u.email}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-[11px] text-muted-foreground">{u.specialty || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        {u.role ? (
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg font-medium ${roleColors[u.role]}`}>
                            <RoleIcon className="h-3 w-3" />
                            {roleLabels[u.role]}
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-1 rounded-lg font-medium bg-warning/10 text-warning">
                            بدون دور
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-[10px] text-muted-foreground font-en">
                          {u.last_sign_in_at
                            ? new Date(u.last_sign_in_at).toLocaleDateString("ar-SA", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "لم يسجل دخول"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedRole(u.role || "doctor");
                              setRoleDialog({ open: true, user: u });
                            }}
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                            title="تغيير الدور"
                          >
                            <UserCog className="h-3.5 w-3.5" />
                          </button>
                          {!isSelf && (
                            <button
                              onClick={() => setDeleteDialog({ open: true, user: u })}
                              className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                              title="حذف المستخدم"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Create User Dialog */}
      <Dialog open={createDialog} onOpenChange={(o) => { setCreateDialog(o); if (!o) resetCreateForm(); }}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              إضافة مستخدم جديد
            </DialogTitle>
            <DialogDescription>
              أنشئ حساب جديد وحدد دوره في النظام (موظف أو مريض)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Full Name */}
            <div>
              <Label className="text-[12px]">الاسم الكامل <span className="text-destructive">*</span></Label>
              <Input
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="د. سلطان الأحمدي"
                className="mt-1.5"
                maxLength={100}
              />
            </div>

            {/* Email */}
            <div>
              <Label className="text-[12px]">البريد الإلكتروني <span className="text-destructive">*</span></Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="staff@clinic.com"
                  className="pl-9 font-en"
                  dir="ltr"
                  maxLength={255}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label className="text-[12px]">كلمة المرور <span className="text-destructive">*</span></Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-9 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="٦ أحرف على الأقل"
                  className="pl-16 font-en"
                  dir="ltr"
                  minLength={6}
                  maxLength={128}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Phone */}
            <div>
              <Label className="text-[12px]">الهاتف {newRole === "patient" && <span className="text-destructive">*</span>}</Label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="pl-9 font-en"
                  dir="ltr"
                  maxLength={20}
                />
              </div>
              {newRole === "patient" && (
                <p className="text-[10px] text-muted-foreground mt-1">⚠️ يجب أن يكون نفس الرقم المسجل في ملف المريض</p>
              )}
            </div>

            {/* Specialty - only for non-patient */}
            {newRole !== "patient" && (
              <div>
                <Label className="text-[12px]">التخصص</Label>
                <Input
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="طب الذكورة"
                  className="mt-1.5"
                  maxLength={100}
                />
              </div>
            )}

            {/* Role Selection */}
            <div>
              <Label className="text-[12px] mb-2 block">الدور <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(["doctor", "receptionist", "accountant", "admin", "patient"] as const).map((r) => {
                  const Icon = roleIcons[r];
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewRole(r)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                        newRole === r
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        newRole === r ? roleColors[r] : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-[11px] font-medium text-foreground">{roleLabels[r]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setCreateDialog(false); resetCreateForm(); }}>
              إلغاء
            </Button>
            <Button onClick={handleCreateUser} disabled={submitting} className="gap-1.5">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              إنشاء الحساب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Assignment Dialog */}
      <Dialog open={roleDialog.open} onOpenChange={(o) => setRoleDialog({ open: o, user: o ? roleDialog.user : null })}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعيين الدور</DialogTitle>
            <DialogDescription>
              اختر الدور لـ {roleDialog.user?.full_name || roleDialog.user?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {(["admin", "doctor", "receptionist", "accountant", "patient"] as const).map((r) => {
              const Icon = roleIcons[r];
              return (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-right ${
                    selectedRole === r
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedRole === r ? roleColors[r] : "bg-muted text-muted-foreground"
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{roleLabels[r]}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {r === "admin" ? "وصول كامل لجميع الأقسام" :
                       r === "doctor" ? "وصول للمرضى والمواعيد والوصفات" :
                       r === "receptionist" ? "وصول للمرضى والمواعيد فقط" :
                       "بوابة المريض - عرض السجل والمواعيد"}
                    </p>
                  </div>
                  {selectedRole === r && <Check className="h-4 w-4 text-primary mr-auto" />}
                </button>
              );
            })}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRoleDialog({ open: false, user: null })}>إلغاء</Button>
            <Button onClick={handleAssignRole} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "تأكيد"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(o) => setDeleteDialog({ open: o, user: o ? deleteDialog.user : null })}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              حذف المستخدم
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف حساب <strong>{deleteDialog.user?.full_name || deleteDialog.user?.email}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, user: null })}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "حذف نهائي"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
