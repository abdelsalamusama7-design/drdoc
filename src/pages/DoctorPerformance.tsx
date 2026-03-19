import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/hooks/useI18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, DollarSign, Star, Download, Plus, Pencil, Loader2, Trash2 } from "lucide-react";

interface DoctorStats {
  name: string;
  patients: number;
  revenue: number;
  avgRating: number;
  completedVisits: number;
  isManual?: boolean;
}

export default function DoctorPerformance() {
  const { lang } = useI18n();
  const [period, setPeriod] = useState("month");
  const [doctors, setDoctors] = useState<DoctorStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit state
  const [showDialog, setShowDialog] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", patients: 0, revenue: 0, avgRating: 0 });

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    const now = new Date();
    let startDate: string;
    if (period === "week") {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      startDate = d.toISOString().split("T")[0];
    } else if (period === "month") {
      startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    } else {
      startDate = `${now.getFullYear()}-01-01`;
    }

    const { data: visits } = await supabase
      .from("visits")
      .select("*, payments(*)")
      .gte("date", startDate);

    const { data: appointments } = await supabase
      .from("appointments")
      .select("doctor, patient_name")
      .gte("date", startDate);

    const { data: ratings } = await supabase.from("patient_ratings").select("*");

    const doctorMap: Record<string, DoctorStats> = {};
    appointments?.forEach(apt => {
      const doc = apt.doctor || (lang === "ar" ? "غير محدد" : "Unassigned");
      if (!doctorMap[doc]) doctorMap[doc] = { name: doc, patients: 0, revenue: 0, avgRating: 0, completedVisits: 0 };
      doctorMap[doc].patients++;
    });

    visits?.forEach(v => {
      const payments = (v as any).payments as any[];
      if (payments) {
        payments.forEach(p => {
          const firstDoc = Object.keys(doctorMap)[0];
          if (firstDoc && doctorMap[firstDoc]) {
            doctorMap[firstDoc].revenue += Number(p.amount) || 0;
          }
        });
      }
    });

    const ratingSum: Record<string, { total: number; count: number }> = {};
    ratings?.forEach(r => {
      const doc = Object.keys(doctorMap)[0] || "default";
      if (!ratingSum[doc]) ratingSum[doc] = { total: 0, count: 0 };
      ratingSum[doc].total += r.rating;
      ratingSum[doc].count++;
    });

    Object.keys(doctorMap).forEach(doc => {
      if (ratingSum[doc]) {
        doctorMap[doc].avgRating = Math.round((ratingSum[doc].total / ratingSum[doc].count) * 10) / 10;
      }
    });

    setDoctors(prev => {
      const manualDocs = prev.filter(d => d.isManual);
      return [...Object.values(doctorMap), ...manualDocs];
    });
    setLoading(false);
  };

  const openAdd = () => {
    setEditIndex(null);
    setForm({ name: "", patients: 0, revenue: 0, avgRating: 0 });
    setShowDialog(true);
  };

  const openEdit = (index: number) => {
    const doc = doctors[index];
    setEditIndex(index);
    setForm({ name: doc.name, patients: doc.patients, revenue: doc.revenue, avgRating: doc.avgRating });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const entry: DoctorStats = {
      name: form.name.trim(),
      patients: form.patients,
      revenue: form.revenue,
      avgRating: form.avgRating,
      completedVisits: 0,
      isManual: true,
    };
    if (editIndex !== null) {
      setDoctors(prev => prev.map((d, i) => i === editIndex ? { ...d, ...entry, isManual: d.isManual ?? true } : d));
    } else {
      setDoctors(prev => [...prev, entry]);
    }
    setShowDialog(false);
  };

  const handleDelete = (index: number) => {
    setDoctors(prev => prev.filter((_, i) => i !== index));
  };

  const totalPatients = doctors.reduce((s, d) => s + d.patients, 0);
  const totalRevenue = doctors.reduce((s, d) => s + d.revenue, 0);
  const ratedDocs = doctors.filter(d => d.avgRating > 0);
  const avgRating = ratedDocs.length > 0
    ? Math.round((ratedDocs.reduce((s, d) => s + d.avgRating, 0) / ratedDocs.length) * 10) / 10
    : 0;

  const exportReport = () => {
    const csv = [
      ["Doctor", "Patients", "Revenue", "Rating"].join(","),
      ...doctors.map(d => [d.name, d.patients, d.revenue, d.avgRating].join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "doctor-performance.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {lang === "ar" ? "أداء الأطباء" : "Doctor Performance"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === "ar" ? "تحليل وتقارير أداء الأطباء" : "Doctor performance analytics & reports"}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{lang === "ar" ? "أسبوع" : "Week"}</SelectItem>
              <SelectItem value="month">{lang === "ar" ? "شهر" : "Month"}</SelectItem>
              <SelectItem value="year">{lang === "ar" ? "سنة" : "Year"}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="h-4 w-4 ml-1" />
            {lang === "ar" ? "تصدير" : "Export"}
          </Button>
          <Button size="sm" className="gap-1.5" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            {lang === "ar" ? "إضافة يدوي" : "Add Manual"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalPatients}</p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "إجمالي المرضى" : "Total Patients"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "إجمالي الإيرادات" : "Total Revenue"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Star className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{avgRating || "-"}</p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "متوسط التقييم" : "Avg Rating"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{lang === "ar" ? "مرضى لكل طبيب" : "Patients per Doctor"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={doctors}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="patients" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{lang === "ar" ? "الإيرادات لكل طبيب" : "Revenue per Doctor"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={doctors}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="revenue" fill="hsl(142, 76%, 36%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Doctor Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((doc, i) => (
          <Card key={`${doc.name}-${i}`} className="hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold">
                  {doc.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{doc.name}</p>
                    {doc.isManual && <Badge variant="outline" className="text-[10px] px-1.5 py-0">يدوي</Badge>}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 text-warning" />
                    {doc.avgRating || "-"}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(i)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {doc.isManual && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(i)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold text-foreground">{doc.patients}</p>
                  <p className="text-[10px] text-muted-foreground">{lang === "ar" ? "مريض" : "Patients"}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold text-foreground">{doc.revenue.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">{lang === "ar" ? "إيرادات" : "Revenue"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {doctors.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {lang === "ar" ? "لا توجد بيانات كافية" : "No data available"}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editIndex !== null ? "تعديل بيانات الطبيب" : "إضافة طبيب يدوياً"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>اسم الطبيب *</Label>
              <Input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="د. أحمد..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>عدد المرضى</Label>
              <Input
                type="number"
                min={0}
                value={form.patients}
                onChange={e => setForm({ ...form, patients: parseInt(e.target.value) || 0 })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>الإيرادات</Label>
              <Input
                type="number"
                min={0}
                value={form.revenue}
                onChange={e => setForm({ ...form, revenue: parseInt(e.target.value) || 0 })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>التقييم (0-5)</Label>
              <Input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={form.avgRating}
                onChange={e => setForm({ ...form, avgRating: Math.min(5, parseFloat(e.target.value) || 0) })}
                className="mt-1.5"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
              <Button onClick={handleSubmit} disabled={!form.name.trim()}>
                {editIndex !== null ? "حفظ التعديل" : "إضافة"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
