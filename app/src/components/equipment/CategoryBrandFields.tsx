"use client";

import { DANH_MUC_THIET_BI } from "@/lib/types";

export default function CategoryBrandFields({
  danhMuc,
  onDanhMucChange,
  hang,
  onHangChange,
  goiYHang,
}: {
  danhMuc: string;
  onDanhMucChange: (v: string) => void;
  hang: string;
  onHangChange: (v: string) => void;
  goiYHang: Record<string, string[]>;
}) {
  const goiY = danhMuc ? (goiYHang[danhMuc] ?? []) : [];
  const datalistId = `goi-y-hang-${danhMuc.replace(/[^a-zA-Z0-9]/g, "-") || "chua-chon"}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <select className="input" value={danhMuc} onChange={(e) => onDanhMucChange(e.target.value)}>
        <option value="">Chọn danh mục...</option>
        {DANH_MUC_THIET_BI.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <div>
        <input
          className="input"
          placeholder="Hãng (Sony, Canon, Aputure...)"
          value={hang}
          onChange={(e) => onHangChange(e.target.value)}
          disabled={!danhMuc}
          title={!danhMuc ? "Chọn danh mục trước" : undefined}
          list={datalistId}
        />
        <datalist id={datalistId}>
          {goiY.map((h) => (
            <option key={h} value={h} />
          ))}
        </datalist>
      </div>
    </div>
  );
}
