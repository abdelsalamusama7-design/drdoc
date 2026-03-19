import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useClinic } from "@/hooks/useClinic";
import { useI18n } from "@/hooks/useI18n";
import { usePatients } from "@/hooks/useSupabaseData";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Brain, User, FileText, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface SearchResult {
  type: "patient" | "diagnosis" | "symptom";
  id: string;
  name: string;
  detail: string;
  relevance: number;
}

export default function SmartSearch() {
  const { lang } = useI18n();
  const { data: patients } = usePatients();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    
    // Local search across patients
    const q = query.toLowerCase();
    const patientResults: SearchResult[] = patients
      .filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.medical_history && p.medical_history.toLowerCase().includes(q)) ||
        (p.allergies && p.allergies.some(a => a.toLowerCase().includes(q))) ||
        (p.current_medications && p.current_medications.some(m => m.toLowerCase().includes(q)))
      )
      .map(p => ({
        type: "patient" as const,
        id: p.id,
        name: p.name,
        detail: [
          p.medical_history && `${lang === "ar" ? "التاريخ: " : "History: "}${p.medical_history.slice(0, 80)}`,
          p.allergies?.length && `${lang === "ar" ? "حساسية: " : "Allergies: "}${p.allergies.join(", ")}`,
        ].filter(Boolean).join(" | ") || (lang === "ar" ? "لا توجد بيانات طبية" : "No medical data"),
        relevance: p.name.toLowerCase().includes(q) ? 1 : 0.7,
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 20);

    setResults(patientResults);

    // AI suggestions via edge function
    try {
      const { data } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [{
            role: "user",
            content: `Based on the search query "${query}" in a medical clinic system, suggest 4 related medical terms, symptoms, or diagnoses that might help the doctor find similar cases. Return ONLY a JSON array of strings. Example: ["term1","term2","term3","term4"]`
          }],
        },
      });
      if (data?.reply) {
        try {
          const parsed = JSON.parse(data.reply);
          if (Array.isArray(parsed)) setAiSuggestions(parsed.slice(0, 4));
        } catch { setAiSuggestions([]); }
      }
    } catch { setAiSuggestions([]); }

    setSearching(false);
  }

  return (
    <div className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          {lang === "ar" ? "البحث الذكي" : "Smart Search"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "ar" ? "ابحث بالأعراض أو التشخيصات أو أسماء الأدوية" : "Search by symptoms, diagnoses, or medications"}
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pr-9 h-12 text-base"
            placeholder={lang === "ar" ? "ابحث عن أعراض، تشخيصات، أدوية..." : "Search symptoms, diagnoses, medications..."}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} disabled={searching} className="h-12 px-6">
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : lang === "ar" ? "بحث" : "Search"}
        </Button>
      </div>

      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-2">
        {[
          lang === "ar" ? "ضغط الدم" : "Blood pressure",
          lang === "ar" ? "سكري" : "Diabetes",
          lang === "ar" ? "حساسية" : "Allergy",
          lang === "ar" ? "ألم مزمن" : "Chronic pain",
          lang === "ar" ? "صداع" : "Headache",
        ].map(s => (
          <Button key={s} variant="outline" size="sm" className="text-xs" onClick={() => { setQuery(s); }}>
            {s}
          </Button>
        ))}
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-primary flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              {lang === "ar" ? "اقتراحات ذكية" : "AI Suggestions"}
            </p>
            <div className="flex flex-wrap gap-2">
              {aiSuggestions.map((s, i) => (
                <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-primary/10" onClick={() => { setQuery(s); handleSearch(); }}>
                  {s}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {results.length} {lang === "ar" ? "نتيجة" : "results"}
          </p>
          {results.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate(`/patients/${r.id}`)}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    {r.type === "patient" ? <User className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm">{r.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.detail}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {query && !searching && results.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>{lang === "ar" ? "لا توجد نتائج" : "No results found"}</p>
        </div>
      )}
    </div>
  );
}
