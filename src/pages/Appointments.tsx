import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, ChevronRight, ChevronLeft, CalendarDays, Clock, Filter } from "lucide-react";
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

const HOURS = Array.from({ length: 9 }, (_, i) => i + 8); // 8 AM to 4 PM

function getWeekDays(dateStr: string) {
  const date = new Date(dateStr);
  const day = date.getDay();
  // Start from Saturday (6)
  const diff = day >= 6 ? day - 6 : day + 1;
  const saturday = new Date(date);
  saturday.setDate(date.getDate() - diff);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(saturday);
    d.setDate(saturday.getDate() + i);
    return d;
  });
}

const dayNames = ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState("2025-03-16");
  const [view, setView] = useState<'day' | 'week'>('day');
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const dayAppointments = mockAppointments.filter((a) => a.date === selectedDate);

  const filteredAppointments = statusFilter === 'all'
    ? dayAppointments
    : dayAppointments.filter(a => a.status === statusFilter);

  const navigateDay = (dir: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + (view === 'week' ? dir * 7 : dir));
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  const isToday = (date: Date) => {
    const today = new Date('2025-03-16');
    return date.toDateString() === today.toDateString();
  };

  const statusCounts = {
    all: dayAppointments.length,
    scheduled: dayAppointments.filter(a => a.status === 'scheduled').length,
    'in-progress': dayAppointments.filter(a => a.status === 'in-progress').length,
    completed: dayAppointments.filter(a => a.status === 'completed').length,
  };

  return (
    <motion.div {...pageTransition} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">المواعيد</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{dayAppointments.length} مواعيد اليوم</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="hidden sm:flex items-center bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setView('day')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === 'day' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              يوم
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === 'week' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              أسبوع
            </button>
          </div>
          <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">موعد جديد</span>
            <span className="sm:hidden">إضافة</span>
          </Button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="clinic-card p-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigateDay(1)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">{formatDate(selectedDate)}</p>
          </div>
          <button onClick={() => navigateDay(-1)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Week Strip */}
        <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1">
          {weekDays.map((date, i) => {
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = dateStr === selectedDate;
            const today = isToday(date);
            const hasAppointments = mockAppointments.some(a => a.date === dateStr);

            return (
              <button
                key={i}
                onClick={() => { setSelectedDate(dateStr); setView('day'); }}
                className={`flex-1 min-w-[48px] flex flex-col items-center gap-0.5 py-2 rounded-xl text-center transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : today
                    ? 'bg-primary/5 text-primary'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                <span className="text-[10px] font-medium">{dayNames[i]}</span>
                <span className={`text-sm font-bold font-en ${isSelected ? '' : ''}`}>
                  {date.getDate()}
                </span>
                {hasAppointments && !isSelected && (
                  <div className="w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'الكل', count: statusCounts.all },
          { key: 'scheduled', label: 'مجدول', count: statusCounts.scheduled },
          { key: 'in-progress', label: 'جاري', count: statusCounts['in-progress'] },
          { key: 'completed', label: 'مكتمل', count: statusCounts.completed },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setStatusFilter(filter.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === filter.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {filter.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              statusFilter === filter.key
                ? 'bg-primary-foreground/20'
                : 'bg-background'
            }`}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {view === 'day' ? (
        /* Day View - Timeline Style */
        <div className="clinic-card overflow-hidden">
          {filteredAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarDays className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">لا توجد مواعيد مطابقة</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredAppointments.map((apt, index) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors group"
                >
                  {/* Time Block */}
                  <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-center shrink-0 ${
                    apt.status === 'in-progress'
                      ? 'bg-primary/10 ring-2 ring-primary/20'
                      : apt.status === 'completed'
                      ? 'bg-success/10'
                      : 'bg-muted'
                  }`}>
                    <span className="text-lg font-bold font-en tabular-nums text-foreground">{apt.time.split(':')[0]}</span>
                    <span className="text-[10px] font-en text-muted-foreground">:{apt.time.split(':')[1]}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{apt.patientName}</p>
                      {apt.status === 'in-progress' && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        apt.visitType === 'consultation' ? 'bg-primary/10 text-primary' :
                        apt.visitType === 'followup' ? 'bg-accent/10 text-accent' :
                        apt.visitType === 'procedure' ? 'bg-success/10 text-success' :
                        'bg-warning/10 text-warning'
                      }`}>
                        {visitTypeLabels[apt.visitType]}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{apt.doctor}</span>
                    </div>
                    {apt.notes && (
                      <p className="text-[11px] text-muted-foreground/70 mt-1 truncate">{apt.notes}</p>
                    )}
                  </div>

                  {/* Status & Phone */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                      apt.status === 'in-progress' ? 'bg-primary/10 text-primary' :
                      apt.status === 'completed' ? 'bg-success/10 text-success' :
                      apt.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {statusLabels[apt.status]}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-en opacity-0 group-hover:opacity-100 transition-opacity">
                      {apt.phone}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Week View - Grid */
        <div className="clinic-card overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header */}
            <div className="grid grid-cols-8 border-b border-border">
              <div className="p-2 text-center text-[10px] text-muted-foreground" />
              {weekDays.map((date, i) => {
                const dateStr = date.toISOString().split('T')[0];
                const today = isToday(date);
                return (
                  <div key={i} className={`p-2 text-center border-r border-border ${today ? 'bg-primary/5' : ''}`}>
                    <p className="text-[10px] text-muted-foreground">{dayNames[i]}</p>
                    <p className={`text-sm font-bold font-en ${today ? 'text-primary' : 'text-foreground'}`}>{date.getDate()}</p>
                  </div>
                );
              })}
            </div>
            {/* Time Grid */}
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-border/50 min-h-[56px]">
                <div className="p-1.5 text-center text-[10px] text-muted-foreground font-en tabular-nums flex items-start justify-center pt-2">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                {weekDays.map((date, dayIndex) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const cellApts = mockAppointments.filter(
                    a => a.date === dateStr && parseInt(a.time.split(':')[0]) === hour
                  );
                  return (
                    <div key={dayIndex} className={`border-r border-border/50 p-0.5 ${isToday(date) ? 'bg-primary/[0.02]' : ''}`}>
                      {cellApts.map((apt) => (
                        <div
                          key={apt.id}
                          className={`text-[9px] p-1.5 rounded-md mb-0.5 truncate cursor-pointer transition-colors ${
                            apt.status === 'in-progress' ? 'bg-primary/15 text-primary border border-primary/20' :
                            apt.status === 'completed' ? 'bg-success/15 text-success' :
                            'bg-muted text-foreground hover:bg-muted/80'
                          }`}
                        >
                          <p className="font-medium truncate">{apt.patientName}</p>
                          <p className="text-[8px] opacity-70 font-en">{apt.time}</p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

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
