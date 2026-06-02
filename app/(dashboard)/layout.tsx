import { getCurrentUser, getCurrentClinic } from "@/lib/db/supabase-server";
import { redirect } from "next/navigation";
import Sidebar from "./dashboard/sidebar";

export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const clinic = await getCurrentClinic();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Sidebar
        userEmail={user.email ?? ""}
        clinicName={clinic?.name ?? "Клиник тохируулна уу"}
      />

      {/* Mobile top bar-ийн өндрөөс доош main эхлэнэ */}
      <main className="flex-1 p-4 pt-20 lg:p-10 lg:pt-10 overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  );
}