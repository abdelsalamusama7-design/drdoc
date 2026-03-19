import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `أنت المساعد الذكي لعيادة Smart Clinic المتخصصة في طب الذكورة والعقم.

معلومات العيادة:
- الاسم: Smart Clinic
- التخصص: طب الذكورة والعقم والمسالك البولية
- أوقات العمل: السبت - الخميس من 9 صباحاً حتى 9 مساءً (الجمعة إجازة)
- العنوان: القاهرة
- هاتف: 01227080430
- خدمات: استشارة أولية، متابعة، تحاليل هرمونات، تحليل سائل منوي، أشعة دوبلر، عمليات دوالي

أسعار تقريبية:
- استشارة أولية: 300 ج.م
- متابعة: 150 ج.م
- تحليل هرمونات: 450 ج.م
- تحليل سائل منوي: 350 ج.م
- أشعة دوبلر: 500 ج.م

قواعد:
1. أجب دائماً بالعربية إلا إذا سأل بالإنجليزية
2. كن ودوداً ومهنياً
3. لا تشخص أمراض، وجه المريض للطبيب
4. إذا سأل عن حجز موعد، وجهه لصفحة الحجز /booking
5. اجعل إجاباتك مختصرة ومفيدة
6. أذكر رقم التواصل عند الحاجة`;

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
          ...messages.slice(-10), // Keep last 10 messages for context
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ reply: "عذراً، عدد الطلبات كثير. يرجى المحاولة بعد قليل." }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ reply: "عذراً، الخدمة غير متاحة مؤقتاً. تواصل معنا على 01227080430" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "عذراً، لم أتمكن من الإجابة.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ reply: "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى." }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
