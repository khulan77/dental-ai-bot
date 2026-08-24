'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Нэвтрэлтийг сервер талаар — тэнд IP/бүртгэл тус бүрийн хаалт тавьдаг.
    // Браузераас шууд Supabase рүү дуудвал ямар ч хязгаарлалт үйлчлэхгүй.
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Нэвтэрч чадсангүй');
        setLoading(false);
        return;
      }
    } catch {
      setError('Сүлжээний алдаа. Дахин оролдоно уу.');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-sm">
            🦷
          </div>
          <h1 className="text-2xl font-bold">Dental clinic</h1>
        </div>
        <p className="text-sm text-slate-500">Эзний хэсэгт нэвтрэх</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Имэйл
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Нууц үг
          </label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            placeholder="••••••••"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-md disabled:opacity-50 transition-all"
        >
          {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Бүртгэлгүй юу?{' '}
        <Link
          href="/signup"
          className="text-blue-600 font-medium hover:underline"
        >
          Бүртгүүлэх
        </Link>
      </p>
    </div>
  );
}