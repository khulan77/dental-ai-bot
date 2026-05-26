'use client';

import { useState, useRef, useEffect } from 'react';

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

export default function ClinicChat({ clinic }: { clinic: Clinic }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: clinic.slug,
          message: input,
          history: messages,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: data.reply,
          timestamp: data.timestamp,
        },
      ]);

      if (data.booking) setBooking(data.booking);
    } catch (error) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `⚠️ Алдаа гарлаа: ${error instanceof Error ? error.message : 'Unknown'}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
              🦷
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-white truncate">{clinic.name}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-emerald-300"></div>
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-300 animate-ping"></div>
                </div>
                <p className="text-xs text-white/90">24/7 хариулна</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-5 space-y-3 bg-gradient-to-b from-white to-slate-50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-5xl mb-3">👋</div>
                <p className="text-slate-700 font-medium">Сайн байна уу!</p>
                <p className="text-sm text-slate-500 mt-1 mb-6">
                  {clinic.name}-ийн AI ассистент танд туслахад бэлэн
                </p>

                <div className="space-y-2 w-full max-w-xs">
                  <button
                    onClick={() => setInput('Үнэ хэд вэ?')}
                    className="block w-full text-left px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-blue-300 hover:bg-blue-50 transition"
                  >
                    💰 Үнэ хэд вэ?
                  </button>
                  <button
                    onClick={() => setInput('Маргааш сул цаг бий юу?')}
                    className="block w-full text-left px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-blue-300 hover:bg-blue-50 transition"
                  >
                    📅 Маргааш сул цаг бий юу?
                  </button>
                  <button
                    onClick={() => setInput('Танай эмч нар хэн бэ?')}
                    className="block w-full text-left px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-blue-300 hover:bg-blue-50 transition"
                  >
                    👨‍⚕️ Танай эмч нар хэн бэ?
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-sm shadow-sm'
                      : 'bg-white text-slate-900 rounded-bl-sm shadow-sm border border-slate-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 rounded-bl-sm shadow-sm border border-slate-100">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 p-3 flex gap-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Мессеж бичих..."
              className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-medium text-sm hover:shadow-md disabled:opacity-40 transition-all"
            >
              Илгээх
            </button>
          </div>
        </div>

        {booking && (
          <div className="mt-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start gap-3">
              <div className="text-2xl">✅</div>
              <div className="flex-1">
                <h3 className="font-bold text-emerald-900">Цаг захиалга баталгаажлаа!</h3>
                <p className="text-sm text-emerald-700 mt-0.5">
                  Удахгүй танд холбогдох болно
                </p>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-4">
          🤖 Powered by AI
        </p>
      </div>
    </div>
  );
}