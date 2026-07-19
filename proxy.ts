import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
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

  // Энэ бол ЗӨВХӨН урьдчилсан шүүлтүүр (optimistic check) — cookie-г уншаад
  // хурдан redirect хийхэд зориулагдсан. getSession() нь JWT-г баталгаажуулдаггүй
  // тул үүнийг хамгаалалт гэж БҮҮ найд.
  //
  // Жинхэнэ шалгалт нь app/(dashboard)/layout.tsx дээр getCurrentUser()-ээр
  // (getUser() → баталгаажуулсан) хийгддэг. Next.js өөрөө proxy дотор
  // сүлжээний дуудлага хийхийг зөвлөдөггүй — prefetch хүсэлт бүр дээр
  // ажилладаг тул удаашруулна.
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isDashboard = pathname.startsWith('/dashboard');

  // Нэвтрээгүй + dashboard руу → login
  if (!user && isDashboard) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Нэвтэрсэн + login/signup → dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

// Зөвхөн энэ proxy үнэхээр ажилладаг зам дээр ажиллуулна. Public хуудсууд
// (/c/[slug]) болон api route-ууд redirect логикт огт хамаардаггүй тул
// тэднийг дэмий боловсруулахгүй.
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};