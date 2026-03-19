import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/hooks/useI18n";
import { usePatients } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, AlertTriangle, Stethoscope, Pill, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";

interface AIResponse {
  diagnosis_suggestions: string[];
  treatment_plans: string[];
  medications: string[];
  precautions: string[];
}

export default function AITreatmentAssistant() {
  const { lang } = useI18n();
  const { data: patients } = usePatients();
  const [patientId, setPatientId] = useState("");
  const [condition, setCondition] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);

  const selectedPatient = patients.find(p => p.id === patientId);

  async function handleAnalyze() {
    if (!condition.trim()) return;
    setLoading(true);
    setResponse(null);

    const patientContext = selectedPatient
      ? `Patient info: Age ${selectedPatient.age}, Gender: ${selectedPatient.gender}, Allergies: ${selectedPatient.allergies?.join(", ") || "None"}, Current medications: ${selectedPatient.current_medications?.join(", ") || "None"}, Medical history: ${selectedPatient.medical_history || "None"}`
      : "";

    try {
      const { data } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [{
            role: "user",
            content: `You are a medical assistant AI. ${patientContext}

The doctor describes the patient's condition as: "${condition}"

Provide a JSON response with these fields (all arrays of strings):
- diagnosis_suggestions: 3-4 possible diagnoses
- treatment_plans: 3-4 recommended treatment approaches
- medications: 3-5 commonly prescribed medications for this condition
- precautions: 2-3 important precautions or contraindications

Return ONLY valid JSON, no markdown.`
          }],
        },
      });

      if (data?.reply) {
        try {
          const cleaned = data.reply.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          setResponse(JSON.parse(cleaned));
        } catch {
          setResponse({
            diagnosis_suggestions: [data.reply.slice(0, 200)],
            treatment_plans: [],
            medications: [],
            precautions: [],
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          {lang === "ar" ? "مساعد العلاج بالذكاء الاصطناعي" : "AI Treatment Assistant"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "ar" ? "أدخل حالة المريض للحصول على اقتراحات تشخيص وعلاج" : "Enter patient condition for diagnosis & treatment suggestions"}
        </p>
      </div>

      {/* Disclaimer */}
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-warning">
              {lang === "ar" ? "تنبيه هام" : "Important Disclaimer"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lang === "ar"
                ? "هذه الاقتراحات للمساعدة فقط وليست بديلاً عن التشخيص الطبي. القرار النهائي للطبيب المعالج."
                : "These suggestions are for assistance only and do not replace professional medical diagnosis. Final decisions rest with the treating physician."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Input */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <Select value={patientId} onValueChange={setPatientId}>
            <SelectTrigger>
              <SelectValue placeholder={lang === "ar" ? "اختر مريض (اختياري)" : "Select patient (optional)"} />
            </SelectTrigger>
            <SelectContent>
              {patients.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} {p.age ? `(${p.age})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedPatient && (
            <div className="flex flex-wrap gap-2">
              {selectedPatient.allergies?.map((a, i) => (
                <Badge key={i} variant="destructive" className="text-[10px]">⚠ {a}</Badge>
              ))}
              {selectedPatient.current_medications?.map((m, i) => (
                <Badge key={i} variant="secondary" className="text-[10px]">💊 {m}</Badge>
              ))}
            </div>
          )}

          <Textarea
            rows={4}
            placeholder={lang === "ar"
              ? "وصف الحالة: الأعراض، مدة الشكوى، الفحوصات السابقة..."
              : "Describe condition: symptoms, duration, previous tests..."}
            value={condition}
            onChange={e => setCondition(e.target.value)}
          />

          <Button className="w-full" onClick={handleAnalyze} disabled={loading || !condition.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            {lang === "ar" ? "تحليل الحالة" : "Analyze Condition"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {response && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: lang === "ar" ? "تشخيصات محتملة" : "Possible Diagnoses", icon: Stethoscope, items: response.diagnosis_suggestions, color: "text-primary" },
            { title: lang === "ar" ? "خطط العلاج" : "Treatment Plans", icon: ClipboardList, items: response.treatment_plans, color: "text-green-500" },
            { title: lang === "ar" ? "أدوية مقترحة" : "Suggested Medications", icon: Pill, items: response.medications, color: "text-blue-500" },
            { title: lang === "ar" ? "تحذيرات وموانع" : "Precautions", icon: AlertTriangle, items: response.precautions, color: "text-warning" },
          ].map((section, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm flex items-center gap-2 ${section.color}`}>
                  <section.icon className="h-4 w-4" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {section.items?.length ? section.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground">{lang === "ar" ? "لا توجد بيانات" : "No data"}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </div>
  );
}
