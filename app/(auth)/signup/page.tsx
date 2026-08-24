'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserSupabase } from '@/lib/db/supabase-browser';
import { signupPasswordSchema } from '@/lib/validation';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [clinicName, setClinicName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [slugStatus, setSlugStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    error: string | null;
  }>({ checking: false, available: null, error: null });

  // Auto-generate slug from clinic name
  useEffect(() => {
    if (slugManuallyEdited) return;
    
    const autoSlug = clinicName
      .toLowerCase()
      .replace(/ү/g, 'u')
      .replace(/ө/g, 'o')
      .replace(/[а-я]/g, '') // Cyrillic-ийг хасна
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 30);
    
    setSlug(autoSlug);
  }, [clinicName, slugManuallyEdited]);

  // Slug availability check (debounced)
  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugStatus({ checking: false, available: null, error: null });
      return;
    }

    setSlugStatus({ checking: true, available: null, error: null });

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/check-slug', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        });

        const data = await res.json();
        setSlugStatus({
          checking: false,
          available: data.available,
          error: data.error ?? null,
        });
      } catch {
        setSlugStatus({ checking: false, available: false, error: 'Шалгахад алдаа гарлаа' });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [slug]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!slugStatus.available) {
      setError('URL шалгагдаагүй эсвэл боломжгүй байна');
      setLoading(false);
      return;
    }

    // Сул нууц үгийг эндээс зогсооно. Сервер талын албадлагыг Supabase-ийн
    // Authentication → Policies хэсэгт мөн тохируулах ёстой.
    const passwordCheck = signupPasswordSchema.safeParse(password);
    if (!passwordCheck.success) {
      setError(passwordCheck.error.issues[0].message);
      setLoading(false);
      return;
    }

    const supabase = createBrowserSupabase();

    // 1. User үүсгэх
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // setup-clinic нь хэрэглэгчийг сесс-ээр таних тул сесс заавал хэрэгтэй.
    // Email confirmation идэвхтэй үед signUp сесс буцаадаггүй.
    if (!signUpData.session) {
      setError(
        'Бүртгэл үүслээ. Имэйлээ баталгаажуулаад нэвтэрч орно уу.'
      );
      setLoading(false);
      return;
    }

    // 2. Шинэ клиник үүсгэх (userId-г сервер сесс-ээс тодорхойлно)
    const response = await fetch('/api/setup-clinic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clinicName, slug }),
    });

    if (!response.ok) {
      const errorData = await response.json();
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
          <h1 className="text-2xl font-bold">Dental clinic</h1>
        </div>
        <p className="text-sm text-slate-500">Шинэ клиник бүртгэх</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Clinic name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Клиникийн нэр
          </label>
          <input
            type="text"
            value={clinicName}
            onChange={e => setClinicName(e.target.value)}
            required
            placeholder="Жнь: Сайн шүд эмнэлэг"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Slug / URL */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Танай URL
            <span className="text-xs text-slate-400 font-normal ml-2">
              (Үйлчлүүлэгчдэд илгээх линк)
            </span>
          </label>
          <div className="flex items-center gap-1 px-3 py-2.5 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 bg-white text-sm">
            <span className="text-slate-400 select-none">dental-ai/c/</span>
            <input
              type="text"
              value={slug}
              onChange={e => {
                setSlugManuallyEdited(true);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
              }}
              required
              minLength={3}
              maxLength={30}
              placeholder="my-clinic"
              className="flex-1 outline-none bg-transparent text-slate-900 font-mono"
            />
            {slugStatus.checking && (
              <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
            )}
            {!slugStatus.checking && slugStatus.available === true && (
              <span className="text-emerald-500 text-base">✓</span>
            )}
            {!slugStatus.checking && slugStatus.available === false && (
              <span className="text-red-500 text-base">✗</span>
            )}
          </div>
          
          {/* Status message */}
          {slug && (
            <div className="mt-1.5">
              {slugStatus.checking && (
                <p className="text-xs text-slate-500">Шалгаж байна...</p>
              )}
              {!slugStatus.checking && slugStatus.available === true && (
                <p className="text-xs text-emerald-600">
                  ✓ Боломжтой! Танай линк: <span className="font-mono font-medium">dental-ai-bot-green.vercel.app/c/{slug}</span>
                </p>
              )}
              {!slugStatus.checking && slugStatus.available === false && slugStatus.error && (
                <p className="text-xs text-red-600">⚠️ {slugStatus.error}</p>
              )}
            </div>
          )}

          {!slug && (
            <p className="text-xs text-slate-400 mt-1.5">
              💡 Жнь: my-clinic, dental-care, smile-clinic
            </p>
          )}
        </div>

        {/* Email */}
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

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Нууц үг
          </label>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            placeholder="8+ тэмдэгт, үсэг ба тоо агуулсан"
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
          disabled={loading || !slugStatus.available}
          className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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