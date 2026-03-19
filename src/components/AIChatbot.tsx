import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import medicalBotImg from "@/assets/medical-bot.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "مرحباً! أنا المساعد الطبي الذكي لعيادة Smart Clinic 🩺\n\nيمكنني مساعدتك في:\n- 💬 أسئلة طبية عامة ونصائح صحية\n- 📋 معلومات عن التحاليل والفحوصات\n- 📅 حجز موعد مع الطبيب\n- 💰 الاستفسار عن الخدمات والأسعار\n- 🏥 معلومات عن العيادة\n\nكيف يمكنني مساعدتك؟ 😊" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) },
      });
      if (error) throw error;
      const reply = typeof data?.reply === "string" && data.reply.trim()
        ? data.reply
        : "عذراً، الخدمة غير متاحة حالياً. يمكنك التواصل معنا على 01227080430";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "عذراً، الخدمة غير متاحة حالياً. يمكنك التواصل معنا على 01227080430" }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating Robot Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-24 left-6 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 group"
            style={{
              background: "radial-gradient(circle at 30% 30%, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.05))",
              border: "2px solid hsl(var(--primary) / 0.3)",
            }}
          >
            <img src={medicalBotImg} alt="Medical Bot" className="w-12 h-12 object-contain drop-shadow-md group-hover:scale-105 transition-transform" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-background animate-pulse" style={{ backgroundColor: "hsl(142, 71%, 45%)" }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-6 z-50 w-[370px] max-w-[calc(100vw-48px)] h-[520px] max-h-[calc(100vh-100px)] bg-card rounded-2xl border border-border flex flex-col overflow-hidden"
            style={{ boxShadow: "0 20px 60px -15px rgba(0,0,0,0.25)" }}
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-l from-primary to-primary/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm p-1 flex items-center justify-center border border-white/30">
                  <img src={medicalBotImg} alt="Bot" className="w-7 h-7 object-contain" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary-foreground">المساعد الطبي الذكي</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "hsl(142, 71%, 45%)" }} />
                    <p className="text-[10px] text-primary-foreground/80">متصل الآن • يرد فوراً</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <X className="h-4 w-4 text-primary-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "assistant" ? "bg-primary/10 p-1" : "bg-accent/10"
                  }`}>
                    {msg.role === "assistant" 
                      ? <img src={medicalBotImg} alt="Bot" className="w-6 h-6 object-contain" />
                      : <User className="h-4 w-4 text-accent" />
                    }
                  </div>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tl-sm"
                      : "bg-muted text-foreground rounded-tr-sm"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center p-1">
                    <img src={medicalBotImg} alt="Bot" className="w-6 h-6 object-contain animate-bounce" />
                  </div>
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-tr-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border p-3">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder="اكتب سؤالك الطبي..."
                  className="flex-1 bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
