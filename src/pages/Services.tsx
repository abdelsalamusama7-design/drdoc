import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { mockServices, type Service } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "tween" as const, ease: [0.2, 0, 0, 1] as const, duration: 0.25 },
};

export default function Services() {
  const [showAdd, setShowAdd] = useState(false);
  const categories = [...new Set(mockServices.map((s) => s.category))];

  return (
    <motion.div {...pageTransition} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">خدمات العيادة</h1>
        <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          إضافة خدمة
        </Button>
      </div>

      {categories.map((cat) => (
        <div key={cat}>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">{cat}</h2>
          <div className="clinic-card divide-y divide-border">
            {mockServices
              .filter((s) => s.category === cat)
              .map((service) => (
                <div key={service.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{service.name}</p>
                    {service.notes && <p className="text-xs text-muted-foreground mt-0.5">{service.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground font-en tabular-nums">
                      {service.price.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">ج.م</span>
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة خدمة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>اسم الخدمة</Label>
              <Input placeholder="مثال: استشارة أولية" className="mt-1.5" />
            </div>
            <div>
              <Label>السعر (ر.س)</Label>
              <Input type="number" placeholder="0" className="mt-1.5 font-en" dir="ltr" />
            </div>
            <div>
              <Label>التصنيف</Label>
              <Input placeholder="مثال: استشارة" className="mt-1.5" />
            </div>
            <div>
              <Label>ملاحظات</Label>
              <Textarea placeholder="ملاحظات إضافية..." className="mt-1.5" rows={2} />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowAdd(false)}>إلغاء</Button>
              <Button onClick={() => setShowAdd(false)}>إضافة الخدمة</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
