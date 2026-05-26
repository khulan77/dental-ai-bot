'use client';

import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/db/supabase-browser';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-[11px] text-slate-500 hover:text-red-600 mt-1 transition"
    >
      🚪 Гарах
    </button>
  );
}