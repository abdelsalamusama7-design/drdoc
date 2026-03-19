import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useServices, createService, deleteService } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "tween" as const, ease: [0.2, 0, 0, 1] as const, duration: 0.25 },
};

export default function Services() {
  const { data: services, loading, refetch } = useServices();
  const { role } = useAuth();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', category: '', notes: '' });

  const categories = [...new Set(services.map((s) => s.category).filter(Boolean))];
  const canManage = role === 'admin' || role === 'doctor';

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.price) {
      toast({ title: "خطأ", description: "يرجى ملء اسم الخدمة والسعر", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await createService({
        name: form.name.trim(),
        price: parseFloat(form.price),
        category: form.category.trim() || null,
        notes: form.notes.trim() || null,
      });
      toast({ title: "تم", description: "تمت إضافة الخدمة" });
      setShowAdd(false);
      setForm({ name: '', price: '', category: '', notes: '' });
      refetch();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteService(id);
      toast({ title: "تم", description: "تم حذف الخدمة" });
      refetch();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div {...pageTransition} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">خدمات العيادة</h1>
        {canManage && (
          <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />إضافة خدمة
          </Button>
        )}
      </div>

      {services.length === 0 ? (
        <div className="clinic-card p-12 text-center">
          <p className="text-sm text-muted-foreground">لا توجد خدمات. أضف أول خدمة</p>
        </div>
      ) : (
        categories.map((cat) => (
          <div key={cat}>
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">{cat}</h2>
            <div className="clinic-card divide-y divide-border">
              {services.filter((s) => s.category === cat).map((service) => (
                <div key={service.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{service.name}</p>
                    {service.notes && <p className="text-xs text-muted-foreground mt-0.5">{service.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground font-en tabular-nums">
                      {service.price.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">ج.م</span>
                    </span>
                    {canManage && (
                      <button onClick={() => handleDelete(service.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Services without category */}
      {services.filter(s => !s.category).length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">أخرى</h2>
          <div className="clinic-card divide-y divide-border">
            {services.filter(s => !s.category).map((service) => (
              <div key={service.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{service.name}</p>
                  {service.notes && <p className="text-xs text-muted-foreground mt-0.5">{service.notes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-foreground font-en tabular-nums">
                    {service.price.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">ج.م</span>
                  </span>
                  {canManage && (
                    <button onClick={() => handleDelete(service.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>إضافة خدمة جديدة</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>اسم الخدمة *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="مثال: استشارة أولية" className="mt-1.5" />
            </div>
            <div>
              <Label>السعر (ج.م) *</Label>
              <Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0" className="mt-1.5 font-en" dir="ltr" />
            </div>
            <div>
              <Label>التصنيف</Label>
              <Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="مثال: استشارة" className="mt-1.5" />
            </div>
            <div>
              <Label>ملاحظات</Label>
              <Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="ملاحظات إضافية..." className="mt-1.5" rows={2} />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowAdd(false)}>إلغاء</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "إضافة الخدمة"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
