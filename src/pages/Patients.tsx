import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Phone, MapPin, AlertTriangle } from "lucide-react";
import { mockPatients, type Patient } from "@/data/mockData";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "tween" as const, ease: [0.2, 0, 0, 1], duration: 0.25 },
};

export default function Patients() {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [patients] = useState<Patient[]>(mockPatients);

  const filtered = patients.filter(
    (p) => p.name.includes(search) || p.phone.includes(search)
  );

  return (
    <motion.div {...pageTransition} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">المرضى</h1>
        <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">إضافة مريض</span>
          <span className="sm:hidden">إضافة</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="بحث بالاسم أو رقم الهاتف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-9 h-11"
        />
      </div>

      {/* Patient List */}
      <div className="clinic-card divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            لا يوجد مرضى مطابقون للبحث
          </div>
        ) : (
          filtered.map((patient) => (
            <Link
              key={patient.id}
              to={`/patients/${patient.id}`}
              className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                {patient.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{patient.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span className="font-en">{patient.phone}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{patient.age} سنة</span>
                </div>
              </div>
              <div className="text-left shrink-0">
                {patient.allergies.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="h-3 w-3" />
                    حساسية
                  </span>
                )}
                <p className="text-[10px] text-muted-foreground mt-1 font-en">{patient.lastVisit}</p>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Add Patient Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة مريض جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>الاسم الكامل</Label>
                <Input placeholder="أدخل اسم المريض" className="mt-1.5" />
              </div>
              <div>
                <Label>رقم الهاتف</Label>
                <Input placeholder="05xxxxxxxx" className="mt-1.5 font-en" dir="ltr" />
              </div>
              <div>
                <Label>العمر</Label>
                <Input type="number" placeholder="العمر" className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label>العنوان</Label>
                <Input placeholder="المدينة، الحي" className="mt-1.5" />
              </div>
              <div>
                <Label>الحالة الاجتماعية</Label>
                <Select>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="اختر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">أعزب</SelectItem>
                    <SelectItem value="married">متزوج</SelectItem>
                    <SelectItem value="divorced">مطلق</SelectItem>
                    <SelectItem value="widowed">أرمل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>الحساسية</Label>
                <Input placeholder="أدوية أو مواد" className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label>التاريخ المرضي</Label>
                <Textarea placeholder="أمراض مزمنة، حالات سابقة..." className="mt-1.5" rows={2} />
              </div>
              <div className="sm:col-span-2">
                <Label>العمليات السابقة</Label>
                <Textarea placeholder="العمليات الجراحية السابقة..." className="mt-1.5" rows={2} />
              </div>
              <div className="sm:col-span-2">
                <Label>الأدوية الحالية</Label>
                <Input placeholder="الأدوية التي يتناولها المريض حالياً" className="mt-1.5" />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>إلغاء</Button>
              <Button onClick={() => setShowAddModal(false)}>تسجيل المريض</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
