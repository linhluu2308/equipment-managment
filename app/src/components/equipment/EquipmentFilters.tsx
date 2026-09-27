"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DANH_MUC_THIET_BI,
  TRANG_THAI_THIET_BI_BADGE,
  TRANG_THAI_THIET_BI_LABEL,
  type NhaCungCap,
  type TrangThaiThietBi,
} from "@/lib/types";
import { boDau } from "@/lib/text";
import EquipmentToolbar from "./EquipmentToolbar";

type ThietBiRow = {
  id: string;
  ma: string | null;
  ten: string;
  danh_muc: string | null;
  hang: string | null;
  gia_hien_hanh: number;
  nguon_goc: string;
  trang_thai: string;
};

const DANH_MUC_OPTIONS = ["tat_ca", ...DANH_MUC_THIET_BI];

const NGUON_GOC_OPTIONS: { value: string; label: string }[] = [
  { value: "tat_ca", label: "Tất cả nguồn gốc" },
  { value: "so_huu", label: "Tự sở hữu" },
  { value: "thue_ngoai", label: "Thuê ngoài" },
];

export default function EquipmentFilters({
  thietBiList,
  danhSachNhaCungCap,
  goiYHang,
}: {
  thietBiList: ThietBiRow[];
  danhSachNhaCungCap: Pick<NhaCungCap, "id" | "ten">[];
  goiYHang: Record<string, string[]>;
}) {
  const [tuKhoa, setTuKhoa] = useState("");
  const [danhMuc, setDanhMuc] = useState("tat_ca");
  const [nguonGoc, setNguonGoc] = useState("tat_ca");

  const filtered = useMemo(() => {
    const tuKhoaChuan = boDau(tuKhoa.trim());

    return thietBiList.filter((tb) => {
      const khopTuKhoa =
        !tuKhoaChuan ||
        boDau(tb.ten).includes(tuKhoaChuan) ||
        boDau(tb.ma ?? "").includes(tuKhoaChuan);

      const khopDanhMuc = danhMuc === "tat_ca" || tb.danh_muc === danhMuc;

      const khopNguonGoc = nguonGoc === "tat_ca" || tb.nguon_goc === nguonGoc;

      return khopTuKhoa && khopDanhMuc && khopNguonGoc;
    });
  }, [thietBiList, tuKhoa, danhMuc, nguonGoc]);

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
          <input
            type="text"
            className="input w-full sm:!w-64"
            placeholder="🔍 Tên/mã thiết bị..."
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
          />
          <select className="input sm:!w-56" value={danhMuc} onChange={(e) => setDanhMuc(e.target.value)}>
            {DANH_MUC_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d === "tat_ca" ? "Toàn bộ danh mục" : d}
              </option>
            ))}
          </select>
          <select className="input sm:!w-48" value={nguonGoc} onChange={(e) => setNguonGoc(e.target.value)}>
            {NGUON_GOC_OPTIONS.map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>
        </div>
        <EquipmentToolbar danhSachNhaCungCap={danhSachNhaCungCap} goiYHang={goiYHang} />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tên thiết bị</th>
              <th>Danh mục</th>
              <th>Giá thuê/ngày</th>
              <th>Nguồn gốc</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tb) => (
              <tr key={tb.id}>
                <td className="font-mono text-xs text-[var(--text-muted)]">{tb.ma || "—"}</td>
                <td>
                  <Link href={`/equipment/${tb.id}`} className="font-semibold text-[var(--accent-primary)] hover:underline">
                    {tb.ten}
                  </Link>
                </td>
                <td>
                  {tb.danh_muc || "—"}
                  {tb.hang && <span className="text-[var(--text-muted)]"> · {tb.hang}</span>}
                </td>
                <td>{tb.gia_hien_hanh.toLocaleString("vi-VN")}đ</td>
                <td>{tb.nguon_goc === "so_huu" ? "Tự sở hữu" : "Thuê ngoài"}</td>
                <td>
                  <span className={`badge ${TRANG_THAI_THIET_BI_BADGE[tb.trang_thai as TrangThaiThietBi]}`}>
                    {TRANG_THAI_THIET_BI_LABEL[tb.trang_thai as TrangThaiThietBi]}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-[var(--text-muted)]">
                  {thietBiList.length === 0
                    ? "Chưa có thiết bị nào. Thêm mới hoặc Import Excel để bắt đầu."
                    : "Không tìm thấy thiết bị phù hợp."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
