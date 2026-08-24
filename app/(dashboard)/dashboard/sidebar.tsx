"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ExternalLink } from "lucide-react";
import LogoutButton from "../logout-button";

function NavLink({
  href,
  icon,
  label,
  badge,
  onClose,
}: {
  href: string;
  icon: string;
  label: string;
  /** 0 эсвэл undefined бол харагдахгүй */
  badge?: number;
  onClose?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition group"
    >
      <span className="text-base group-hover:scale-110 transition-transform">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {!!badge && badge > 0 && (
        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-semibold flex items-center justify-center tabular-nums">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

export default function Sidebar({
  userEmail,
  clinicName,
  clinicSlug,
  pendingCount = 0,
}: {
  userEmail: string;
  clinicName: string;
  /** Эмнэлэг бүртгэгдээгүй бол хоосон — тэр үед олон нийтийн линк байхгүй */
  clinicSlug?: string | null;
  /** Баталгаажуулахыг хүлээж буй захиалгын тоо */
  pendingCount?: number;
}) {
  const [open, setOpen] = useState(false);

  const links = (
    <>
      <NavLink
        href="/dashboard"
        icon="📊"
        label="Хяналт"
        onClose={() => setOpen(false)}
      />
      <NavLink
        href="/dashboard/calendar"
        icon="📆"
        label="Хуанли"
        onClose={() => setOpen(false)}
      />
      <NavLink
        href="/dashboard/appointments"
        icon="📅"
        label="Цаг захиалга"
        badge={pendingCount}
        onClose={() => setOpen(false)}
      />
      <NavLink
        href="/dashboard/settings"
        icon="⚙️"
        label="Тохиргоо"
        onClose={() => setOpen(false)}
      />

      {/* Эзэн өөрийн хуудсыг үйлчлүүлэгчийн нүдээр хармаар байдаг —
          шинэ табд нээнэ, самбараас гарахгүй. */}
      {clinicSlug && (
        <>
          <div className="h-px bg-slate-200 my-2" />
          <a
            href={`/c/${clinicSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition group"
          >
            <span className="text-base group-hover:scale-110 transition-transform">
              🌐
            </span>
            <span className="flex-1">Үйлчлүүлэгчийн хуудас</span>
            <ExternalLink size={13} className="text-slate-400" />
          </a>
        </>
      )}
    </>
  );

  const bottom = (
    <div className="space-y-2">
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/60 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-xs font-semibold text-emerald-800">Bot идэвхтэй</p>
        </div>
        <p className="text-[11px] text-emerald-700 leading-snug">
          24/7 хариулж байна
        </p>
      </div>
      <div className="bg-slate-50 rounded-xl p-3">
        <p className="text-xs font-medium text-slate-700 truncate">
          {userEmail}
        </p>
        <LogoutButton />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-base shadow-sm">
            🦷
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-tight">
            {clinicName}
            </p>
          
          </div>
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="relative p-2 rounded-lg hover:bg-slate-100 transition"
          aria-label={pendingCount > 0 ? `Цэс — ${pendingCount} шинэ захиалга` : 'Цэс'}
        >
          <Menu size={20} className="text-slate-700" />
          {pendingCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl flex flex-col p-5 transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              🦷
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{clinicName}</p>
              <p className="text-[10px] text-slate-500 truncate max-w-[140px]">
             Dental clinic
              </p>
            </div>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <X size={18} className="text-slate-600" />
          </button>
        </div>
        <nav className="space-y-1 flex-1">{links}</nav>
        {bottom}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-white/80 backdrop-blur-sm border-r border-slate-200 p-5 flex-col min-h-screen sticky top-0">
        <div className="mb-10">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg shadow-sm group-hover:shadow-md transition">
              🦷
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-900 leading-tight">
               {clinicName}
              </h1>
              <p className="text-[11px] text-slate-500 leading-tight truncate">
               Dental clinic
              </p>
            </div>
          </Link>
        </div>
        <nav className="space-y-1 flex-1">{links}</nav>
        {bottom}
      </aside>
    </>
  );
}
