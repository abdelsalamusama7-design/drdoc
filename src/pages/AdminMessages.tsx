import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, Loader2, User, Stethoscope, Calendar, Search, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useClinic } from "@/hooks/useClinic";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Conversation {
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  last_message: string;
  last_time: string;
  unread_count: number;
  recipient_type: string;
  recipient_name: string;
}

export default function AdminMessages() {
  const { clinic } = useClinic();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!clinic?.id) return;
    setLoading(true);
    const { data, error } = await (supabase.from("patient_messages" as any) as any)
      .select("*")
      .eq("clinic_id", clinic.id)
      .order("created_at", { ascending: false });

    if (error) { setLoading(false); return; }

    // Group by patient_id
    const grouped: Record<string, Conversation> = {};
    for (const msg of (data || [])) {
      if (!grouped[msg.patient_id]) {
        grouped[msg.patient_id] = {
          patient_id: msg.patient_id,
          patient_name: "",
          patient_phone: "",
          last_message: msg.message,
          last_time: msg.created_at,
          unread_count: 0,
          recipient_type: msg.recipient_type || "doctor",
          recipient_name: msg.recipient_name || "",
        };
      }
      if (msg.sender_type === "patient" && !msg.is_read) {
        grouped[msg.patient_id].unread_count++;
      }
    }

    // Fetch patient names
    const patientIds = Object.keys(grouped);
    if (patientIds.length > 0) {
      const { data: patients } = await (supabase.from("patients" as any) as any)
        .select("id, name, phone")
        .in("id", patientIds);
      for (const p of (patients || [])) {
        if (grouped[p.id]) {
          grouped[p.id].patient_name = p.name;
          grouped[p.id].patient_phone = p.phone;
        }
      }
    }

    setConversations(Object.values(grouped).sort((a, b) => new Date(b.last_time).getTime() - new Date(a.last_time).getTime()));
    setLoading(false);
  }, [clinic?.id]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Load messages for selected patient
  useEffect(() => {
    if (!selectedPatientId) return;
    const loadMessages = async () => {
      const { data } = await (supabase.from("patient_messages" as any) as any)
        .select("*")
        .eq("patient_id", selectedPatientId)
        .order("created_at", { ascending: true });
      setMessages(data || []);

      // Mark as read
      await (supabase.from("patient_messages" as any) as any)
        .update({ is_read: true })
        .eq("patient_id", selectedPatientId)
        .eq("sender_type", "patient")
        .eq("is_read", false);

      setConversations(prev => prev.map(c => c.patient_id === selectedPatientId ? { ...c, unread_count: 0 } : c));
    };
    loadMessages();
  }, [selectedPatientId]);

  // Realtime
  useEffect(() => {
    if (!clinic?.id) return;
    const channel = supabase
      .channel("admin-messages-rt")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "patient_messages",
        filter: `clinic_id=eq.${clinic.id}`
      }, (payload) => {
        const newMsg = payload.new as any;
        if (newMsg.patient_id === selectedPatientId) {
          setMessages(prev => [...prev, newMsg]);
        }
        fetchConversations();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [clinic?.id, selectedPatientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !selectedPatientId) return;
    setSending(true);
    try {
      const conv = conversations.find(c => c.patient_id === selectedPatientId);
      const { data, error } = await (supabase.from("patient_messages" as any) as any).insert({
        patient_id: selectedPatientId,
        clinic_id: clinic?.id,
        sender_type: "doctor",
        message: text.trim(),
        recipient_type: "patient",
        recipient_name: profile?.full_name || "الإدارة",
      }).select().single();
      if (error) throw error;
      setMessages(prev => [...prev, data]);
      setText("");
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setSending(false);
  };

  const filteredConvs = search
    ? conversations.filter(c => c.patient_name.includes(search) || c.patient_phone.includes(search))
    : conversations;

  const selectedConv = conversations.find(c => c.patient_id === selectedPatientId);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-120px)] flex rounded-2xl overflow-hidden border border-border bg-card" style={{ boxShadow: "var(--card-shadow)" }}>
      {/* Conversations sidebar */}
      <div className="w-[320px] border-l border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-primary" />
            رسائل المرضى
          </h2>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو الهاتف..."
              className="h-8 text-[11px] pr-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">لا توجد رسائل</div>
          ) : (
            filteredConvs.map(conv => (
              <button
                key={conv.patient_id}
                onClick={() => setSelectedPatientId(conv.patient_id)}
                className={`w-full text-right p-3 border-b border-border/50 hover:bg-muted/50 transition-colors ${
                  selectedPatientId === conv.patient_id ? "bg-primary/5 border-r-2 border-r-primary" : ""
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                    {conv.patient_name?.charAt(0) || "؟"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-semibold text-foreground truncate">{conv.patient_name || "مريض"}</p>
                      {conv.unread_count > 0 && (
                        <Badge variant="default" className="text-[9px] h-4 min-w-[16px] px-1">{conv.unread_count}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {conv.recipient_type === "reception" ? (
                        <Calendar className="h-2.5 w-2.5 text-warning shrink-0" />
                      ) : (
                        <Stethoscope className="h-2.5 w-2.5 text-primary shrink-0" />
                      )}
                      <p className="text-[10px] text-muted-foreground truncate">{conv.last_message}</p>
                    </div>
                    <p className="text-[9px] text-muted-foreground/60 mt-0.5 font-en">
                      {new Date(conv.last_time).toLocaleDateString("ar-SA")} · {new Date(conv.last_time).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {!selectedPatientId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-7 w-7 text-primary/40" />
            </div>
            <p className="text-sm text-muted-foreground">اختر محادثة لعرض الرسائل</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center text-[11px] font-bold text-primary">
                  {selectedConv?.patient_name?.charAt(0) || "؟"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedConv?.patient_name}</p>
                  <p className="text-[10px] text-muted-foreground font-en">{selectedConv?.patient_phone}</p>
                </div>
              </div>
              {selectedConv?.recipient_type && (
                <Badge variant="outline" className="text-[10px]">
                  {selectedConv.recipient_type === "reception" ? "📋 استقبال" : `🩺 ${selectedConv.recipient_name || "دكتور"}`}
                </Badge>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg: any) => (
                <div key={msg.id} className={`flex ${msg.sender_type === "patient" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                    msg.sender_type === "patient"
                      ? "bg-muted text-foreground rounded-bl-sm"
                      : "bg-primary text-primary-foreground rounded-br-sm"
                  }`}>
                    {msg.sender_type === "patient" && msg.recipient_name && (
                      <p className="text-[9px] mb-1 font-medium text-muted-foreground">
                        إلى: {msg.recipient_name} ({msg.recipient_type === "reception" ? "استقبال" : "دكتور"})
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    <p className={`text-[9px] mt-1 ${msg.sender_type === "patient" ? "text-muted-foreground" : "text-primary-foreground/60"}`}>
                      {new Date(msg.created_at).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                      {msg.sender_type === "patient" ? " · المريض" : ` · ${msg.recipient_name || "الإدارة"}`}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply input */}
            <div className="p-3 border-t border-border flex items-center gap-2">
              <Textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="اكتب ردك..."
                className="flex-1 min-h-[40px] max-h-[80px] resize-none text-sm"
                rows={1}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              />
              <Button size="icon" onClick={handleSend} disabled={sending || !text.trim()}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
