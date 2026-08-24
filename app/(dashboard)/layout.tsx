import { getCurrentUser, getCurrentClinic } from "@/lib/db/supabase-server";
import { redirect } from "next/navigation";
import Sidebar from "./dashboard/sidebar";
import Link from "next/link";
import { isDemoClinic, DEMO_SLUG } from "@/lib/demo";
import { getPendingCount } from "@/lib/dashboard/stats";

export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const clinic = await getCurrentClinic();
  const isDemo = isDemoClinic(clinic?.id);
  // Баталгаажуулахыг хүлээж буй захиалга — цэсэн дээр тоо болж харагдана
  const pendingCount = clinic ? await getPendingCount(clinic.id) : 0;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Sidebar
        userEmail={user.email ?? ""}
        clinicName={clinic?.name ?? "Клиник тохируулна уу"}
        clinicSlug={clinic?.slug ?? null}
        pendingCount={pendingCount}
      />

      {/* Mobile top bar-ийн өндрөөс доош main эхлэнэ */}
      <main className="flex-1 p-4 pt-20 lg:p-10 lg:pt-10 overflow-y-auto min-w-0">
        {isDemo && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-sm text-amber-900 flex-1">
              <span className="font-semibold">Демо горим.</span>{" "}
              Энэ бол жишээ эмнэлгийн хяналтын самбар. Захиалга баталгаажуулж
              туршиж болно, харин тохиргооны өөрчлөлт хадгалагдахгүй.
              Үйлчлүүлэгч юу хардгийг цэсэн дэх{" "}
              <Link
                href={`/c/${DEMO_SLUG}`}
                target="_blank"
                className="font-medium underline underline-offset-4 hover:text-amber-700"
              >
                🌐 Үйлчлүүлэгчийн хуудас
              </Link>{" "}
              холбоосоор үзнэ. Өөрийн бүртгэл рүүгээ буцахдаа цэсний
              «🚪 Гарах»-аар гараад дахин нэвтэрнэ үү.
            </p>
            <Link
              href="/signup"
              className="shrink-0 text-sm font-medium px-4 py-2 rounded-lg bg-amber-900 text-white hover:bg-amber-800 transition-colors"
            >
              Эмнэлгээ бүртгүүлэх
            </Link>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}