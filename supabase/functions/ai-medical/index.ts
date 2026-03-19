import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `أنت مساعد طبي ذكي متخصص في التوعية الصحية، وخاصة في مجال طب الذكورة والعقم والمسالك البولية.

دورك:
1. تقديم معلومات صحية عامة ودقيقة
2. شرح الفحوصات والتحاليل الطبية الشائعة
3. توضيح الأعراض العامة ومتى يجب زيارة الطبيب
4. تقديم نصائح للحفاظ على الصحة العامة
5. شرح العلاجات والأدوية الشائعة بشكل مبسط

قواعد صارمة:
- لا تشخص أي مرض أبداً
- لا تصف أي دواء
- وجّه دائماً لزيارة الطبيب المختص للتشخيص والعلاج
- كن واضحاً أن المعلومات توعوية وليست بديلاً عن الاستشارة الطبية
- أجب بالعربية إلا إذا سُئلت بالإنجليزية
- كن ودوداً ومطمئناً
- إذا كانت الأعراض خطيرة، انصح بالتوجه فوراً للطوارئ

أمثلة على ما يمكنك المساعدة فيه:
- "ما هو تحليل السائل المنوي؟" → اشرح التحليل وأهميته
- "عندي ألم" → اسأل عن مدة الألم ومكانه وانصح بزيارة الطبيب
- "متى أحتاج أشعة دوبلر؟" → اشرح متى يُطلب هذا الفحص`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-10),
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ reply: "عذراً، عدد الطلبات كثير. يرجى المحاولة بعد قليل." }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ reply: "عذراً، الخدمة غير متاحة مؤقتاً." }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "عذراً، لم أتمكن من الإجابة.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-medical error:", e);
    return new Response(JSON.stringify({ reply: "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى." }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
