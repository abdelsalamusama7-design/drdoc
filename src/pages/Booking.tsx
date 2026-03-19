import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, User, Phone, Stethoscope, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const WORK_HOURS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30"
];

const DAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

export default function Booking() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [visitType, setVisitType] = useState("consultation");
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    
    // Fill empty days before first day
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  }, [currentMonth]);

  const fetchBookedSlots = async (date: string) => {
    const { data } = await (supabase.from("appointments" as any) as any)
      .select("time")
      .eq("date", date)
      .neq("status", "cancelled");
    setBookedSlots((data || []).map((a: any) => a.time?.substring(0, 5)));
  };

  const handleDateSelect = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    setSelectedDate(dateStr);
    setSelectedTime(null);
    fetchBookedSlots(dateStr);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال الاسم ورقم الهاتف", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await (supabase.from("appointments" as any) as any).insert({
        patient_name: name,
        phone,
        date: selectedDate,
        time: selectedTime,
        visit_type: visitType,
        status: "scheduled",
        notes: "حجز أونلاين",
      });
      if (error) throw error;
      setBooked(true);
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  if (booked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">تم تأكيد الحجز!</h1>
          <p className="text-muted-foreground mb-6">
            عزيزي {name}، تم حجز موعدك بنجاح يوم{" "}
            <span className="font-semibold text-foreground">{selectedDate}</span> الساعة{" "}
            <span className="font-semibold text-foreground">{selectedTime}</span>
          </p>
          <p className="text-sm text-muted-foreground mb-8">سيتم التواصل معك لتأكيد الموعد</p>
          <Button onClick={() => { setBooked(false); setStep(1); setName(""); setPhone(""); setSelectedDate(null); setSelectedTime(null); }}>
            حجز موعد آخر
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">د. خالد جادالله</h1>
              <p className="text-xs text-muted-foreground">حجز موعد أونلاين</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          {[
            { n: 1, label: "التاريخ", icon: CalendarDays },
            { n: 2, label: "الوقت", icon: Clock },
            { n: 3, label: "البيانات", icon: User },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <button
                onClick={() => s.n < step && setStep(s.n)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  step === s.n
                    ? "bg-primary text-primary-foreground"
                    : step > s.n
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <s.icon className="h-4 w-4" />
                {s.label}
              </button>
              {i < 2 && <div className={`w-8 h-0.5 ${step > s.n ? "bg-success" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Date */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-lg mx-auto">
              <div className="clinic-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-muted rounded-lg">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <h2 className="text-lg font-bold text-foreground">
                    {MONTHS_AR[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h2>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-muted rounded-lg">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAYS_AR.map(d => <div key={d} className="text-center text-[10px] text-muted-foreground py-1">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {daysInMonth.map((day, i) => {
                    if (!day) return <div key={`e${i}`} />;
                    const isPast = day < today;
                    const isFriday = day.getDay() === 5;
                    const isDisabled = isPast || isFriday;
                    const dateStr = day.toISOString().split("T")[0];
                    const isSelected = selectedDate === dateStr;
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <button
                        key={dateStr}
                        disabled={isDisabled}
                        onClick={() => handleDateSelect(day)}
                        className={`aspect-square rounded-xl text-sm font-medium transition-all ${
                          isDisabled ? "text-muted-foreground/30 cursor-not-allowed" :
                          isSelected ? "bg-primary text-primary-foreground" :
                          isToday ? "bg-primary/10 text-primary ring-1 ring-primary/30" :
                          "hover:bg-muted text-foreground"
                        }`}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Time */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-lg mx-auto">
              <div className="clinic-card p-6">
                <h2 className="text-lg font-bold text-foreground mb-1">اختر الوقت</h2>
                <p className="text-sm text-muted-foreground mb-4">{selectedDate}</p>
                <div className="grid grid-cols-4 gap-2">
                  {WORK_HOURS.map(time => {
                    const isBooked = bookedSlots.includes(time);
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        disabled={isBooked}
                        onClick={() => { setSelectedTime(time); setStep(3); }}
                        className={`py-3 rounded-xl text-sm font-medium font-en transition-all ${
                          isBooked ? "bg-destructive/5 text-muted-foreground/40 line-through cursor-not-allowed" :
                          isSelected ? "bg-primary text-primary-foreground" :
                          "bg-muted hover:bg-primary/10 hover:text-primary text-foreground"
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Patient Info */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-lg mx-auto">
              <div className="clinic-card p-6 space-y-4">
                <h2 className="text-lg font-bold text-foreground">بياناتك</h2>
                <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-3 text-sm">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span>{selectedDate}</span>
                  <Clock className="h-4 w-4 text-primary mr-2" />
                  <span className="font-en">{selectedTime}</span>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">الاسم الكامل *</label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="أدخل اسمك" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">رقم الهاتف *</label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="font-en" dir="ltr" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">نوع الزيارة</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "consultation", label: "استشارة" },
                      { key: "followup", label: "متابعة" },
                      { key: "lab", label: "تحاليل" },
                      { key: "procedure", label: "إجراء طبي" },
                    ].map(v => (
                      <button
                        key={v.key}
                        onClick={() => setVisitType(v.key)}
                        className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                          visitType === v.key ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-primary/10"
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={handleSubmit} disabled={loading} className="w-full h-12 text-base">
                  {loading ? "جاري الحجز..." : "تأكيد الحجز"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
