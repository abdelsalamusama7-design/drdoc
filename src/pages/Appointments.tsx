import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, ChevronRight, ChevronLeft } from "lucide-react";
import { mockAppointments, visitTypeLabels, statusLabels, type Appointment } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "tween" as const, ease: [0.2, 0, 0, 1] as const, duration: 0.25 },
};

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState("2025-03-16");
  const [showAddModal, setShowAddModal] = useState(false);

  const dayAppointments = mockAppointments.filter((a) => a.date === selectedDate);

  const navigateDay = (dir: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <motion.div {...pageTransition} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">المواعيد</h1>
        <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">موعد جديد</span>
          <span className="sm:hidden">إضافة</span>
        </Button>
      </div>

      {/* Date Navigation */}
      <div className="clinic-card p-3 flex items-center justify-between">
        <button onClick={() => navigateDay(1)} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">{formatDate(selectedDate)}</p>
          <p className="text-xs text-muted-foreground">{dayAppointments.length} مواعيد</p>
        </div>
        <button onClick={() => navigateDay(-1)} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Appointments List */}
      <div className="clinic-card divide-y divide-border">
        {dayAppointments.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            لا توجد مواعيد في هذا اليوم
          </div>
        ) : (
          dayAppointments.map((apt) => (
            <div key={apt.id} className="p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-muted text-sm font-bold text-muted-foreground font-en tabular-nums">
                {apt.time}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{apt.patientName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {visitTypeLabels[apt.visitType]} • {apt.doctor}
                </p>
                {apt.notes && (
                  <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">{apt.notes}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                  apt.status === 'in-progress' ? 'bg-primary/10 text-primary' :
                  apt.status === 'completed' ? 'bg-success/10 text-success' :
                  apt.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {statusLabels[apt.status]}
                </span>
                <span className="text-[10px] text-muted-foreground font-en">{apt.phone}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Appointment Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>حجز موعد جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>اسم المريض</Label>
                <Input placeholder="بحث أو إدخال اسم المريض" className="mt-1.5" />
              </div>
              <div>
                <Label>رقم الهاتف</Label>
                <Input placeholder="05xxxxxxxx" className="mt-1.5 font-en" dir="ltr" />
              </div>
              <div>
                <Label>الطبيب</Label>
                <Select>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="اختر الطبيب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dr-sultan">د. سلطان الأحمدي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>التاريخ</Label>
                <Input type="date" className="mt-1.5 font-en" dir="ltr" defaultValue={selectedDate} />
              </div>
              <div>
                <Label>الوقت</Label>
                <Input type="time" className="mt-1.5 font-en" dir="ltr" />
              </div>
              <div className="sm:col-span-2">
                <Label>نوع الزيارة</Label>
                <Select>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="اختر نوع الزيارة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">استشارة</SelectItem>
                    <SelectItem value="followup">متابعة</SelectItem>
                    <SelectItem value="procedure">إجراء</SelectItem>
                    <SelectItem value="lab">مختبر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>ملاحظات</Label>
                <Textarea placeholder="ملاحظات إضافية..." className="mt-1.5" rows={2} />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>إلغاء</Button>
              <Button onClick={() => setShowAddModal(false)}>حجز الموعد</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
