import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle, UserX, TrendingDown, CheckCircle, Bell,
  Shield, Calendar, BarChart3
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PatientNoShow {
  id: string;
  name: string;
  phone: string;
  no_show_count: number;
  risk_score: number;
  last_visit: string | null;
  visit_count: number;
}

export default function NoShowManagement() {
  const { lang } = useI18n();
  const { toast } = useToast();
  const [patients, setPatients] = useState<PatientNoShow[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [{ data: patientsData }, { data: aptsData }] = await Promise.all([
      supabase.from("patients").select("id, name, phone, no_show_count, risk_score, last_visit, visit_count").order("no_show_count", { ascending: false }),
      supabase.from("appointments").select("*").eq("status", "no_show").order("date", { ascending: false }).limit(50)
    ]);
    if (patientsData) setPatients(patientsData as PatientNoShow[]);
    if (aptsData) setAppointments(aptsData);
    setLoading(false);
  };

  const markNoShow = async (appointmentId: string, patientId: string) => {
    await supabase.from("appointments").update({ status: "no_show" }).eq("id", appointmentId);
    // Increment no_show_count
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      await supabase.from("patients").update({
        no_show_count: (patient.no_show_count || 0) + 1,
        risk_score: Math.min(100, ((patient.no_show_count || 0) + 1) * 20)
      }).eq("id", patientId);
    }
    toast({ title: lang === "ar" ? "تم تسجيل الغياب" : "No-show recorded" });
    fetchData();
  };

  const frequentNoShows = patients.filter(p => (p.no_show_count || 0) >= 2);
  const highRisk = patients.filter(p => (p.risk_score || 0) >= 60);
  const totalNoShows = patients.reduce((s, p) => s + (p.no_show_count || 0), 0);

  const getRiskBadge = (score: number) => {
    if (score >= 80) return <Badge variant="destructive">{lang === "ar" ? "عالي جداً" : "Very High"}</Badge>;
    if (score >= 60) return <Badge className="bg-amber-500 text-white">{lang === "ar" ? "عالي" : "High"}</Badge>;
    if (score >= 30) return <Badge variant="secondary">{lang === "ar" ? "متوسط" : "Medium"}</Badge>;
    return <Badge variant="outline">{lang === "ar" ? "منخفض" : "Low"}</Badge>;
  };

  // Chart data
  const chartData = frequentNoShows.slice(0, 10).map(p => ({
    name: p.name.length > 10 ? p.name.slice(0, 10) + "..." : p.name,
    noShows: p.no_show_count || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {lang === "ar" ? "إدارة الغياب" : "No-Show Management"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {lang === "ar" ? "تتبع وتقليل معدلات الغياب" : "Track & reduce absence rates"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <UserX className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalNoShows}</p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "إجمالي الغياب" : "Total No-Shows"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{frequentNoShows.length}</p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "غياب متكرر" : "Frequent No-Shows"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{highRisk.length}</p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "خطر عالي" : "High Risk"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {patients.length > 0 ? Math.round((totalNoShows / Math.max(patients.reduce((s, p) => s + (p.visit_count || 0), 0), 1)) * 100) : 0}%
              </p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "نسبة الغياب" : "No-Show Rate"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">{lang === "ar" ? "نظرة عامة" : "Overview"}</TabsTrigger>
          <TabsTrigger value="frequent">{lang === "ar" ? "الغياب المتكرر" : "Frequent"}</TabsTrigger>
          <TabsTrigger value="history">{lang === "ar" ? "السجل" : "History"}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{lang === "ar" ? "أكثر المرضى غياباً" : "Most Frequent No-Shows"}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="noShows" fill="hsl(0, 84%, 60%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* High Risk Patients */}
          {highRisk.length > 0 && (
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-base text-destructive flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {lang === "ar" ? "مرضى بمخاطر عالية" : "High Risk Patients"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {highRisk.slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                      <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center text-xs font-bold text-destructive">
                        {p.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.phone}</p>
                      </div>
                      <span className="text-sm font-bold text-destructive">{p.no_show_count}x</span>
                      {getRiskBadge(p.risk_score || 0)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="frequent">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{lang === "ar" ? "المريض" : "Patient"}</TableHead>
                    <TableHead>{lang === "ar" ? "الهاتف" : "Phone"}</TableHead>
                    <TableHead>{lang === "ar" ? "عدد الغياب" : "No-Shows"}</TableHead>
                    <TableHead>{lang === "ar" ? "المخاطرة" : "Risk"}</TableHead>
                    <TableHead>{lang === "ar" ? "آخر زيارة" : "Last Visit"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {frequentNoShows.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="font-mono text-xs">{p.phone}</TableCell>
                      <TableCell>
                        <span className="text-destructive font-bold">{p.no_show_count}</span>
                      </TableCell>
                      <TableCell>{getRiskBadge(p.risk_score || 0)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {p.last_visit ? new Date(p.last_visit).toLocaleDateString("ar-EG") : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {frequentNoShows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {lang === "ar" ? "لا يوجد غياب متكرر" : "No frequent no-shows"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{lang === "ar" ? "المريض" : "Patient"}</TableHead>
                    <TableHead>{lang === "ar" ? "التاريخ" : "Date"}</TableHead>
                    <TableHead>{lang === "ar" ? "الوقت" : "Time"}</TableHead>
                    <TableHead>{lang === "ar" ? "الطبيب" : "Doctor"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map(apt => (
                    <TableRow key={apt.id}>
                      <TableCell className="font-medium">{apt.patient_name}</TableCell>
                      <TableCell>{apt.date}</TableCell>
                      <TableCell>{apt.time}</TableCell>
                      <TableCell>{apt.doctor || "-"}</TableCell>
                    </TableRow>
                  ))}
                  {appointments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        {lang === "ar" ? "لا يوجد سجل غياب" : "No no-show history"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
