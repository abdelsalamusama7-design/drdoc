import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle, UserX, Bell,
  Shield, Plus, Pencil, Loader2
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
  const { toast } = useToast();
  const [patients, setPatients] = useState<PatientNoShow[]>([]);
  const [allPatients, setAllPatients] = useState<{ id: string; name: string }[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editPatient, setEditPatient] = useState<PatientNoShow | null>(null);
  const [formData, setFormData] = useState({ patientId: "", noShowCount: 0, riskScore: 0 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [{ data: patientsData }, { data: aptsData }, { data: allPats }] = await Promise.all([
      supabase.from("patients").select("id, name, phone, no_show_count, risk_score, last_visit, visit_count").order("no_show_count", { ascending: false }),
      supabase.from("appointments").select("*").eq("status", "no_show").order("date", { ascending: false }).limit(50),
      supabase.from("patients").select("id, name").order("name"),
    ]);
    if (patientsData) setPatients(patientsData as PatientNoShow[]);
    if (aptsData) setAppointments(aptsData);
    if (allPats) setAllPatients(allPats);
    setLoading(false);
  };

  const openAdd = () => {
    setEditPatient(null);
    setFormData({ patientId: "", noShowCount: 1, riskScore: 20 });
    setShowAddDialog(true);
  };

  const openEdit = (p: PatientNoShow) => {
    setEditPatient(p);
    setFormData({ patientId: p.id, noShowCount: p.no_show_count || 0, riskScore: p.risk_score || 0 });
    setShowAddDialog(true);
  };

  const handleSubmit = async () => {
    if (!editPatient && !formData.patientId) {
      toast({ title: "خطأ", description: "يرجى اختيار مريض", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const targetId = editPatient ? editPatient.id : formData.patientId;
      const { error } = await supabase.from("patients").update({
        no_show_count: formData.noShowCount,
        risk_score: Math.min(100, formData.riskScore),
      }).eq("id", targetId);
      if (error) throw error;
      toast({ title: "تم الحفظ", description: editPatient ? "تم تعديل بيانات الغياب" : "تم إضافة سجل الغياب" });
      setShowAddDialog(false);
      fetchData();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const frequentNoShows = patients.filter(p => (p.no_show_count || 0) >= 2);
  const highRisk = patients.filter(p => (p.risk_score || 0) >= 60);
  const totalNoShows = patients.reduce((s, p) => s + (p.no_show_count || 0), 0);

  const getRiskBadge = (score: number) => {
    if (score >= 80) return <Badge variant="destructive">عالي جداً</Badge>;
    if (score >= 60) return <Badge className="bg-amber-500 text-white">عالي</Badge>;
    if (score >= 30) return <Badge variant="secondary">متوسط</Badge>;
    return <Badge variant="outline">منخفض</Badge>;
  };

  const chartData = frequentNoShows.slice(0, 10).map(p => ({
    name: p.name.length > 10 ? p.name.slice(0, 10) + "..." : p.name,
    noShows: p.no_show_count || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة الغياب</h1>
          <p className="text-sm text-muted-foreground">تتبع وتقليل معدلات الغياب</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          إضافة غياب يدوي
        </Button>
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
              <p className="text-xs text-muted-foreground">إجمالي الغياب</p>
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
              <p className="text-xs text-muted-foreground">غياب متكرر</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{highRisk.length}</p>
              <p className="text-xs text-muted-foreground">خطر عالي</p>
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
              <p className="text-xs text-muted-foreground">نسبة الغياب</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="frequent">الغياب المتكرر</TabsTrigger>
          <TabsTrigger value="history">السجل</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">أكثر المرضى غياباً</CardTitle>
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

          {highRisk.length > 0 && (
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-base text-destructive flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  مرضى بمخاطر عالية
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
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
                    <TableHead>المريض</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>عدد الغياب</TableHead>
                    <TableHead>المخاطرة</TableHead>
                    <TableHead>آخر زيارة</TableHead>
                    <TableHead>إجراء</TableHead>
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
                      <TableCell>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => openEdit(p)}>
                          <Pencil className="h-3.5 w-3.5" />تعديل
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {frequentNoShows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        لا يوجد غياب متكرر
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
                    <TableHead>المريض</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الوقت</TableHead>
                    <TableHead>الطبيب</TableHead>
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
                        لا يوجد سجل غياب
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editPatient ? "تعديل سجل الغياب" : "إضافة غياب يدوي"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {!editPatient && (
              <div>
                <Label>المريض *</Label>
                <Select value={formData.patientId} onValueChange={v => setFormData({ ...formData, patientId: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="اختر مريض" /></SelectTrigger>
                  <SelectContent>
                    {allPatients.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {editPatient && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-foreground">{editPatient.name}</p>
                <p className="text-xs text-muted-foreground">{editPatient.phone}</p>
              </div>
            )}
            <div>
              <Label>عدد مرات الغياب</Label>
              <Input
                type="number"
                min={0}
                value={formData.noShowCount}
                onChange={e => setFormData({ ...formData, noShowCount: parseInt(e.target.value) || 0 })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>درجة المخاطرة (0-100)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={formData.riskScore}
                onChange={e => setFormData({ ...formData, riskScore: Math.min(100, parseInt(e.target.value) || 0) })}
                className="mt-1.5"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editPatient ? "حفظ التعديل" : "إضافة"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
