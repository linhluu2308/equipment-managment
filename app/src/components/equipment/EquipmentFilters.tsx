"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TRANG_THAI_THIET_BI_BADGE, TRANG_THAI_THIET_BI_LABEL, type TrangThaiThietBi } from "@/lib/types";
import EquipmentToolbar from "./EquipmentToolbar";

type ThietBiRow = {
  id: string;
  ma: string | null;
  ten: string;
  danh_muc: string | null;
  gia_hien_hanh: number;
  nguon_goc: string;
  trang_thai: string;
};

const DANH_MUC_OPTIONS: { value: string; label: string; tuKhoa: string[] }[] = [
  { value: "tat_ca", label: "Toàn bộ thiết bị", tuKhoa: [] },
  { value: "lens", label: "Ống kính (Lens)", tuKhoa: ["ong kinh", "lens"] },
  { value: "body", label: "Body máy quay", tuKhoa: ["body", "may quay", "than may"] },
  { value: "den", label: "Đèn & Ánh sáng", tuKhoa: ["den", "anh sang", "light"] },
  { value: "grip", label: "Grip & Phụ kiện", tuKhoa: ["grip", "phu kien", "accessory"] },
];

const DAU_COMBINING_MARKS = /[̀-ͯ]/g;

function boDau(s: string): string {
  return s
    .normalize("NFD")
    .replace(DAU_COMBINING_MARKS, "")
    .replace(/đ/gi, "d")
    .toLowerCase();
}

export default function EquipmentFilters({ thietBiList }: { thietBiList: ThietBiRow[] }) {
  const [tuKhoa, setTuKhoa] = useState("");
  const [danhMuc, setDanhMuc] = useState("tat_ca");

  const filtered = useMemo(() => {
    const tuKhoaChuan = boDau(tuKhoa.trim());
    const tuyChonDanhMuc = DANH_MUC_OPTIONS.find((d) => d.value === danhMuc);

    return thietBiList.filter((tb) => {
      const khopTuKhoa =
        !tuKhoaChuan ||
        boDau(tb.ten).includes(tuKhoaChuan) ||
        boDau(tb.ma ?? "").includes(tuKhoaChuan);

      const danhMucChuan = boDau(tb.danh_muc ?? "");
      const khopDanhMuc =
        danhMuc === "tat_ca" ||
        (tuyChonDanhMuc?.tuKhoa.some((k) => danhMucChuan.includes(k)) ?? false);

      return khopTuKhoa && khopDanhMuc;
    });
  }, [thietBiList, tuKhoa, danhMuc]);

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
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <EquipmentToolbar />
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
                <td>{tb.danh_muc || "—"}</td>
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
