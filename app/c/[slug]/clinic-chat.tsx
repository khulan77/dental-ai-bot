'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

type Clinic = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
};

const QUICK_ACTIONS = [
  { icon: '📅', label: 'Цаг захиалах', msg: 'Цаг захиалмаар байна' },
  { icon: '💰', label: 'Үнэ', msg: 'Үйлчилгээний үнэ хэд вэ?' },
  { icon: '👨‍⚕️', label: 'Эмч нар', msg: 'Танай эмч нар хэн бэ?' },
];

export default function ClinicChat({
  clinic,
  initialMessage,
}: {
  clinic: Clinic;
  initialMessage?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const autoSentRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: `Сайн байна уу! 👋 ${clinic.name}-д тавтай морил.\n\nЯмар асуулт байна вэ?`,
      timestamp: new Date().toISOString(),
    }]);
  }, [clinic.name]);

  useEffect(() => {
    if (!initialMessage || autoSentRef.current) return;
    autoSentRef.current = true;
    const timer = setTimeout(() => {
      const current = messagesRef.current;
      const userMsg: ChatMessage = { role: 'user', content: initialMessage, timestamp: new Date().toISOString() };
      const next = [...current, userMsg];
      setMessages(next);
      setLoading(true);
      doFetch(initialMessage, current, next);
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const text = input.trim();
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);
    doFetch(text, messages, next);
  }

  async function sendQuick(msg: string) {
    if (loading) return;
    const userMsg: ChatMessage = { role: 'user', content: msg, timestamp: new Date().toISOString() };
    const current = messagesRef.current;
    const next = [...current, userMsg];
    setMessages(next);
    setLoading(true);
    doFetch(msg, current, next);
  }

  async function doFetch(text: string, history: ChatMessage[], newMessages: ChatMessage[]) {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: clinic.slug, message: text, history }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages([...newMessages, {
        role: 'assistant',
        content: data.reply,
        timestamp: data.timestamp,
      }]);
      if (data.booking) setBooking(data.booking);
    } catch (error) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: `Уучлаарай, алдаа гарлаа. Дахин оролдоно уу.`,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  const showQuickActions = messages.length === 1 && !loading;

  return (
    <div
      className="flex flex-col h-full bg-[#F6F8FC]"
      style={{ fontFamily: 'var(--font-jakarta, var(--font-sans))' }}
    >

      {/* ── HEADER ── */}
      <div className="relative flex-shrink-0 bg-gradient-to-br from-blue-400 to-blue-500 px-5 py-4 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 right-16 w-20 h-20 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-3.5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-2xl shadow-inner">
              🦷
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-blue-500" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-[15px] leading-tight truncate">{clinic.name}</h2>
            <p className="text-blue-100/80 text-[12px] mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              AI ассистент · 24/7 хариулна
            </p>
          </div>
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* AI avatar */}
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-[15px] flex-shrink-0 shadow-sm shadow-blue-200">
                🤖
              </div>
            )}

            {/* Bubble */}
            <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div
                className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-br-md'
                    : 'bg-white text-slate-800 rounded-bl-md border border-slate-100/80'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>

            {/* User avatar */}
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0 shadow-sm">
                Та
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-end gap-2.5 animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-[15px] flex-shrink-0 shadow-sm shadow-blue-200">
              🤖
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-md px-4 py-3.5 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Booking confirmation */}
        {booking && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-lg flex-shrink-0">✓</div>
              <div>
                <p className="text-[14px] font-bold text-emerald-900">Цаг захиалга баталгаажлаа!</p>
                <p className="text-[12px] text-emerald-600 mt-0.5">Удахгүй танд холбогдох болно 📞</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick action chips — only after greeting */}
        {showQuickActions && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
            <p className="text-[11px] text-slate-400 font-medium mb-2 px-1">Түгээмэл асуултууд</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map(a => (
                <button
                  key={a.msg}
                  onClick={() => sendQuick(a.msg)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 active:scale-95 transition-all shadow-sm"
                >
                  <span>{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── INPUT BAR ── */}
      <div className="flex-shrink-0 bg-white border-t border-slate-100 px-4 py-3.5">
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 focus-within:border-blue-400 focus-within:bg-white transition-all shadow-sm">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Асуулт бичих..."
            disabled={loading}
            className="flex-1 bg-transparent text-[14px] text-slate-800 placeholder:text-slate-400 outline-none disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all hover:shadow-md hover:shadow-blue-500/30 active:scale-90 flex-shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-300 mt-2">Powered by AI · {clinic.name}</p>
      </div>
    </div>
  );
}
