"use client";

import { useState } from "react";
import { timHoacTaoNhaCungCap } from "@/lib/actions/nhaCungCap";
import type { NhaCungCap } from "@/lib/types";

const THEM_MOI = "__them_moi__";

export default function SupplierSelect({
  danhSach,
  value,
  onChange,
}: {
  danhSach: Pick<NhaCungCap, "id" | "ten">[];
  value: string;
  onChange: (nhaCungCapId: string) => void;
}) {
  const [dangThem, setDangThem] = useState(false);
  const [tenMoi, setTenMoi] = useState("");
  const [dangTao, setDangTao] = useState(false);
  const [loi, setLoi] = useState("");

  if (dangThem) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-1.5">
          <input
            className="input"
            placeholder="Tên nhà cung cấp mới"
            value={tenMoi}
            onChange={(e) => setTenMoi(e.target.value)}
            autoFocus
          />
          <button
            type="button"
            className="btn-secondary shrink-0"
            disabled={dangTao}
            onClick={async () => {
              if (!tenMoi.trim()) return;
              setDangTao(true);
              setLoi("");
              try {
                const id = await timHoacTaoNhaCungCap(tenMoi);
                onChange(id);
                setDangThem(false);
                setTenMoi("");
              } catch (err) {
                setLoi((err as Error).message);
              } finally {
                setDangTao(false);
              }
            }}
          >
            {dangTao ? "Đang lưu..." : "Lưu"}
          </button>
          <button type="button" className="btn-secondary shrink-0" onClick={() => setDangThem(false)}>
            Huỷ
          </button>
        </div>
        {loi && <p className="badge badge-danger !inline-block">{loi}</p>}
      </div>
    );
  }

  return (
    <select
      className="input"
      value={value}
      onChange={(e) => {
        if (e.target.value === THEM_MOI) setDangThem(true);
        else onChange(e.target.value);
      }}
    >
      <option value="">Chọn nhà cung cấp...</option>
      {danhSach.map((n) => (
        <option key={n.id} value={n.id}>
          {n.ten}
        </option>
      ))}
      <option value={THEM_MOI}>+ Thêm nhà cung cấp mới</option>
    </select>
  );
}
