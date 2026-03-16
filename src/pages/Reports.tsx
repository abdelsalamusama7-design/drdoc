import { motion } from "framer-motion";
import { FileBarChart, Users, DollarSign, Stethoscope } from "lucide-react";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "tween" as const, ease: [0.2, 0, 0, 1], duration: 0.25 },
};

const reports = [
  {
    title: "تقرير المرضى اليومي",
    description: "عدد المرضى وأنواع الزيارات لهذا اليوم",
    icon: Users,
    stats: [
      { label: "إجمالي الزيارات", value: "٨" },
      { label: "استشارات", value: "٤" },
      { label: "متابعات", value: "٢" },
      { label: "إجراءات", value: "٢" },
    ],
  },
  {
    title: "التقرير المالي الشهري",
    description: "ملخص الإيرادات والمصروفات لشهر مارس",
    icon: DollarSign,
    stats: [
      { label: "الإيرادات", value: "٤٨,٠٠٠ ر.س" },
      { label: "المصروفات", value: "٤٧,٠٠٠ ر.س" },
      { label: "صافي الربح", value: "١,٠٠٠ ر.س" },
      { label: "عدد المعاملات", value: "١٥٦" },
    ],
  },
  {
    title: "الخدمات الأكثر طلباً",
    description: "ترتيب الخدمات حسب عدد الطلبات",
    icon: Stethoscope,
    stats: [
      { label: "استشارة أولية", value: "٤٥" },
      { label: "متابعة", value: "٣٨" },
      { label: "تحليل هرمونات", value: "٢٢" },
      { label: "أشعة دوبلر", value: "١٥" },
    ],
  },
  {
    title: "إجمالي الزيارات",
    description: "إحصائيات الزيارات للشهر الحالي",
    icon: FileBarChart,
    stats: [
      { label: "إجمالي الزيارات", value: "١٥٦" },
      { label: "مرضى جدد", value: "٢٣" },
      { label: "مرضى متابعة", value: "١٣٣" },
      { label: "نسبة العودة", value: "٨٥٪" },
    ],
  },
];

export default function Reports() {
  return (
    <motion.div {...pageTransition} className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">التقارير</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {reports.map((report, i) => (
          <div key={i} className="clinic-card p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <report.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">{report.title}</h2>
                <p className="text-xs text-muted-foreground">{report.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {report.stats.map((stat, j) => (
                <div key={j} className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
