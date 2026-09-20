"use client";

import { usePathname } from "next/navigation";
import { useAuth, useDangXuat } from "@/lib/auth-context";

const PAGE_META: { match: (p: string) => boolean; breadcrumb: string; title: string }[] = [
  { match: (p) => p === "/", breadcrumb: "Tổng quan", title: "Bức tranh vận hành hôm nay" },
  {
    match: (p) => p.startsWith("/orders/"),
    breadcrumb: "Đơn thuê",
    title: "Chi tiết đơn thuê",
  },
  { match: (p) => p === "/orders", breadcrumb: "Đơn thuê", title: "Quản lý vòng đời đơn" },
  {
    match: (p) => p.startsWith("/equipment/"),
    breadcrumb: "Thiết bị",
    title: "Hồ sơ thiết bị",
  },
  { match: (p) => p === "/equipment", breadcrumb: "Thiết bị", title: "Danh mục tài sản & lợi nhuận" },
  { match: (p) => p === "/calendar", breadcrumb: "Calendar", title: "Lịch kế hoạch cho thuê" },
  { match: (p) => p === "/reports", breadcrumb: "Báo cáo", title: "Lợi nhuận & hiệu suất cho thuê" },
  { match: (p) => p === "/members", breadcrumb: "Thành viên", title: "Quản lý tài khoản đăng nhập" },
];

export default function Header({ onMoMenu }: { onMoMenu: () => void }) {
  const pathname = usePathname();
  const meta = PAGE_META.find((m) => m.match(pathname)) ?? PAGE_META[0];
  const { ten, anhUrl } = useAuth();
  const dangXuat = useDangXuat();
  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <header className="bg-white border-b border-[var(--border-color)] px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMoMenu}
          aria-label="Mở menu"
          className="md:hidden text-xl leading-none text-[var(--text-main)] shrink-0 -ml-1 p-1"
        >
          ☰
        </button>
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--accent-primary)] font-mono">
            {meta.breadcrumb}
          </div>
          <div className="mt-0.5 text-lg md:text-2xl font-extrabold text-[var(--text-main)] truncate">{meta.title}</div>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden lg:block text-sm text-[var(--text-muted)] capitalize">{today}</div>
        <div className="flex items-center gap-2.5 pl-3 md:pl-4 border-l border-[var(--border-color)]">
          {anhUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={anhUrl} alt={ten} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[var(--sidebar-active)] text-white flex items-center justify-center text-xs font-bold">
              {ten.slice(0, 1).toUpperCase()}
            </div>
          )}
          <span className="hidden md:inline text-sm font-semibold text-[var(--text-main)]">{ten}</span>
          <button
            onClick={dangXuat}
            className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--status-danger-text)] transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}
