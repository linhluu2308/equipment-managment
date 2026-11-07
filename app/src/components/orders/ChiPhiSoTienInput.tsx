"use client";

import MoneyInput from "@/components/MoneyInput";
import type { AiChiuChiPhi } from "@/lib/calculations";

export type GiaTriChiPhi = { aiChiu: AiChiuChiPhi; soTien: string; thuKhach: string; cinebChi: string };

const LUA_CHON: { value: AiChiuChiPhi; label: string }[] = [
  { value: "khach", label: "Khách chi" },
  { value: "cineb", label: "CineB chi" },
  { value: "tuy_chinh", label: "Tuỳ chỉnh" },
];

/** Quy đổi lựa chọn trên form ra 2 con số lưu DB. */
export function soTienChiPhi(v: GiaTriChiPhi): { thu_khach: number; cineb_chi: number } {
  if (v.aiChiu === "khach") return { thu_khach: Number(v.soTien) || 0, cineb_chi: Number(v.soTien) || 0 };
  if (v.aiChiu === "cineb") return { thu_khach: 0, cineb_chi: Number(v.soTien) || 0 };
  return { thu_khach: Number(v.thuKhach) || 0, cineb_chi: Number(v.cinebChi) || 0 };
}

export function daNhapSoTien(v: GiaTriChiPhi): boolean {
  const { thu_khach, cineb_chi } = soTienChiPhi(v);
  return thu_khach > 0 || cineb_chi > 0;
}

/**
 * Khách chịu: CineB chi bao nhiêu thu khách bấy nhiêu (lợi nhuận 0). CineB chịu: khách
 * không trả. Tuỳ chỉnh: thu khách khác chi thực tế (vd bồi thường 2tr, sửa hết 1,5tr;
 * phụ phí quá giờ thì CineB chi = 0).
 */
export default function ChiPhiSoTienInput({ value, onChange }: { value: GiaTriChiPhi; onChange: (v: GiaTriChiPhi) => void }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1">
        {LUA_CHON.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange({ ...value, aiChiu: o.value })}
            className={`pill ${value.aiChiu === o.value ? "active" : ""}`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {value.aiChiu === "tuy_chinh" ? (
        <div className="grid grid-cols-2 gap-2">
          <MoneyInput placeholder="Thu khách" value={value.thuKhach} onChange={(thuKhach) => onChange({ ...value, thuKhach })} />
          <MoneyInput placeholder="CineB chi" value={value.cinebChi} onChange={(cinebChi) => onChange({ ...value, cinebChi })} />
        </div>
      ) : (
        <MoneyInput placeholder="Số tiền" value={value.soTien} onChange={(soTien) => onChange({ ...value, soTien })} />
      )}
      <p className="text-xs text-[var(--text-muted)]">
        {value.aiChiu === "khach" && "Cộng vào công nợ khách; CineB chi ra đúng số này (không lời/lỗ)."}
        {value.aiChiu === "cineb" && "Không tính cho khách; trừ vào lợi nhuận của CineB."}
        {value.aiChiu === "tuy_chinh" &&
          "Thu khách cộng vào công nợ và doanh thu; CineB chi trừ vào lợi nhuận. Để 0 nếu không có."}
      </p>
    </div>
  );
}
