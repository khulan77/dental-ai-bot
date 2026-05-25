import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-sm border-r border-slate-200 p-5 flex flex-col">
        <div className="mb-10">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg shadow-sm group-hover:shadow-md transition">
              🦷
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                Dental AI
              </h1>
              <p className="text-[11px] text-slate-500 leading-tight">
                Сайн шүд эмнэлэг
              </p>
            </div>
          </Link>
        </div>

        <nav className="space-y-1 flex-1">
  <NavLink href="/dashboard" icon="📊" label="Хяналт" />
  <NavLink href="/dashboard/calendar" icon="📆" label="Хуанли" />
  <NavLink href="/dashboard/appointments" icon="📅" label="Цаг захиалга" />
  <NavLink href="/dashboard/conversations" icon="💬" label="Харилцан яриа" />
  <NavLink href="/dashboard/settings" icon="⚙️" label="Тохиргоо" />
</nav>

        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/60 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
            </div>
            <p className="text-xs font-semibold text-emerald-800">Bot идэвхтэй</p>
          </div>
          <p className="text-[11px] text-emerald-700 leading-snug">
            24/7 хариулж байна
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition group"
    >
      <span className="text-base group-hover:scale-110 transition-transform">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}