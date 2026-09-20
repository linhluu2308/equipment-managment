"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { importThietBiHangLoat, type DongImportThietBi } from "@/lib/actions/thietBi";

type PreviewRow = DongImportThietBi & { loi?: string };

const HEADER_MAP: Record<string, keyof DongImportThietBi> = {
  ten: "ten",
  "tên": "ten",
  "tên thiết bị": "ten",
  ma: "ma",
  "mã": "ma",
  "mã/serial": "ma",
  danh_muc: "danh_muc",
  "danh mục": "danh_muc",
  nguon_goc: "nguon_goc",
  "nguồn gốc": "nguon_goc",
  nha_cung_cap: "nha_cung_cap",
  "nhà cung cấp": "nha_cung_cap",
  gia_von: "gia_von",
  "giá vốn": "gia_von",
  gia_thue: "gia_thue",
  "giá thuê": "gia_thue",
  "giá thuê/ngày": "gia_thue",
};

function chuanHoaNguonGoc(v: unknown): "so_huu" | "thue_ngoai" {
  const s = String(v ?? "").trim().toLowerCase();
  if (s.includes("thuê") || s.includes("thue_ngoai") || s === "thue_ngoai") return "thue_ngoai";
  return "so_huu";
}

function parseSheet(file: File): Promise<PreviewRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const wb = XLSX.read(data, { type: "binary" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

        const rows: PreviewRow[] = raw.map((r) => {
          const mapped: Partial<DongImportThietBi> = {};
          for (const [key, value] of Object.entries(r)) {
            const field = HEADER_MAP[key.trim().toLowerCase()];
            if (!field) continue;
            if (field === "nguon_goc") mapped.nguon_goc = chuanHoaNguonGoc(value);
            else if (field === "gia_von" || field === "gia_thue") {
              (mapped as Record<string, unknown>)[field] = Number(value) || 0;
            } else {
              (mapped as Record<string, unknown>)[field] = String(value).trim();
            }
          }
          const ten = mapped.ten ?? "";
          const giaThue = mapped.gia_thue ?? 0;
          let loi: string | undefined;
          if (!ten) loi = "Thiếu tên thiết bị";
          else if (!giaThue) loi = "Thiếu/sai giá thuê";
          return {
            ten,
            ma: mapped.ma,
            danh_muc: mapped.danh_muc,
            nguon_goc: mapped.nguon_goc ?? "so_huu",
            nha_cung_cap: mapped.nha_cung_cap,
            gia_von: mapped.gia_von,
            gia_thue: giaThue,
            loi,
          };
        });
        resolve(rows);
      } catch {
        reject(new Error("Không đọc được file. Kiểm tra định dạng .xlsx/.csv."));
      }
    };
    reader.onerror = () => reject(new Error("Không đọc được file."));
    reader.readAsBinaryString(file);
  });
}

function taiFileMau() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    ["ten", "ma", "danh_muc", "nguon_goc", "nha_cung_cap", "gia_von", "gia_thue"],
    ["Sony FX6", "FX6-01", "Body", "so_huu", "", "", "1500000"],
    ["Ống kính 70-200mm", "LENS-70200", "Lens", "thue_ngoai", "Studio ABC", "300000", "500000"],
  ]);
  XLSX.utils.book_append_sheet(wb, ws, "Mau");
  XLSX.writeFile(wb, "cineb-mau-import-thiet-bi.xlsx");
}

export default function ImportExcelModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [dangGui, setDangGui] = useState(false);
  const [ketQua, setKetQua] = useState<{ row: number; ok: boolean; loi?: string }[] | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const parsed = await parseSheet(file);
    setRows(parsed);
    setKetQua(null);
  }

  async function xacNhan() {
    const hopLe = rows.filter((r) => !r.loi);
    if (hopLe.length === 0) return;
    setDangGui(true);
    try {
      const kq = await importThietBiHangLoat(hopLe);
      setKetQua(kq);
      router.refresh();
    } finally {
      setDangGui(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: "680px" }}>
        <div className="modal-header">
          <div className="modal-title">Import danh sách thiết bị từ Excel</div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-xl leading-none">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <button type="button" onClick={taiFileMau} className="text-sm font-semibold text-[var(--accent-primary)] hover:underline self-start">
            Tải file mẫu Excel chuẩn
          </button>

          <input type="file" accept=".xlsx,.xls,.csv" onChange={onFile} className="block text-sm" />

          {rows.length > 0 && (
            <div className="table-container max-h-64 overflow-y-auto">
              <table>
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Danh mục</th>
                    <th>Nguồn gốc</th>
                    <th>Giá thuê</th>
                    <th>Lỗi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} style={r.loi ? { background: "var(--status-danger-bg)" } : undefined}>
                      <td>{r.ten || "—"}</td>
                      <td>{r.danh_muc || "—"}</td>
                      <td>{r.nguon_goc}</td>
                      <td>{r.gia_thue.toLocaleString("vi-VN")}đ</td>
                      <td className="text-[var(--status-danger-text)]">{r.loi || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {ketQua && (
            <div className="badge badge-success !inline-flex">
              Đã import {ketQua.filter((k) => k.ok).length}/{ketQua.length} thiết bị thành công.
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">
            Đóng
          </button>
          <button
            type="button"
            disabled={dangGui || rows.filter((r) => !r.loi).length === 0}
            onClick={xacNhan}
            className="btn-primary"
          >
            {dangGui ? "Đang import..." : "Xác nhận Import"}
          </button>
        </div>
      </div>
    </div>
  );
}
