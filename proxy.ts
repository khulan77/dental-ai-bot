import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  // Public auth pages must stay accessible when Supabase is unavailable.
  // getSession() can refresh expired tokens and retry network failures.
  if (!request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh dashboard session cookies here, where response cookies are writable.
  // getSession() is not authorization: the dashboard layout and server actions
  // verify the user with getUser(). Refreshing an expired session needs network.
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  // Нэвтрээгүй + dashboard руу → login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

// Зөвхөн энэ proxy үнэхээр ажилладаг зам дээр ажиллуулна. Public хуудсууд
// (/c/[slug]) болон api route-ууд redirect логикт огт хамаардаггүй тул
// тэднийг дэмий боловсруулахгүй.
export const config = {
  matcher: ['/dashboard/:path*'],
};
