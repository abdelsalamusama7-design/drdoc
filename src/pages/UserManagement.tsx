import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Shield, ShieldCheck, UserCog, Trash2, Loader2,
  ChevronDown, Mail, Phone, Stethoscope, Clock, Search,
  AlertTriangle, Check, X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
  role: "admin" | "doctor" | "receptionist" | null;
}

const roleLabels: Record<string, string> = {
  admin: "مدير",
  doctor: "طبيب",
  receptionist: "موظف استقبال",
};

const roleColors: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive",
  doctor: "bg-primary/10 text-primary",
  receptionist: "bg-accent/10 text-accent",
};

const roleIcons: Record<string, typeof Shield> = {
  admin: ShieldCheck,
  doctor: Stethoscope,
  receptionist: UserCog,
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
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  if (role !== "admin") return <Navigate to="/" replace />;

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
    fetchUsers();
  }, []);

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
            إدارة حسابات الموظفين وصلاحياتهم
          </p>
        </div>
        <Button onClick={fetchUsers} variant="outline" size="sm" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "تحديث"}
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "إجمالي", count: roleCounts.all, color: "text-foreground", bg: "bg-muted" },
          { label: "مدراء", count: roleCounts.admin, color: "text-destructive", bg: "bg-destructive/10" },
          { label: "أطباء", count: roleCounts.doctor, color: "text-primary", bg: "bg-primary/10" },
          { label: "استقبال", count: roleCounts.receptionist, color: "text-accent", bg: "bg-accent/10" },
          { label: "بدون دور", count: roleCounts.none, color: "text-warning", bg: "bg-warning/10" },
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
            {(["admin", "doctor", "receptionist"] as const).map((r) => {
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
                       "وصول للمرضى والمواعيد فقط"}
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
