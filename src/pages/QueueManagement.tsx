import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Users, Hash, Clock, CheckCircle, PhoneCall, Monitor, Plus,
  SkipForward, UserCheck, ArrowRight, RefreshCw, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QueueEntry {
  id: string;
  patient_id: string | null;
  patient_name: string;
  queue_number: number;
  status: string;
  check_in_time: string;
  called_time: string | null;
  completed_time: string | null;
  doctor: string | null;
  clinic_id: string | null;
}

export default function QueueManagement() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tvMode, setTvMode] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [newDoctor, setNewDoctor] = useState("");

  const fetchQueue = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("queue_entries")
      .select("*")
      .gte("created_at", today + "T00:00:00")
      .lte("created_at", today + "T23:59:59")
      .order("queue_number", { ascending: true });

    if (!error && data) setQueue(data as QueueEntry[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchQueue();

    const channel = supabase
      .channel("queue-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "queue_entries" }, () => {
        fetchQueue();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const waitingCount = queue.filter(q => q.status === "waiting").length;
  const servingCount = queue.filter(q => q.status === "serving").length;
  const completedCount = queue.filter(q => q.status === "completed").length;
  const currentServing = queue.find(q => q.status === "serving");
  const nextInLine = queue.filter(q => q.status === "waiting")[0];

  const addToQueue = async () => {
    if (!newPatientName.trim()) return;
    const maxNum = queue.length > 0 ? Math.max(...queue.map(q => q.queue_number)) : 0;
    const { error } = await supabase.from("queue_entries").insert({
      patient_name: newPatientName.trim(),
      queue_number: maxNum + 1,
      doctor: newDoctor || null,
      status: "waiting",
    });
    if (!error) {
      toast({ title: lang === "ar" ? "تمت الإضافة للطابور" : "Added to queue" });
      setNewPatientName("");
      setNewDoctor("");
      setAddOpen(false);
    }
  };

  const callNext = async () => {
    if (!nextInLine) return;
    // Complete current serving
    if (currentServing) {
      await supabase.from("queue_entries").update({ status: "completed", completed_time: new Date().toISOString() }).eq("id", currentServing.id);
    }
    await supabase.from("queue_entries").update({ status: "serving", called_time: new Date().toISOString() }).eq("id", nextInLine.id);
  };

  const skipPatient = async (id: string) => {
    await supabase.from("queue_entries").update({ status: "skipped" }).eq("id", id);
  };

  const completePatient = async (id: string) => {
    await supabase.from("queue_entries").update({ status: "completed", completed_time: new Date().toISOString() }).eq("id", id);
  };

  const resetQueue = async () => {
    const today = new Date().toISOString().split("T")[0];
    await supabase.from("queue_entries").delete().gte("created_at", today + "T00:00:00").lte("created_at", today + "T23:59:59");
    toast({ title: lang === "ar" ? "تم إعادة تعيين الطابور" : "Queue reset" });
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      waiting: { label: lang === "ar" ? "في الانتظار" : "Waiting", variant: "secondary" },
      serving: { label: lang === "ar" ? "يُخدم الآن" : "Serving", variant: "default" },
      completed: { label: lang === "ar" ? "مكتمل" : "Completed", variant: "outline" },
      skipped: { label: lang === "ar" ? "تم التخطي" : "Skipped", variant: "destructive" },
    };
    const s = map[status] || map.waiting;
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  // TV Display Mode
  if (tvMode) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background flex flex-col">
        <div className="h-16 bg-primary flex items-center justify-between px-8">
          <h1 className="text-xl font-bold text-primary-foreground">
            {lang === "ar" ? "نظام الطابور الذكي" : "Smart Queue System"}
          </h1>
          <Button variant="ghost" size="sm" onClick={() => setTvMode(false)} className="text-primary-foreground hover:text-primary-foreground/80">
            {lang === "ar" ? "إغلاق" : "Close"}
          </Button>
        </div>
        <div className="flex-1 flex gap-6 p-8">
          {/* Current Serving */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-lg text-muted-foreground mb-4">{lang === "ar" ? "يُخدم الآن" : "Now Serving"}</p>
            <motion.div
              key={currentServing?.queue_number || 0}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-48 h-48 rounded-3xl bg-primary flex items-center justify-center"
            >
              <span className="text-8xl font-bold text-primary-foreground">
                {currentServing?.queue_number || "-"}
              </span>
            </motion.div>
            {currentServing && (
              <p className="text-2xl font-semibold text-foreground mt-4">{currentServing.patient_name}</p>
            )}
          </div>
          {/* Waiting List */}
          <div className="w-80 bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {lang === "ar" ? "قائمة الانتظار" : "Waiting List"}
            </h2>
            <div className="space-y-3">
              {queue.filter(q => q.status === "waiting").slice(0, 8).map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? "bg-primary/10 border border-primary/20" : "bg-muted/50"}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                    {entry.queue_number}
                  </div>
                  <span className="text-sm font-medium text-foreground">{entry.patient_name}</span>
                  {i === 0 && <ArrowRight className="h-4 w-4 text-primary mr-auto" />}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {lang === "ar" ? "إدارة الطابور" : "Queue Management"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === "ar" ? "نظام إدارة الطابور الذكي" : "Smart queue management system"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setTvMode(true)}>
            <Monitor className="h-4 w-4 ml-1" />
            {lang === "ar" ? "وضع الشاشة" : "TV Mode"}
          </Button>
          <Button variant="outline" size="sm" onClick={resetQueue}>
            <RefreshCw className="h-4 w-4 ml-1" />
            {lang === "ar" ? "إعادة تعيين" : "Reset"}
          </Button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 ml-1" />
                {lang === "ar" ? "إضافة مريض" : "Add Patient"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{lang === "ar" ? "إضافة للطابور" : "Add to Queue"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input
                  placeholder={lang === "ar" ? "اسم المريض" : "Patient name"}
                  value={newPatientName}
                  onChange={e => setNewPatientName(e.target.value)}
                />
                <Input
                  placeholder={lang === "ar" ? "الطبيب (اختياري)" : "Doctor (optional)"}
                  value={newDoctor}
                  onChange={e => setNewDoctor(e.target.value)}
                />
                <Button onClick={addToQueue} className="w-full">
                  {lang === "ar" ? "إضافة" : "Add"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{waitingCount}</p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "في الانتظار" : "Waiting"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{servingCount}</p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "يُخدم الآن" : "Serving"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedCount}</p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "مكتمل" : "Completed"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Hash className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{queue.length}</p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "إجمالي" : "Total"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Serving + Call Next */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{lang === "ar" ? "يُخدم الآن" : "Now Serving"}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentServing ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
                  {currentServing.queue_number}
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{currentServing.patient_name}</p>
                  {currentServing.doctor && <p className="text-sm text-muted-foreground">{currentServing.doctor}</p>}
                </div>
                <Button variant="outline" size="sm" className="mr-auto" onClick={() => completePatient(currentServing.id)}>
                  <CheckCircle className="h-4 w-4 ml-1" />
                  {lang === "ar" ? "إنهاء" : "Complete"}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا يوجد مريض حالياً" : "No patient currently"}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{lang === "ar" ? "التالي في الطابور" : "Next in Line"}</CardTitle>
          </CardHeader>
          <CardContent>
            {nextInLine ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl font-bold text-foreground">
                  {nextInLine.queue_number}
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{nextInLine.patient_name}</p>
                  {nextInLine.doctor && <p className="text-sm text-muted-foreground">{nextInLine.doctor}</p>}
                </div>
                <Button size="sm" className="mr-auto" onClick={callNext}>
                  <PhoneCall className="h-4 w-4 ml-1" />
                  {lang === "ar" ? "استدعاء" : "Call"}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{lang === "ar" ? "الطابور فارغ" : "Queue is empty"}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Queue List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{lang === "ar" ? "قائمة الطابور" : "Queue List"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <AnimatePresence>
              {queue.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    entry.status === "serving" ? "bg-primary/5 border-primary/30" :
                    entry.status === "completed" ? "bg-muted/30 border-border opacity-60" :
                    entry.status === "skipped" ? "bg-destructive/5 border-destructive/20 opacity-50" :
                    "bg-card border-border"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                    entry.status === "serving" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}>
                    {entry.queue_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{entry.patient_name}</p>
                    {entry.doctor && <p className="text-xs text-muted-foreground">{entry.doctor}</p>}
                  </div>
                  {getStatusBadge(entry.status)}
                  {entry.status === "waiting" && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => skipPatient(entry.id)} title={lang === "ar" ? "تخطي" : "Skip"}>
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {queue.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {lang === "ar" ? "الطابور فارغ - أضف مرضى للبدء" : "Queue is empty - add patients to start"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
