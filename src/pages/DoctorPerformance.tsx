import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/hooks/useI18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Users, DollarSign, Star, TrendingUp, Download, Calendar } from "lucide-react";

interface DoctorStats {
  name: string;
  patients: number;
  revenue: number;
  avgRating: number;
  completedVisits: number;
}

export default function DoctorPerformance() {
  const { lang } = useI18n();
  const [period, setPeriod] = useState("month");
  const [doctors, setDoctors] = useState<DoctorStats[]>([]);
  const [loading, setLoading] = useState(true);

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

    // Fetch visits with payments
    const { data: visits } = await supabase
      .from("visits")
      .select("*, payments(*)")
      .gte("date", startDate);

    // Fetch appointments to get doctor names
    const { data: appointments } = await supabase
      .from("appointments")
      .select("doctor, patient_name")
      .gte("date", startDate);

    // Fetch ratings
    const { data: ratings } = await supabase.from("patient_ratings").select("*");

    // Aggregate by doctor from appointments
    const doctorMap: Record<string, DoctorStats> = {};
    appointments?.forEach(apt => {
      const doc = apt.doctor || (lang === "ar" ? "غير محدد" : "Unassigned");
      if (!doctorMap[doc]) doctorMap[doc] = { name: doc, patients: 0, revenue: 0, avgRating: 0, completedVisits: 0 };
      doctorMap[doc].patients++;
    });

    // Add revenue from visits/payments
    visits?.forEach(v => {
      const payments = (v as any).payments as any[];
      if (payments) {
        payments.forEach(p => {
          // Try to map to doctor - simplified
          const firstDoc = Object.keys(doctorMap)[0];
          if (firstDoc && doctorMap[firstDoc]) {
            doctorMap[firstDoc].revenue += Number(p.amount) || 0;
          }
        });
      }
    });

    // Average ratings
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

    setDoctors(Object.values(doctorMap));
    setLoading(false);
  };

  const totalPatients = doctors.reduce((s, d) => s + d.patients, 0);
  const totalRevenue = doctors.reduce((s, d) => s + d.revenue, 0);
  const avgRating = doctors.length > 0
    ? Math.round((doctors.reduce((s, d) => s + d.avgRating, 0) / doctors.filter(d => d.avgRating > 0).length || 1) * 10) / 10
    : 0;

  const COLORS = ["hsl(217, 91%, 60%)", "hsl(199, 89%, 48%)", "hsl(142, 76%, 36%)", "hsl(47, 100%, 68%)", "hsl(0, 84%, 60%)"];

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
      {/* Header */}
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
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
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
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "إجمالي الإيرادات" : "Total Revenue"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-500" />
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
                <Bar dataKey="patients" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]} />
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
          <Card key={doc.name} className="hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold">
                  {doc.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{doc.name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 text-amber-500" />
                    {doc.avgRating || "-"}
                  </div>
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
    </div>
  );
}
