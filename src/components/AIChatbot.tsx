import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "مرحباً! أنا المساعد الذكي لعيادة د. خالد جادالله. كيف يمكنني مساعدتك؟ 😊\n\nيمكنني مساعدتك في:\n- حجز موعد\n- الاستفسار عن الخدمات والأسعار\n- معلومات عن العيادة\n- أسئلة طبية عامة" }
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
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background" />
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
            className="fixed bottom-6 left-6 z-50 w-[360px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-100px)] bg-card rounded-2xl border border-border flex flex-col overflow-hidden"
            style={{ boxShadow: "0 20px 60px -15px rgba(0,0,0,0.2)" }}
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <div>
                  <h3 className="text-sm font-bold">المساعد الذكي</h3>
                  <p className="text-[10px] opacity-80">متصل الآن</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-primary-foreground/10 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "assistant" ? "bg-primary/10" : "bg-accent/10"
                  }`}>
                    {msg.role === "assistant" ? <Bot className="h-3.5 w-3.5 text-primary" /> : <User className="h-3.5 w-3.5 text-accent" />}
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
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-tr-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
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
                  placeholder="اكتب رسالتك..."
                  className="flex-1 bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
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
