import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server-side Supabase client (cookie-аас user session уншина).
 * Server components, API routes-д хэрэглэнэ.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component-ээс cookie бичих оролдсон тохиолдол — алгасна
          }
        },
      },
    }
  );
}

/**
 * Одоогийн нэвтэрсэн user-ийг авах. Үгүй бол null.
 */
export async function getCurrentUser() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Одоогийн user-ийн clinic-ийг авах.
 */
export async function getCurrentClinic() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('clinics')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  return data;
}