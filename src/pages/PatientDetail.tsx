import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Phone, MapPin, AlertTriangle, Calendar, FileText, Pill, Activity, StickyNote } from "lucide-react";
import { mockPatients, mockTimeline, type TimelineEvent } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "tween" as const, ease: [0.2, 0, 0, 1], duration: 0.25 },
};

const timelineIcons: Record<TimelineEvent['type'], typeof Activity> = {
  visit: Calendar,
  lab: Activity,
  prescription: Pill,
  surgery: FileText,
  note: StickyNote,
};

const timelineColors: Record<TimelineEvent['type'], string> = {
  visit: 'bg-primary/10 text-primary',
  lab: 'bg-accent/10 text-accent',
  prescription: 'bg-success/10 text-success',
  surgery: 'bg-warning/10 text-warning',
  note: 'bg-muted text-muted-foreground',
};

const maritalLabels: Record<string, string> = {
  single: 'أعزب',
  married: 'متزوج',
  divorced: 'مطلق',
  widowed: 'أرمل',
};

export default function PatientDetail() {
  const { id } = useParams();
  const patient = mockPatients.find((p) => p.id === id);

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        لم يتم العثور على المريض
      </div>
    );
  }

  return (
    <motion.div {...pageTransition} className="space-y-4">
      {/* Back Button */}
      <Link to="/patients" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowRight className="h-4 w-4" />
        العودة للمرضى
      </Link>

      {/* Patient Info Card */}
      <div className="clinic-card p-4 lg:p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
            {patient.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground">{patient.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span className="font-en">{patient.phone}</span>
              </span>
              <span>{patient.age} سنة</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {patient.address}
              </span>
              <span>{maritalLabels[patient.maritalStatus]}</span>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">التاريخ المرضي</p>
            <p className="text-sm">{patient.medicalHistory || 'لا يوجد'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">العمليات السابقة</p>
            <p className="text-sm">{patient.previousSurgeries || 'لا يوجد'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">الأدوية الحالية</p>
            <div className="flex flex-wrap gap-1">
              {patient.currentMedications.length > 0 ? (
                patient.currentMedications.map((med, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] font-en">{med}</Badge>
                ))
              ) : (
                <span className="text-sm">لا يوجد</span>
              )}
            </div>
          </div>
        </div>

        {/* Allergies */}
        {patient.allergies.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-destructive">حساسية</p>
              <p className="text-xs text-destructive/80 mt-0.5">{patient.allergies.join('، ')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="clinic-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">السجل الطبي</h2>
        </div>
        <div className="p-4">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute right-[19px] top-0 bottom-0 w-px bg-border" />

            <div className="space-y-4">
              {mockTimeline.map((event) => {
                const Icon = timelineIcons[event.type];
                const colorClass = timelineColors[event.type];
                return (
                  <div key={event.id} className="flex gap-3 relative">
                    <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center shrink-0 z-10`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{event.title}</p>
                        <span className="text-[10px] text-muted-foreground font-en">{event.date}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {mockTimeline.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              لا يوجد سجل طبي متاح. ابدأ بإضافة ملاحظة جديدة.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
