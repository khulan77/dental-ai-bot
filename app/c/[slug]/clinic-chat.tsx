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
    <div className="h-[100dvh] bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 sm:p-4 flex items-center justify-center overflow-hidden relative">
      
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-300/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col relative z-10">
        <div className="bg-white sm:rounded-3xl shadow-xl overflow-hidden flex flex-col flex-1 min-h-0">
          
          {/* Header with animated tooth */}
          <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 p-4 sm:p-5 flex items-center gap-3 flex-shrink-0 relative overflow-hidden">
            
            {/* Sparkle animations */}
            <div className="absolute top-2 right-8 text-white/40 text-sm animate-sparkle-1">✨</div>
            <div className="absolute bottom-3 right-20 text-white/30 text-xs animate-sparkle-2">⭐</div>
            <div className="absolute top-4 right-32 text-white/20 text-[10px] animate-sparkle-3">✨</div>
            
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 animate-wiggle">
              🦷
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-white truncate text-sm sm:text-base">{clinic.name}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-emerald-300"></div>
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-300 animate-ping"></div>
                </div>
                <p className="text-[11px] sm:text-xs text-white/90">
                  AI ассистент • 24/7
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 sm:h-[500px] overflow-y-auto p-3 sm:p-5 space-y-3 bg-gradient-to-b from-white to-slate-50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                
                {/* Cute robot mascot */}
                <div className="relative mb-4">
                  <div className="text-6xl animate-bounce-slow">🦷</div>
                  <div className="absolute -top-2 -right-2 text-2xl animate-spin-slow">✨</div>
                  <div className="absolute -bottom-1 -left-3 text-xl animate-wave">👋</div>
                </div>
                
                <p className="text-slate-700 font-bold text-base sm:text-lg">
                  Сайн байна уу! 🎉
                </p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-6 px-4">
                  {clinic.name}-ийн ухаалаг ассистент 🤖<br/>
                  Танд туслахад бэлэн!
                </p>

                <div className="space-y-2 w-full max-w-xs px-2">
                  <button
                    onClick={() => setInput('Үнэ хэд вэ?')}
                    className="block w-full text-left px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-blue-300 hover:bg-blue-50 active:bg-blue-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    💰 Үнэ хэд вэ?
                  </button>
                  <button
                    onClick={() => setInput('Маргааш сул цаг бий юу?')}
                    className="block w-full text-left px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-blue-300 hover:bg-blue-50 active:bg-blue-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    📅 Маргааш сул цаг бий юу?
                  </button>
                  <button
                    onClick={() => setInput('Танай эмч нар хэн бэ?')}
                    className="block w-full text-left px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-blue-300 hover:bg-blue-50 active:bg-blue-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    👨‍⚕️ Танай эмч нар хэн бэ?
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300 gap-2`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm flex-shrink-0 mt-1 shadow-sm">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5 ${
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
              <div className="flex justify-start gap-2 animate-in fade-in duration-300">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm flex-shrink-0 mt-1 shadow-sm animate-pulse">
                  🤖
                </div>
                <div className="bg-white rounded-2xl px-4 py-3 rounded-bl-sm shadow-sm border border-slate-100">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 p-3 flex gap-2 bg-white flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Мессеж бичих..."
              className="flex-1 px-4 py-3 rounded-full bg-slate-100 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-base sm:text-sm"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 sm:px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-medium text-sm hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all flex-shrink-0"
            >
              Илгээх ✨
            </button>
          </div>
        </div>

        {booking && (
          <div className="mx-3 sm:mx-0 mt-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 text-2xl animate-sparkle-1">✨</div>
            <div className="absolute bottom-2 left-4 text-lg animate-sparkle-2">🎉</div>
            <div className="flex items-start gap-3">
              <div className="text-3xl animate-bounce-slow">✅</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-emerald-900 text-sm sm:text-base">
                  Цаг захиалга баталгаажлаа! 🦷
                </h3>
                <p className="text-xs sm:text-sm text-emerald-700 mt-0.5">
                  Удахгүй танд холбогдох болно
                </p>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-3 sm:mt-4 pb-3 sm:pb-0">
          🤖 Powered by AI
        </p>
      </div>
    </div>
  );
}