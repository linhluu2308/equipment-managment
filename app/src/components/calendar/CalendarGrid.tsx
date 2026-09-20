"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CHANG_BADGE, CHANG_LABEL, type ChangDon } from "@/lib/types";

export type CalendarEvent = {
  id: string;
  ma_don: string | null;
  chang: ChangDon;
  ngay_bat_dau: string;
  ngay_tra_du_kien: string;
  ten_khach: string;
  sdt_khach: string;
  so_thiet_bi: number;
};

const MAU_BAR: Record<ChangDon, string> = {
  yeu_cau: "#d97706",
  bao_gia: "#d97706",
  da_giao: "#0284c7",
  cho_tra: "#16a34a",
  xong: "#94a3b8",
  huy: "#cbd5e1",
};

export default function CalendarGrid({ events }: { events: CalendarEvent[] }) {
  const [thang, setThang] = useState(new Date());
  const [xemNhanh, setXemNhanh] = useState<CalendarEvent | null>(null);

  const ngayTrongLuoi = useMemo(() => {
    const start = startOfWeek(startOfMonth(thang), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(thang), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [thang]);

  function eventsInDay(day: Date) {
    const dayStr = format(day, "yyyy-MM-dd");
    return events.filter((e) => e.ngay_bat_dau <= dayStr && dayStr <= e.ngay_tra_du_kien);
  }

  return (
    <>
      <div className="action-bar">
        <div className="flex items-center gap-3 font-bold text-[var(--text-main)]">
          <button onClick={() => setThang(addMonths(thang, -1))} className="cursor-pointer">
            ‹
          </button>
          <span>{format(thang, "'Tháng' M · yyyy")}</span>
          <button onClick={() => setThang(addMonths(thang, 1))} className="cursor-pointer">
            ›
          </button>
        </div>
        <div className="flex gap-3.5 text-xs text-[var(--text-muted)] flex-wrap">
          <Legend mau="#d97706" label="Chờ chốt / báo giá" />
          <Legend mau="#0284c7" label="Đã giao / đang chạy" />
          <Legend mau="#16a34a" label="Chờ trả" />
          <Legend mau="#94a3b8" label="Đã xong" />
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <div
            className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border min-w-[640px]"
            style={{ background: "var(--border-color)", borderColor: "var(--border-color)" }}
          >
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
              <div
                key={d}
                className="bg-[#f8fafc] px-2 py-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]"
              >
                {d}
              </div>
            ))}
            {ngayTrongLuoi.map((day) => {
              const dayEvents = eventsInDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className="bg-white p-1"
                  style={{ minHeight: "64px", opacity: isSameMonth(day, thang) ? 1 : 0.4 }}
                >
                  <div className="text-[11px] text-[var(--text-light,#94a3b8)]">{format(day, "d")}</div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => setXemNhanh(ev)}
                        className="block w-full truncate rounded px-1 py-0.5 text-left text-[9px] font-semibold text-white"
                        style={{ background: MAU_BAR[ev.chang] }}
                        title={`${ev.ten_khach} — ${ev.so_thiet_bi} thiết bị`}
                      >
                        {ev.ten_khach}
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-[var(--text-muted)]">+{dayEvents.length - 3} khác</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {xemNhanh && (
        <div className="modal-overlay" onClick={() => setXemNhanh(null)}>
          <div className="modal-card" style={{ maxWidth: "360px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title !text-base">{xemNhanh.ten_khach}</div>
              <span className={`badge ${CHANG_BADGE[xemNhanh.chang]}`}>{CHANG_LABEL[xemNhanh.chang]}</span>
            </div>
            <div className="modal-body">
              <p className="text-sm text-[var(--text-muted)]">{xemNhanh.sdt_khach}</p>
              <p className="text-sm">
                {xemNhanh.ngay_bat_dau} → {xemNhanh.ngay_tra_du_kien}
              </p>
              <p className="text-sm text-[var(--text-muted)]">{xemNhanh.so_thiet_bi} thiết bị</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setXemNhanh(null)} className="btn-secondary">
                Đóng
              </button>
              <Link href={`/orders/${xemNhanh.id}`} className="btn-primary">
                Xem chi tiết đơn →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Legend({ mau, label }: { mau: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full inline-block" style={{ background: mau }} />
      {label}
    </div>
  );
}
