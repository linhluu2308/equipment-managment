"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";

const LINKS = [
  { href: "/", label: "Tổng quan", icon: "📊" },
  { href: "/orders", label: "Đơn thuê", icon: "📋" },
  { href: "/equipment", label: "Thiết bị", icon: "🎥" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/reports", label: "Báo cáo", icon: "📈", chuOnly: true },
  { href: "/members", label: "Thành viên", icon: "👤", chuOnly: true },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { vai } = useAuth();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-[260px] shrink-0 flex flex-col bg-[var(--bg-sidebar)] text-white border-r border-[#1e293b] transition-transform duration-200 md:static md:z-auto md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-5 pt-6 pb-5 border-b border-[#1e293b] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[22px] font-extrabold tracking-tight">
              CineB
              <span className="text-[11px] font-bold bg-[#0369a1] text-[#38bdf8] px-1.5 py-0.5 rounded tracking-wider">
                OPS
              </span>
            </div>
            <div className="mt-1 text-[11px] text-[#64748b] tracking-[0.15em] uppercase font-mono">
              Rental Operations
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng menu"
            className="md:hidden text-2xl leading-none text-[#94a3b8] hover:text-white"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1.5 overflow-y-auto">
          {LINKS.filter((l) => !l.chuOnly || vai === "chu").map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-semibold transition-colors",
                  active
                    ? "bg-[var(--sidebar-active)] text-white shadow-[0_4px_12px_rgba(2,132,199,0.35)]"
                    : "text-[#94a3b8] hover:bg-[#1e293b] hover:text-slate-50"
                )}
              >
                <span>{l.icon}</span>
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-[#1e293b] text-xs text-[#64748b] flex items-center justify-between">
          <span>Đăng nhập với vai:</span>
          <span className="text-[#38bdf8] font-semibold">{vai === "chu" ? "Chủ" : "Kho"}</span>
        </div>
      </aside>
    </>
  );
}
