import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Pill, FlaskConical, BookOpen, Loader2, X, Trash2, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useClinic } from "@/hooks/useClinic";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const anim = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25 } };

export default function DrugIndex() {
  const { user } = useAuth();
  const { clinic } = useClinic();
  const { toast } = useToast();

  const [drugs, setDrugs] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("drugs");

  // Dialogs
  const [showAddDrug, setShowAddDrug] = useState(false);
  const [showAddLab, setShowAddLab] = useState(false);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [drugForm, setDrugForm] = useState({ name: "", name_en: "", category: "general", default_dosage: "", default_duration: "", notes: "" });
  const [labForm, setLabForm] = useState({ name: "", name_en: "", category: "general", notes: "" });
  const [templateForm, setTemplateForm] = useState({
    name: "", description: "", template_type: "medication",
    items: [{ name: "", dosage: "", duration: "" }]
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [d, l, t] = await Promise.all([
      (supabase.from("drug_index" as any) as any).select("*").order("name"),
      (supabase.from("lab_index" as any) as any).select("*").order("name"),
      (supabase.from("medication_templates" as any) as any).select("*").order("created_at", { ascending: false }),
    ]);
    setDrugs(d.data || []);
    setLabs(l.data || []);
    setTemplates(t.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filteredDrugs = drugs.filter(d => d.name.includes(search) || (d.name_en || "").toLowerCase().includes(search.toLowerCase()));
  const filteredLabs = labs.filter(l => l.name.includes(search) || (l.name_en || "").toLowerCase().includes(search.toLowerCase()));

  const handleAddDrug = async () => {
    if (!drugForm.name.trim()) { toast({ title: "خطأ", description: "أدخل اسم الدواء", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      await (supabase.from("drug_index" as any) as any).insert({ ...drugForm, clinic_id: clinic?.id });
      toast({ title: "تم", description: "تم إضافة الدواء" });
      setShowAddDrug(false);
      setDrugForm({ name: "", name_en: "", category: "general", default_dosage: "", default_duration: "", notes: "" });
      fetchAll();
    } catch (err: any) { toast({ title: "خطأ", description: err.message, variant: "destructive" }); }
    setSubmitting(false);
  };

  const handleAddLab = async () => {
    if (!labForm.name.trim()) { toast({ title: "خطأ", description: "أدخل اسم التحليل", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      await (supabase.from("lab_index" as any) as any).insert({ ...labForm, clinic_id: clinic?.id });
      toast({ title: "تم", description: "تم إضافة التحليل" });
      setShowAddLab(false);
      setLabForm({ name: "", name_en: "", category: "general", notes: "" });
      fetchAll();
    } catch (err: any) { toast({ title: "خطأ", description: err.message, variant: "destructive" }); }
    setSubmitting(false);
  };

  const handleAddTemplate = async () => {
    if (!templateForm.name.trim()) { toast({ title: "خطأ", description: "أدخل اسم القالب", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const validItems = templateForm.items.filter(i => i.name.trim());
      await (supabase.from("medication_templates" as any) as any).insert({
        name: templateForm.name,
        description: templateForm.description || null,
        template_type: templateForm.template_type,
        items: validItems,
        clinic_id: clinic?.id,
        created_by: user?.id,
      });
      toast({ title: "تم", description: "تم إنشاء القالب" });
      setShowAddTemplate(false);
      setTemplateForm({ name: "", description: "", template_type: "medication", items: [{ name: "", dosage: "", duration: "" }] });
      fetchAll();
    } catch (err: any) { toast({ title: "خطأ", description: err.message, variant: "destructive" }); }
    setSubmitting(false);
  };

  const deleteDrug = async (id: string) => {
    await (supabase.from("drug_index" as any) as any).delete().eq("id", id);
    fetchAll();
  };
  const deleteLab = async (id: string) => {
    await (supabase.from("lab_index" as any) as any).delete().eq("id", id);
    fetchAll();
  };
  const deleteTemplate = async (id: string) => {
    await (supabase.from("medication_templates" as any) as any).delete().eq("id", id);
    fetchAll();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <motion.div {...anim} className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">فهرس الأدوية والتحاليل</h1>
          <p className="text-xs text-muted-foreground mt-0.5">إدارة قاعدة بيانات الأدوية والقوالب الجاهزة</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="pr-10" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="drugs" className="gap-1.5"><Pill className="h-3.5 w-3.5" />الأدوية ({drugs.length})</TabsTrigger>
          <TabsTrigger value="labs" className="gap-1.5"><FlaskConical className="h-3.5 w-3.5" />التحاليل ({labs.length})</TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" />القوالب ({templates.length})</TabsTrigger>
        </TabsList>

        {/* Drugs Tab */}
        <TabsContent value="drugs" className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowAddDrug(true)} className="gap-1.5"><Plus className="h-4 w-4" />إضافة دواء</Button>
          </div>
          <div className="clinic-card divide-y divide-border">
            {filteredDrugs.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">لا توجد أدوية بعد</div>
            ) : filteredDrugs.map(d => (
              <div key={d.id} className="p-3 flex items-center gap-3 hover:bg-muted/20">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Pill className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{d.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {d.name_en && <span className="text-[10px] text-muted-foreground font-en">{d.name_en}</span>}
                    {d.default_dosage && <Badge variant="outline" className="text-[9px]">{d.default_dosage}</Badge>}
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteDrug(d.id)} className="h-8 w-8 text-destructive shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Labs Tab */}
        <TabsContent value="labs" className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowAddLab(true)} className="gap-1.5"><Plus className="h-4 w-4" />إضافة تحليل</Button>
          </div>
          <div className="clinic-card divide-y divide-border">
            {filteredLabs.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">لا توجد تحاليل بعد</div>
            ) : filteredLabs.map(l => (
              <div key={l.id} className="p-3 flex items-center gap-3 hover:bg-muted/20">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <FlaskConical className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{l.name}</p>
                  {l.name_en && <p className="text-[10px] text-muted-foreground font-en">{l.name_en}</p>}
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteLab(l.id)} className="h-8 w-8 text-destructive shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowAddTemplate(true)} className="gap-1.5"><Plus className="h-4 w-4" />إنشاء قالب</Button>
          </div>
          <div className="space-y-3">
            {templates.length === 0 ? (
              <div className="clinic-card p-8 text-center text-sm text-muted-foreground">لا توجد قوالب بعد</div>
            ) : templates.map(t => (
              <div key={t.id} className="clinic-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{t.name}</span>
                    <Badge variant="outline" className="text-[10px]">{t.template_type === 'medication' ? 'أدوية' : 'تحاليل'}</Badge>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deleteTemplate(t.id)} className="h-8 w-8 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(t.items || []).map((item: any, i: number) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">{item.name}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Drug Dialog */}
      <Dialog open={showAddDrug} onOpenChange={setShowAddDrug}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>إضافة دواء جديد</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>الاسم بالعربي *</Label><Input value={drugForm.name} onChange={e => setDrugForm({...drugForm, name: e.target.value})} className="mt-1" /></div>
              <div><Label>الاسم بالإنجليزي</Label><Input value={drugForm.name_en} onChange={e => setDrugForm({...drugForm, name_en: e.target.value})} className="mt-1 font-en" dir="ltr" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>الجرعة الافتراضية</Label><Input value={drugForm.default_dosage} onChange={e => setDrugForm({...drugForm, default_dosage: e.target.value})} className="mt-1" placeholder="مثال: قرص مرتين يومياً" /></div>
              <div><Label>المدة الافتراضية</Label><Input value={drugForm.default_duration} onChange={e => setDrugForm({...drugForm, default_duration: e.target.value})} className="mt-1" placeholder="مثال: أسبوع" /></div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddDrug(false)}>إلغاء</Button>
              <Button onClick={handleAddDrug} disabled={submitting}>{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "إضافة"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Lab Dialog */}
      <Dialog open={showAddLab} onOpenChange={setShowAddLab}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>إضافة تحليل/فحص</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>الاسم بالعربي *</Label><Input value={labForm.name} onChange={e => setLabForm({...labForm, name: e.target.value})} className="mt-1" /></div>
              <div><Label>الاسم بالإنجليزي</Label><Input value={labForm.name_en} onChange={e => setLabForm({...labForm, name_en: e.target.value})} className="mt-1 font-en" dir="ltr" /></div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddLab(false)}>إلغاء</Button>
              <Button onClick={handleAddLab} disabled={submitting}>{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "إضافة"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Template Dialog */}
      <Dialog open={showAddTemplate} onOpenChange={setShowAddTemplate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>إنشاء قالب جاهز</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>اسم القالب *</Label><Input value={templateForm.name} onChange={e => setTemplateForm({...templateForm, name: e.target.value})} className="mt-1" placeholder="مثال: أدوية مرضى السكر" /></div>
              <div>
                <Label>النوع</Label>
                <Select value={templateForm.template_type} onValueChange={v => setTemplateForm({...templateForm, template_type: v})}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medication">أدوية</SelectItem>
                    <SelectItem value="lab">تحاليل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>الوصف</Label><Input value={templateForm.description} onChange={e => setTemplateForm({...templateForm, description: e.target.value})} className="mt-1" /></div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>العناصر</Label>
                <Button size="sm" variant="outline" onClick={() => setTemplateForm(prev => ({...prev, items: [...prev.items, { name: "", dosage: "", duration: "" }]}))} className="text-xs gap-1"><Plus className="h-3 w-3" />إضافة</Button>
              </div>
              <div className="space-y-2">
                {templateForm.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input value={item.name} onChange={e => {
                      const items = [...templateForm.items];
                      items[i] = { ...items[i], name: e.target.value };
                      setTemplateForm({...templateForm, items});
                    }} placeholder="الاسم" className="flex-1 text-sm" />
                    {templateForm.template_type === 'medication' && (
                      <>
                        <Input value={item.dosage} onChange={e => {
                          const items = [...templateForm.items];
                          items[i] = { ...items[i], dosage: e.target.value };
                          setTemplateForm({...templateForm, items});
                        }} placeholder="الجرعة" className="w-24 text-sm" />
                        <Input value={item.duration} onChange={e => {
                          const items = [...templateForm.items];
                          items[i] = { ...items[i], duration: e.target.value };
                          setTemplateForm({...templateForm, items});
                        }} placeholder="المدة" className="w-20 text-sm" />
                      </>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => setTemplateForm(prev => ({...prev, items: prev.items.filter((_, idx) => idx !== i)}))} className="h-8 w-8 text-destructive shrink-0">
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddTemplate(false)}>إلغاء</Button>
              <Button onClick={handleAddTemplate} disabled={submitting}>{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "إنشاء القالب"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
