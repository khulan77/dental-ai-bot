'use client';

import { useState, useRef, useEffect } from 'react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export default function TestChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [lastSource, setLastSource] = useState<string | null>(null);
  const [lastDuration, setLastDuration] = useState<number | null>(null);
  const [lastSimilarity, setLastSimilarity] = useState<number | null>(null);
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
      const res = await fetch('/api/test-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: messages,
        }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const botMessage: ChatMessage = {
        role: 'assistant',
        content: data.reply,
        timestamp: data.timestamp,
      };

      setMessages([...newMessages, botMessage]);
      setLastSource(data.source ?? 'openai');
      setLastDuration(data.duration_ms ?? null);
      setLastSimilarity(data.similarity ?? null);

      if (data.booking) {
        setBooking(data.booking);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `⚠️ Алдаа гарлаа: ${error instanceof Error ? error.message : 'Unknown'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages([...newMessages, errorMessage]);
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
        {/* Chat Container */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
              🦷
            </div>
            <div>
              <h2 className="font-bold text-white">Сайн шүд эмнэлэг</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-emerald-300"></div>
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-300 animate-ping"></div>
                </div>
                <p className="text-xs text-white/90">Идэвхтэй</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-5 space-y-3 bg-gradient-to-b from-white to-slate-50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-5xl mb-3">👋</div>
                <p className="text-slate-600 font-medium">
                  Сайн байна уу!
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Чат эхлүүлэхийн тулд мессеж бичнэ үү
                </p>
                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => setInput('Сайн байна уу')}
                    className="block text-xs text-slate-500 hover:text-blue-600 transition"
                  >
                    💬 "Сайн байна уу"
                  </button>
                  <button
                    onClick={() => setInput('Үнэ хэд вэ?')}
                    className="block text-xs text-slate-500 hover:text-blue-600 transition"
                  >
                    💰 "Үнэ хэд вэ?"
                  </button>
                  <button
                    onClick={() => setInput('Маргааш сул цаг байна уу?')}
                    className="block text-xs text-slate-500 hover:text-blue-600 transition"
                  >
                    📅 "Маргааш сул цаг байна уу?"
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg, i) => {
              const isLastBot = i === messages.length - 1 && msg.role === 'assistant';
              
              return (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div className="flex flex-col gap-1 max-w-[75%]">
                    <div
                      className={`rounded-2xl px-4 py-2.5 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-sm shadow-sm self-end'
                          : 'bg-white text-slate-900 rounded-bl-sm shadow-sm border border-slate-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                    
                    {/* Cache badge - зөвхөн сүүлийн bot мессеж дээр */}
                    {isLastBot && lastSource && (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 px-1">
                        {lastSource === 'cache_exact' && (
                          <>
                            <span className="text-emerald-500">⚡</span>
                            <span>Cache hit (exact)</span>
                          </>
                        )}
                        {lastSource === 'cache_semantic' && (
                          <>
                            <span className="text-purple-500">🎯</span>
                            <span>
                              Cache hit (semantic
                              {lastSimilarity && ` ${(lastSimilarity * 100).toFixed(0)}%`}
                              )
                            </span>
                          </>
                        )}
                        {lastSource === 'openai' && (
                          <>
                            <span>🤖</span>
                            <span>OpenAI</span>
                          </>
                        )}
                        {lastDuration && (
                          <>
                            <span>·</span>
                            <span className={lastDuration < 200 ? 'text-emerald-600 font-medium' : ''}>
                              {lastDuration}ms
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start animate-in fade-in duration-300">
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
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-medium text-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Илгээх
            </button>
          </div>
        </div>

        {/* Booking notification */}
        {booking && (
          <div className="mt-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start gap-3">
              <div className="text-2xl">✅</div>
              <div className="flex-1">
                <h3 className="font-bold text-emerald-900">
                  Шинэ цаг захиалга!
                </h3>
                <p className="text-sm text-emerald-700 mt-0.5">
                  Доорх мэдээллээр захиалга бүртгэгдлээ
                </p>
               <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <BookingField label="Нэр" value={booking.customer_name} />
                  <BookingField label="Утас" value={booking.customer_phone} />
                  <BookingField label="Үйлчилгээ" value={booking.service} />
                  <BookingField
                    label="Огноо"
                    value={new Date(booking.scheduled_at).toLocaleString('mn-MN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  />
                  {booking.doctor_name && (
                    <div className="col-span-2">
                      <BookingField label="👨‍⚕️ Эмч" value={booking.doctor_name} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-4">
          Test mode • Powered by GPT-4o-mini
        </p>
      </div>
    </div>
  );
}

function BookingField({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg p-2.5 border border-emerald-100">
      <p className="text-[10px] text-emerald-600 uppercase tracking-wide font-medium">
        {label}
      </p>
      <p className="text-emerald-900 font-medium mt-0.5">{value}</p>
    </div>
  );
}