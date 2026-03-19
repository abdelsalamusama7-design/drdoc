import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, FileText, Send, DollarSign, Loader2, Search, Eye, CheckCircle, XCircle, Clock, AlertTriangle, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/useI18n";
import { useClinic } from "@/hooks/useClinic";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const anim = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25 } };

interface InsuranceCompany {
  id: string; name: string; name_en?: string; contact_person?: string; phone?: string;
  email?: string; address?: string; contract_start?: string; contract_end?: string;
  discount_percentage: number; notes?: string; is_active: boolean; created_at: string;
}

interface InsuranceClaim {
  id: string; insurance_company_id: string; patient_id: string; visit_id?: string;
  claim_number?: string; claim_date: string; total_amount: number; approved_amount: number;
  patient_share: number; status: string; rejection_reason?: string; notes?: string;
  submitted_at?: string; resolved_at?: string; created_at: string;
}

interface InsuranceInvoice {
  id: string; insurance_company_id: string; invoice_number?: string; invoice_date: string;
  due_date?: string; total_amount: number; paid_amount: number; status: string;
  notes?: string; sent_at?: string; paid_at?: string; created_at: string;
}

export default function Insurance() {
  const { lang, t } = useI18n();
  const { clinic } = useClinic();
  const { user } = useAuth();
  const { toast } = useToast();

  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [invoices, setInvoices] = useState<InsuranceInvoice[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState<InsuranceCompany | null>(null);

  // Form states
  const [companyForm, setCompanyForm] = useState({ name: "", name_en: "", contact_person: "", phone: "", email: "", address: "", contract_start: "", contract_end: "", discount_percentage: 0, notes: "", is_active: true });
  const [claimForm, setClaimForm] = useState({ insurance_company_id: "", patient_id: "", claim_number: "", total_amount: 0, patient_share: 0, notes: "" });
  const [invoiceForm, setInvoiceForm] = useState({ insurance_company_id: "", invoice_number: "", due_date: "", notes: "" });
  const [selectedClaimsForInvoice, setSelectedClaimsForInvoice] = useState<string[]>([]);

  const fetchAll = useCallback(async () => {
    if (!clinic?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [compRes, claimRes, invRes, patRes] = await Promise.all([
        (supabase.from("insurance_companies" as any) as any).select("*").eq("clinic_id", clinic.id).order("name"),
        (supabase.from("insurance_claims" as any) as any).select("*").eq("clinic_id", clinic.id).order("created_at", { ascending: false }),
        (supabase.from("insurance_invoices" as any) as any).select("*").eq("clinic_id", clinic.id).order("created_at", { ascending: false }),
        (supabase.from("patients" as any) as any).select("id, name, phone, insurance_company_id, insurance_number").eq("clinic_id", clinic.id),
      ]);
      setCompanies(compRes.data || []);
      setClaims(claimRes.data || []);
      setInvoices(invRes.data || []);
      setPatients(patRes.data || []);
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  }, [clinic?.id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const getCompanyName = (id: string) => companies.find(c => c.id === id)?.name || "—";
  const getPatientName = (id: string) => patients.find(p => p.id === id)?.name || "—";

  // Stats
  const totalClaimsAmount = claims.reduce((s, c) => s + (c.total_amount || 0), 0);
  const approvedAmount = claims.filter(c => c.status === "approved").reduce((s, c) => s + (c.approved_amount || 0), 0);
  const pendingClaims = claims.filter(c => c.status === "pending").length;
  const totalInvoiced = invoices.reduce((s, i) => s + (i.total_amount || 0), 0);
  const totalPaid = invoices.reduce((s, i) => s + (i.paid_amount || 0), 0);

  // Save company
  const saveCompany = async () => {
    try {
      if (editingCompany) {
        await (supabase.from("insurance_companies" as any) as any).update(companyForm).eq("id", editingCompany.id);
      } else {
        await (supabase.from("insurance_companies" as any) as any).insert({ ...companyForm, clinic_id: clinic?.id });
      }
      toast({ title: "✅", description: editingCompany ? "تم تحديث الشركة" : "تم إضافة الشركة" });
      setShowCompanyDialog(false);
      resetCompanyForm();
      fetchAll();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const resetCompanyForm = () => {
    setCompanyForm({ name: "", name_en: "", contact_person: "", phone: "", email: "", address: "", contract_start: "", contract_end: "", discount_percentage: 0, notes: "", is_active: true });
    setEditingCompany(null);
  };

  // Save claim
  const saveClaim = async () => {
    try {
      await (supabase.from("insurance_claims" as any) as any).insert({
        ...claimForm, clinic_id: clinic?.id, created_by: user?.id, status: "pending",
        claim_date: new Date().toISOString().split("T")[0],
      });
      toast({ title: "✅", description: "تم إنشاء المطالبة" });
      setShowClaimDialog(false);
      setClaimForm({ insurance_company_id: "", patient_id: "", claim_number: "", total_amount: 0, patient_share: 0, notes: "" });
      fetchAll();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  // Update claim status
  const updateClaimStatus = async (id: string, status: string, approved_amount?: number) => {
    try {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (status === "approved" && approved_amount !== undefined) updates.approved_amount = approved_amount;
      if (status === "approved" || status === "rejected") updates.resolved_at = new Date().toISOString();
      if (status === "submitted") updates.submitted_at = new Date().toISOString();
      await (supabase.from("insurance_claims" as any) as any).update(updates).eq("id", id);
      toast({ title: "✅", description: "تم تحديث الحالة" });
      fetchAll();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  // Create invoice from approved claims
  const createInvoice = async () => {
    if (!invoiceForm.insurance_company_id || selectedClaimsForInvoice.length === 0) return;
    try {
      const selectedClaims = claims.filter(c => selectedClaimsForInvoice.includes(c.id));
      const total = selectedClaims.reduce((s, c) => s + (c.approved_amount || c.total_amount), 0);

      const { data: inv, error } = await (supabase.from("insurance_invoices" as any) as any)
        .insert({
          ...invoiceForm, clinic_id: clinic?.id, created_by: user?.id,
          total_amount: total, status: "draft",
          invoice_date: new Date().toISOString().split("T")[0],
        }).select().single();
      if (error) throw error;

      // Link claims
      const links = selectedClaimsForInvoice.map(cid => {
        const cl = selectedClaims.find(c => c.id === cid);
        return { invoice_id: (inv as any).id, claim_id: cid, amount: cl?.approved_amount || cl?.total_amount || 0 };
      });
      await (supabase.from("insurance_invoice_claims" as any) as any).insert(links);

      toast({ title: "✅", description: "تم إنشاء الفاتورة" });
      setShowInvoiceDialog(false);
      setInvoiceForm({ insurance_company_id: "", invoice_number: "", due_date: "", notes: "" });
      setSelectedClaimsForInvoice([]);
      fetchAll();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const updateInvoiceStatus = async (id: string, status: string) => {
    try {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (status === "sent") updates.sent_at = new Date().toISOString();
      if (status === "paid") updates.paid_at = new Date().toISOString();
      await (supabase.from("insurance_invoices" as any) as any).update(updates).eq("id", id);
      toast({ title: "✅", description: "تم تحديث حالة الفاتورة" });
      fetchAll();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const exportInvoicePDF = async (inv: InsuranceInvoice) => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const companyName = getCompanyName(inv.insurance_company_id);
    const invoiceClaims = claims.filter(c => c.insurance_company_id === inv.insurance_company_id && c.status === "approved");

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Insurance Invoice", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice #: ${inv.invoice_number || inv.id.substring(0, 8)}`, 15, 35);
    doc.text(`Date: ${inv.invoice_date}`, 15, 42);
    doc.text(`Due Date: ${inv.due_date || "N/A"}`, 15, 49);
    doc.text(`Company: ${companyName}`, 15, 56);
    doc.text(`Status: ${inv.status}`, 15, 63);

    // Line
    doc.setDrawColor(200);
    doc.line(15, 68, 195, 68);

    // Claims table
    const tableData = invoiceClaims.map((cl, i) => [
      String(i + 1),
      getPatientName(cl.patient_id),
      cl.claim_number || "-",
      cl.claim_date || "-",
      cl.total_amount.toLocaleString(),
      (cl.approved_amount || 0).toLocaleString(),
      (cl.patient_share || 0).toLocaleString(),
    ]);

    autoTable(doc, {
      startY: 73,
      head: [["#", "Patient", "Claim #", "Date", "Total", "Approved", "Patient Share"]],
      body: tableData.length > 0 ? tableData : [["", "No claims", "", "", "", "", ""]],
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], fontSize: 8, halign: "center" },
      bodyStyles: { fontSize: 8, halign: "center" },
      columnStyles: { 1: { halign: "left" } },
    });

    // Totals
    const finalY = (doc as any).lastAutoTable?.finalY || 120;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount: ${inv.total_amount.toLocaleString()} EGP`, 15, finalY + 12);
    doc.text(`Paid Amount: ${inv.paid_amount.toLocaleString()} EGP`, 15, finalY + 20);
    doc.text(`Remaining: ${(inv.total_amount - inv.paid_amount).toLocaleString()} EGP`, 15, finalY + 28);

    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150);
    doc.text("د. خالد جادالله - Insurance Invoice", 105, 285, { align: "center" });

    doc.save(`invoice-${inv.invoice_number || inv.id.substring(0, 8)}.pdf`);
    toast({ title: "✅", description: "تم تصدير الفاتورة بنجاح" });
  };

  const claimStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "معلقة", variant: "secondary" },
      submitted: { label: "مرسلة", variant: "outline" },
      approved: { label: "مقبولة", variant: "default" },
      rejected: { label: "مرفوضة", variant: "destructive" },
      partial: { label: "جزئي", variant: "outline" },
    };
    const m = map[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={m.variant} className="text-[10px]">{m.label}</Badge>;
  };

  const invoiceStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      draft: { label: "مسودة", variant: "secondary" },
      sent: { label: "مرسلة", variant: "outline" },
      paid: { label: "مدفوعة", variant: "default" },
      overdue: { label: "متأخرة", variant: "destructive" },
    };
    const m = map[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={m.variant} className="text-[10px]">{m.label}</Badge>;
  };

  const approvedClaimsForCompany = (companyId: string) =>
    claims.filter(c => c.insurance_company_id === companyId && c.status === "approved");

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <motion.div {...anim} className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "شركات التأمين", value: companies.length, icon: Building2, color: "text-primary", bg: "bg-primary/10" },
          { label: "مطالبات معلقة", value: pendingClaims, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
          { label: "إجمالي المطالبات", value: `${totalClaimsAmount.toLocaleString()}`, icon: FileText, color: "text-accent", bg: "bg-accent/10" },
          { label: "المبالغ المقبولة", value: `${approvedAmount.toLocaleString()}`, icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
          { label: "المحصّل", value: `${totalPaid.toLocaleString()}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-2`}><s.icon className={`h-4 w-4 ${s.color}`} /></div>
              <p className="text-lg font-bold text-foreground font-en">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="companies" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="companies" className="gap-1.5 text-xs"><Building2 className="h-3.5 w-3.5" />الشركات</TabsTrigger>
          <TabsTrigger value="claims" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" />المطالبات</TabsTrigger>
          <TabsTrigger value="invoices" className="gap-1.5 text-xs"><Send className="h-3.5 w-3.5" />الفواتير</TabsTrigger>
        </TabsList>

        {/* ── Companies Tab ── */}
        <TabsContent value="companies" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9 text-sm" />
            </div>
            <Button size="sm" className="gap-1.5" onClick={() => { resetCompanyForm(); setShowCompanyDialog(true); }}>
              <Plus className="h-4 w-4" />إضافة شركة
            </Button>
          </div>

          <div className="grid gap-3">
            {companies.filter(c => c.name.includes(search) || c.name_en?.toLowerCase().includes(search.toLowerCase())).map(company => (
              <Card key={company.id} className="cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => { setEditingCompany(company); setCompanyForm({ name: company.name, name_en: company.name_en || "", contact_person: company.contact_person || "", phone: company.phone || "", email: company.email || "", address: company.address || "", contract_start: company.contract_start || "", contract_end: company.contract_end || "", discount_percentage: company.discount_percentage || 0, notes: company.notes || "", is_active: company.is_active }); setShowCompanyDialog(true); }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{company.name}</p>
                        {company.name_en && <p className="text-[10px] text-muted-foreground font-en">{company.name_en}</p>}
                        <p className="text-[10px] text-muted-foreground">{company.contact_person} · {company.phone}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <Badge variant={company.is_active ? "default" : "secondary"} className="text-[9px]">
                        {company.is_active ? "نشط" : "غير نشط"}
                      </Badge>
                      {company.discount_percentage > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-1 font-en">{company.discount_percentage}% خصم</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
                    <span>مرضى مسجلون: {patients.filter(p => p.insurance_company_id === company.id).length}</span>
                    <span>مطالبات: {claims.filter(c => c.insurance_company_id === company.id).length}</span>
                    {company.contract_end && <span className="font-en">انتهاء العقد: {company.contract_end}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
            {companies.length === 0 && (
              <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">لا توجد شركات تأمين مسجلة</CardContent></Card>
            )}
          </div>
        </TabsContent>

        {/* ── Claims Tab ── */}
        <TabsContent value="claims" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">المطالبات ({claims.length})</p>
            <Button size="sm" className="gap-1.5" onClick={() => setShowClaimDialog(true)} disabled={companies.length === 0}>
              <Plus className="h-4 w-4" />مطالبة جديدة
            </Button>
          </div>

          <div className="space-y-2">
            {claims.map(claim => (
              <Card key={claim.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{getPatientName(claim.patient_id)}</p>
                      <p className="text-[10px] text-muted-foreground">{getCompanyName(claim.insurance_company_id)} · {claim.claim_number || "—"}</p>
                    </div>
                    <div className="text-left space-y-1">
                      {claimStatusBadge(claim.status)}
                      <p className="text-[10px] text-muted-foreground font-en">{claim.claim_date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span>المبلغ: <strong className="font-en">{claim.total_amount.toLocaleString()}</strong></span>
                    {claim.approved_amount > 0 && <span className="text-success">مقبول: <strong className="font-en">{claim.approved_amount.toLocaleString()}</strong></span>}
                    {claim.patient_share > 0 && <span>حصة المريض: <strong className="font-en">{claim.patient_share.toLocaleString()}</strong></span>}
                  </div>
                  {claim.rejection_reason && <p className="text-[10px] text-destructive mt-1">{claim.rejection_reason}</p>}

                  <div className="flex items-center gap-2 mt-3">
                    {claim.status === "pending" && (
                      <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => updateClaimStatus(claim.id, "submitted")}>
                        <Send className="h-3 w-3" />إرسال
                      </Button>
                    )}
                    {claim.status === "submitted" && (
                      <>
                        <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 text-success" onClick={() => updateClaimStatus(claim.id, "approved", claim.total_amount)}>
                          <CheckCircle className="h-3 w-3" />قبول
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 text-destructive" onClick={() => updateClaimStatus(claim.id, "rejected")}>
                          <XCircle className="h-3 w-3" />رفض
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {claims.length === 0 && (
              <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">لا توجد مطالبات</CardContent></Card>
            )}
          </div>
        </TabsContent>

        {/* ── Invoices Tab ── */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">فواتير التأمين ({invoices.length})</p>
            <Button size="sm" className="gap-1.5" onClick={() => setShowInvoiceDialog(true)} disabled={companies.length === 0}>
              <Plus className="h-4 w-4" />فاتورة جديدة
            </Button>
          </div>

          <div className="space-y-2">
            {invoices.map(inv => (
              <Card key={inv.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{inv.invoice_number || `فاتورة #${inv.id.substring(0, 6)}`}</p>
                      <p className="text-[10px] text-muted-foreground">{getCompanyName(inv.insurance_company_id)}</p>
                    </div>
                    <div className="text-left space-y-1">
                      {invoiceStatusBadge(inv.status)}
                      <p className="text-[10px] text-muted-foreground font-en">{inv.invoice_date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span>المبلغ: <strong className="font-en">{inv.total_amount.toLocaleString()}</strong></span>
                    <span className="text-success">مدفوع: <strong className="font-en">{inv.paid_amount.toLocaleString()}</strong></span>
                    {inv.due_date && <span className="text-muted-foreground font-en">الاستحقاق: {inv.due_date}</span>}
                  </div>

                   <div className="flex items-center gap-2 mt-3">
                    <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => exportInvoicePDF(inv)}>
                      <Download className="h-3 w-3" />تصدير PDF
                    </Button>
                    {inv.status === "draft" && (
                      <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => updateInvoiceStatus(inv.id, "sent")}>
                        <Send className="h-3 w-3" />إرسال
                      </Button>
                    )}
                    {inv.status === "sent" && (
                      <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 text-success" onClick={() => updateInvoiceStatus(inv.id, "paid")}>
                        <CheckCircle className="h-3 w-3" />تم الدفع
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {invoices.length === 0 && (
              <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">لا توجد فواتير</CardContent></Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Company Dialog ── */}
      <Dialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCompany ? "تعديل شركة التأمين" : "إضافة شركة تأمين"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">الاسم بالعربي *</Label><Input value={companyForm.name} onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })} /></div>
              <div><Label className="text-xs">الاسم بالإنجليزي</Label><Input value={companyForm.name_en} onChange={e => setCompanyForm({ ...companyForm, name_en: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">المسؤول</Label><Input value={companyForm.contact_person} onChange={e => setCompanyForm({ ...companyForm, contact_person: e.target.value })} /></div>
              <div><Label className="text-xs">الهاتف</Label><Input value={companyForm.phone} onChange={e => setCompanyForm({ ...companyForm, phone: e.target.value })} /></div>
            </div>
            <div><Label className="text-xs">البريد</Label><Input type="email" value={companyForm.email} onChange={e => setCompanyForm({ ...companyForm, email: e.target.value })} /></div>
            <div><Label className="text-xs">العنوان</Label><Input value={companyForm.address} onChange={e => setCompanyForm({ ...companyForm, address: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs">بداية العقد</Label><Input type="date" value={companyForm.contract_start} onChange={e => setCompanyForm({ ...companyForm, contract_start: e.target.value })} /></div>
              <div><Label className="text-xs">نهاية العقد</Label><Input type="date" value={companyForm.contract_end} onChange={e => setCompanyForm({ ...companyForm, contract_end: e.target.value })} /></div>
              <div><Label className="text-xs">نسبة الخصم %</Label><Input type="number" value={companyForm.discount_percentage} onChange={e => setCompanyForm({ ...companyForm, discount_percentage: Number(e.target.value) })} /></div>
            </div>
            <div><Label className="text-xs">ملاحظات</Label><Textarea value={companyForm.notes} onChange={e => setCompanyForm({ ...companyForm, notes: e.target.value })} rows={2} /></div>
            <div className="flex items-center gap-2">
              <Switch checked={companyForm.is_active} onCheckedChange={v => setCompanyForm({ ...companyForm, is_active: v })} />
              <Label className="text-xs">نشط</Label>
            </div>
            <Button onClick={saveCompany} className="w-full" disabled={!companyForm.name}>{editingCompany ? "حفظ التعديلات" : "إضافة"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Claim Dialog ── */}
      <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>مطالبة تأمين جديدة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">شركة التأمين *</Label>
              <Select value={claimForm.insurance_company_id} onValueChange={v => setClaimForm({ ...claimForm, insurance_company_id: v })}>
                <SelectTrigger><SelectValue placeholder="اختر الشركة" /></SelectTrigger>
                <SelectContent>{companies.filter(c => c.is_active).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">المريض *</Label>
              <Select value={claimForm.patient_id} onValueChange={v => setClaimForm({ ...claimForm, patient_id: v })}>
                <SelectTrigger><SelectValue placeholder="اختر المريض" /></SelectTrigger>
                <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} - {p.phone}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">رقم المطالبة</Label><Input value={claimForm.claim_number} onChange={e => setClaimForm({ ...claimForm, claim_number: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">المبلغ الكلي *</Label><Input type="number" value={claimForm.total_amount} onChange={e => setClaimForm({ ...claimForm, total_amount: Number(e.target.value) })} /></div>
              <div><Label className="text-xs">حصة المريض</Label><Input type="number" value={claimForm.patient_share} onChange={e => setClaimForm({ ...claimForm, patient_share: Number(e.target.value) })} /></div>
            </div>
            <div><Label className="text-xs">ملاحظات</Label><Textarea value={claimForm.notes} onChange={e => setClaimForm({ ...claimForm, notes: e.target.value })} rows={2} /></div>
            <Button onClick={saveClaim} className="w-full" disabled={!claimForm.insurance_company_id || !claimForm.patient_id || !claimForm.total_amount}>إنشاء المطالبة</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Invoice Dialog ── */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>إنشاء فاتورة تأمين</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">شركة التأمين *</Label>
              <Select value={invoiceForm.insurance_company_id} onValueChange={v => { setInvoiceForm({ ...invoiceForm, insurance_company_id: v }); setSelectedClaimsForInvoice([]); }}>
                <SelectTrigger><SelectValue placeholder="اختر الشركة" /></SelectTrigger>
                <SelectContent>{companies.filter(c => c.is_active).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">رقم الفاتورة</Label><Input value={invoiceForm.invoice_number} onChange={e => setInvoiceForm({ ...invoiceForm, invoice_number: e.target.value })} /></div>
              <div><Label className="text-xs">تاريخ الاستحقاق</Label><Input type="date" value={invoiceForm.due_date} onChange={e => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })} /></div>
            </div>

            {invoiceForm.insurance_company_id && (
              <div>
                <Label className="text-xs mb-2 block">المطالبات المقبولة (اختر للفاتورة)</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {approvedClaimsForCompany(invoiceForm.insurance_company_id).map(cl => (
                    <label key={cl.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted">
                      <input type="checkbox" checked={selectedClaimsForInvoice.includes(cl.id)}
                        onChange={e => setSelectedClaimsForInvoice(prev => e.target.checked ? [...prev, cl.id] : prev.filter(id => id !== cl.id))}
                        className="accent-primary" />
                      <span className="text-xs flex-1">{getPatientName(cl.patient_id)} - {cl.claim_number || "—"}</span>
                      <span className="text-xs font-bold font-en">{(cl.approved_amount || cl.total_amount).toLocaleString()}</span>
                    </label>
                  ))}
                  {approvedClaimsForCompany(invoiceForm.insurance_company_id).length === 0 && (
                    <p className="text-[10px] text-muted-foreground text-center p-4">لا توجد مطالبات مقبولة لهذه الشركة</p>
                  )}
                </div>
                {selectedClaimsForInvoice.length > 0 && (
                  <p className="text-xs font-semibold text-foreground mt-2">
                    الإجمالي: <span className="font-en">{claims.filter(c => selectedClaimsForInvoice.includes(c.id)).reduce((s, c) => s + (c.approved_amount || c.total_amount), 0).toLocaleString()}</span> ج.م
                  </p>
                )}
              </div>
            )}

            <div><Label className="text-xs">ملاحظات</Label><Textarea value={invoiceForm.notes} onChange={e => setInvoiceForm({ ...invoiceForm, notes: e.target.value })} rows={2} /></div>
            <Button onClick={createInvoice} className="w-full" disabled={!invoiceForm.insurance_company_id || selectedClaimsForInvoice.length === 0}>
              إنشاء الفاتورة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
