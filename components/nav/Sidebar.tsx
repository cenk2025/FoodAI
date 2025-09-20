'use client';

import Link from "next/link";
import { Home, Percent, MapPin, LayoutGrid, Shield } from "lucide-react";

export function Sidebar() {
  return (
    <aside
      className="
        group fixed left-0 top-0 z-40 h-screen
        w-[var(--sb-collapsed)]
        lg:w-[var(--sb-collapsed)]
        bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60
        border-r border-black/5
        transition-[width] duration-200 ease-out
        hover:w-[var(--sb)]
      "
    >
      {/* Logo satırı */}
      <div className="flex items-center h-16 px-4">
        <span className="font-extrabold text-lg">FoodAi</span>
      </div>

      {/* Nav */}
      <nav className="mt-2 space-y-1 px-2">
        {/* Etusivu */}
        <Link className="
            flex items-center gap-3 h-11 px-3 rounded-xl
            text-slate-700 hover:bg-slate-100
          " href="/fi">
          <Home className="shrink-0" size={18} />
          {/* metin sadece hover’da gösterilsin */}
          <span className="hidden group-hover:inline-block truncate">
            Etusivu
          </span>
        </Link>

        {/* Tarjoukset */}
        <Link className="
            flex items-center gap-3 h-11 px-3 rounded-xl
            text-slate-700 hover:bg-slate-100
          " href="/fi/offers">
          <Percent className="shrink-0" size={18} />
          {/* metin sadece hover’da gösterilsin */}
          <span className="hidden group-hover:inline-block truncate">
            Tarjoukset
          </span>
        </Link>

        {/* Lähellä */}
        <Link className="
            flex items-center gap-3 h-11 px-3 rounded-xl
            text-slate-700 hover:bg-slate-100
          " href="/fi/nearby">
          <MapPin className="shrink-0" size={18} />
          {/* metin sadece hover’da gösterilsin */}
          <span className="hidden group-hover:inline-block truncate">
            Lähellä
          </span>
        </Link>

        {/* Kojelauta */}
        <Link className="
            flex items-center gap-3 h-11 px-3 rounded-xl
            text-slate-700 hover:bg-slate-100
          " href="/fi/dashboard">
          <LayoutGrid className="shrink-0" size={18} />
          {/* metin sadece hover’da gösterilsin */}
          <span className="hidden group-hover:inline-block truncate">
            Kojelauta
          </span>
        </Link>

        {/* Admin */}
        <Link className="
            flex items-center gap-3 h-11 px-3 rounded-xl
            text-slate-700 hover:bg-slate-100
          " href="/fi/admin">
          <Shield className="shrink-0" size={18} />
          {/* metin sadece hover’da gösterilsin */}
          <span className="hidden group-hover:inline-block truncate">
            Admin
          </span>
        </Link>
      </nav>
    </aside>
  );
}