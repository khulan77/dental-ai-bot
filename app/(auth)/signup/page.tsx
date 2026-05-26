'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserSupabase } from '@/lib/db/supabase-browser';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const clinicName = formData.get('clinic_name') as string;

    const supabase = createBrowserSupabase();

    // 1. User үүсгэх
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    // Илүү тодорхой алдаа гаргах
    if (signUpError) {
      console.error('Signup error:', signUpError);
      setError(`${signUpError.message} (code: ${signUpError.code ?? 'unknown'})`);
      setLoading(false);
      return;
    }

    if (!signUpData.user) {
      console.error('No user returned. Session:', signUpData.session);
      setError('User үүссэнгүй. Email confirmation идэвхтэй байж магадгүй. Supabase Dashboard → Auth → Providers → Email → "Confirm email" арилгана уу.');
      setLoading(false);
      return;
    }

    // 2. Шинэ клиник үүсгэх
    const slug = clinicName
      .toLowerCase()
      .replace(/[^a-zа-я0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) + '-' + signUpData.user.id.slice(0, 8);

    const response = await fetch('/api/setup-clinic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: signUpData.user.id,
        clinicName,
        slug,
        ownerEmail: email,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Setup clinic failed:', errorData);
      setError(errorData.error ?? 'Клиник үүсгэхэд алдаа гарлаа');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push('/dashboard');
      router.refresh();
    }, 1500);
  }

  if (success) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Бүртгэл амжилттай!
        </h2>
        <p className="text-sm text-slate-500">
          Танд тохирох хэсэг рүү шилжүүлж байна...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-sm">
            🦷
          </div>
          <h1 className="text-2xl font-bold">Dental AI</h1>
        </div>
        <p className="text-sm text-slate-500">Шинэ клиник бүртгэх</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Клиникийн нэр
          </label>
          <input
            type="text"
            name="clinic_name"
            required
            placeholder="Жнь: Сайн шүд эмнэлэг"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

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
            placeholder="Хамгийн багадаа 6 тэмдэгт"
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
          {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Аль хэдийн бүртгэлтэй юу?{' '}
        <Link
          href="/login"
          className="text-blue-600 font-medium hover:underline"
        >
          Нэвтрэх
        </Link>
      </p>
    </div>
  );
}