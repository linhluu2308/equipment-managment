"use client";

import MoneyInput from "@/components/MoneyInput";

/** Trạng thái ô chiết khấu ở client — `kieu` giữ lựa chọn % / đ kể cả khi chưa nhập số. */
export type ChietKhauNhap = { kieu: "phan_tram" | "so_tien"; giaTri: number };

export const CHIET_KHAU_TRONG: ChietKhauNhap = { kieu: "phan_tram", giaTri: 0 };

/** Từ dữ liệu dòng đã lưu → trạng thái ô nhập. */
export function tuDongDaLuu(line: { phan_tram_chiet_khau: number; tien_chiet_khau_ngay?: number }): ChietKhauNhap {
  return (line.tien_chiet_khau_ngay ?? 0) > 0
    ? { kieu: "so_tien", giaTri: line.tien_chiet_khau_ngay! }
    : { kieu: "phan_tram", giaTri: line.phan_tram_chiet_khau };
}

/** Trạng thái ô nhập → 2 cột lưu DB (chỉ 1 trong 2 > 0). */
export function sangCotDb(v: ChietKhauNhap): { phan_tram_chiet_khau: number; tien_chiet_khau_ngay: number } {
  return v.kieu === "so_tien"
    ? { phan_tram_chiet_khau: 0, tien_chiet_khau_ngay: v.giaTri }
    : { phan_tram_chiet_khau: v.giaTri, tien_chiet_khau_ngay: 0 };
}

/**
 * Ô chiết khấu 1 thiết bị: nút %/đ để chuyển giữa chiết khấu phần trăm và số tiền
 * trừ vào giá mỗi ngày. Đổi kiểu thì về 0. Dùng được bên trong <label> (chặn click
 * lan ra làm tick/bỏ tick checkbox của dòng).
 */
export default function ChietKhauInput({ value, onChange }: { value: ChietKhauNhap; onChange: (v: ChietKhauNhap) => void }) {
  const theoTien = value.kieu === "so_tien";
  return (
    <span className="inline-flex items-center gap-1" onClick={(e) => e.preventDefault()}>
      <button
        type="button"
        title="Đổi kiểu chiết khấu: % hoặc số tiền trừ vào giá mỗi ngày"
        className="rounded border border-[var(--border-color)] bg-white px-1.5 py-1 text-xs font-bold hover:bg-[#f1f5f9]"
        onClick={() => onChange({ kieu: theoTien ? "phan_tram" : "so_tien", giaTri: 0 })}
      >
        {theoTien ? "đ" : "%"}
      </button>
      {theoTien ? (
        <MoneyInput
          className="input !w-28"
          placeholder="CK đ/ngày"
          value={value.giaTri ? String(value.giaTri) : ""}
          onChange={(v) => onChange({ kieu: "so_tien", giaTri: Number(v) || 0 })}
        />
      ) : (
        <input
          type="number"
          min={0}
          max={100}
          className="input !w-20"
          placeholder="% CK"
          value={value.giaTri || ""}
          onChange={(e) => onChange({ kieu: "phan_tram", giaTri: Number(e.target.value) || 0 })}
        />
      )}
    </span>
  );
}
