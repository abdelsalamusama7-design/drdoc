import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, UserPlus } from "lucide-react";

const notifications = [
  { name: "د. أحمد محمود", type: "طبيب أسنان", city: "القاهرة" },
  { name: "صيدلية الشفاء", type: "صيدلية", city: "الإسكندرية" },
  { name: "د. سارة عبدالله", type: "طبيبة جلدية", city: "المنصورة" },
  { name: "عيادة النور", type: "عيادة عامة", city: "طنطا" },
  { name: "د. محمد حسن", type: "طبيب عيون", city: "الجيزة" },
  { name: "صيدلية الأمل", type: "صيدلية", city: "أسيوط" },
  { name: "د. فاطمة علي", type: "طبيبة أطفال", city: "الزقازيق" },
  { name: "مركز الحياة الطبي", type: "مركز طبي", city: "بورسعيد" },
  { name: "د. خالد إبراهيم", type: "طبيب باطنة", city: "سوهاج" },
  { name: "صيدلية الرحمة", type: "صيدلية", city: "المنيا" },
  { name: "د. نورهان سعيد", type: "طبيبة نساء", city: "دمياط" },
  { name: "عيادة السلام", type: "عيادة أسنان", city: "الفيوم" },
  { name: "د. عمر يوسف", type: "جراح عظام", city: "بنها" },
  { name: "صيدلية البركة", type: "صيدلية", city: "قنا" },
];

function getRandomTime(): string {
  const mins = Math.floor(Math.random() * 55) + 2;
  return `منذ ${mins} دقيقة`;
}

export default function SocialProofNotification() {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);

  const showNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % notifications.length);
    setVisible(true);
    setTimeout(() => setVisible(false), 4500);
  }, []);

  useEffect(() => {
    const initialDelay = setTimeout(() => {
      showNext();
    }, 5000);

    const interval = setInterval(() => {
      showNext();
    }, 12000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [showNext]);

  const notif = notifications[current];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="fixed bottom-6 left-6 z-50 max-w-xs"
        >
          <div className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-xl shadow-2xl shadow-primary/10 p-4 flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-foreground truncate">{notif.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {notif.type} — {notif.city}
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-1">
                اشترك {getRandomTime()} ✨
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
