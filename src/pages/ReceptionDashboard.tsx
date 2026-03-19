import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, CalendarDays, Plus, UserPlus, Upload, FileText,
  Loader2, Clock, Search
} from "lucide-react";
import { Link } from "react-router-dom";
import { usePatients, useAppointments, useAllVisits, createVisit } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const anim = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25 } };

export default function ReceptionDashboard() {
  const today = new Date().toISOString().split("T")[0];
  const { data: patients, loading: pLoading } = usePatients();
  const { data: todayApts, loading: aLoading } = useAppointments(today);
  const { data: visits } = useAllVisits();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showNewVisit, setShowNewVisit] = useState(false);
  const [visitForm, setVisitForm] = useState({
    patientId: "", visitType: "diagnostic", paymentType: "paid",
  });
  const [submitting, setSubmitting] = useState(false);

  const todayVisits = visits.filter(v => v.date === today);
  const pendingVisits = todayVisits.filter(v => v.status === "pending");

  const handleCreateVisit = async () => {
    if (!visitForm.patientId) {
      toast({ title: "خطأ", description: "اختر مريض أولاً", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await createVisit({
        patient_id: visitForm.patientId,
        appointment_id: null,
        date: today,
        time: new Date().toTimeString().split(" ")[0],
        visit_type: visitForm.visitType,
        payment_type: visitForm.paymentType,
        status: "pending",
        doctor_notes: null,
        diagnosis: null,
        created_by: user?.id || null,
      });
      toast({ title: "تم", description: "تم إنشاء الزيارة بنجاح" });
      setShowNewVisit(false);
      setVisitForm({ patientId: "", visitType: "diagnostic", paymentType: "paid" });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  if (pLoading || aLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div {...anim} className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">لوحة الاستقبال</h1>
          <p className="text-xs text-muted-foreground mt-0.5">إدارة المرضى والزيارات</p>
        </div>
        <div className="flex gap-2">
          <Link to="/patients">
            <Button size="sm" variant="outline" className="gap-1.5">
              <UserPlus className="h-4 w-4" />مريض جديد
            </Button>
          </Link>
          <Button size="sm" onClick={() => setShowNewVisit(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />زيارة جديدة
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "مرضى اليوم", value: todayApts.length, icon: Users, color: "text-primary", bg: "bg-primary/10" },
          { label: "مواعيد اليوم", value: todayApts.length, icon: CalendarDays, color: "text-accent", bg: "bg-accent/10" },
          { label: "زيارات اليوم", value: todayVisits.length, icon: FileText, color: "text-success", bg: "bg-success/10" },
          { label: "في الانتظار", value: pendingVisits.length, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
        ].map((stat, i) => (
          <div key={i} className="clinic-card p-4">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`h-[18px] w-[18px] ${stat.color}`} />
            </div>
            <p className="stat-value text-foreground font-en">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "إضافة مريض", icon: UserPlus, path: "/patients", color: "text-primary", bg: "bg-primary/10" },
          { label: "حجز موعد", icon: CalendarDays, path: "/appointments", color: "text-accent", bg: "bg-accent/10" },
          { label: "رفع ملفات", icon: Upload, path: "/patients", color: "text-success", bg: "bg-success/10" },
          { label: "بحث مريض", icon: Search, path: "/patients", color: "text-warning", bg: "bg-warning/10" },
        ].map((action, i) => (
          <Link key={i} to={action.path} className="clinic-card p-4 flex items-center gap-3 hover:border-primary/30 transition-all">
            <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center`}>
              <action.icon className={`h-5 w-5 ${action.color}`} />
            </div>
            <span className="text-sm font-medium text-foreground">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Today's Appointments */}
      <div className="clinic-card">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">مواعيد اليوم</h2>
          <Link to="/appointments" className="text-xs text-primary hover:underline">عرض الكل</Link>
        </div>
        {todayApts.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">لا توجد مواعيد اليوم</div>
        ) : (
          <div className="divide-y divide-border">
            {todayApts.slice(0, 8).map(apt => (
              <div key={apt.id} className="p-3 flex items-center gap-3 hover:bg-muted/20">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {apt.patient_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{apt.patient_name}</p>
                  <p className="text-[10px] text-muted-foreground font-en">{apt.time?.substring(0, 5)} · {apt.phone}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-lg font-medium ${
                  apt.status === 'completed' ? 'bg-success/10 text-success' :
                  apt.status === 'in-progress' ? 'bg-primary/10 text-primary' :
                  'bg-muted text-muted-foreground'
                }`}>{apt.status === 'completed' ? 'مكتمل' : apt.status === 'in-progress' ? 'جاري' : 'مجدول'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Visit Dialog */}
      <Dialog open={showNewVisit} onOpenChange={setShowNewVisit}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>إنشاء زيارة جديدة</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>المريض *</Label>
              <Select value={visitForm.patientId} onValueChange={v => setVisitForm({...visitForm, patientId: v})}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="اختر مريض" /></SelectTrigger>
                <SelectContent>
                  {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} - {p.phone}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>نوع الزيارة</Label>
                <Select value={visitForm.visitType} onValueChange={v => setVisitForm({...visitForm, visitType: v})}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diagnostic">تشخيصي</SelectItem>
                    <SelectItem value="treatment">علاجي</SelectItem>
                    <SelectItem value="followup">متابعة</SelectItem>
                    <SelectItem value="lab">تحاليل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>نوع الدفع</Label>
                <Select value={visitForm.paymentType} onValueChange={v => setVisitForm({...visitForm, paymentType: v})}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">مدفوع</SelectItem>
                    <SelectItem value="unpaid">غير مدفوع</SelectItem>
                    <SelectItem value="insurance">تأمين</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNewVisit(false)}>إلغاء</Button>
              <Button onClick={handleCreateVisit} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "إنشاء الزيارة"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
