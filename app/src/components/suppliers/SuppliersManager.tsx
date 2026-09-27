"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { xoaNhaCungCap } from "@/lib/actions/nhaCungCap";
import type { NhaCungCapDong } from "@/lib/queries/nhaCungCap";
import SupplierModal from "./SupplierModal";

export default function SuppliersManager({ danhSach }: { danhSach: NhaCungCapDong[] }) {
  const router = useRouter();
  const [loi, setLoi] = useState("");
  const [openThem, setOpenThem] = useState(false);
  const [dangSua, setDangSua] = useState<NhaCungCapDong | null>(null);
  const [dangXoa, setDangXoa] = useState<string | null>(null);

  async function xoa(ncc: NhaCungCapDong) {
    setLoi("");
    if (!confirm(`Xoá nhà cung cấp "${ncc.ten}"?`)) return;
    setDangXoa(ncc.id);
    try {
      const ketQua = await xoaNhaCungCap(ncc.id);
      if (ketQua?.error) setLoi(ketQua.error);
      else router.refresh();
    } finally {
      setDangXoa(null);
    }
  }

  const tongConNo = danhSach.reduce((s, n) => s + n.conNo, 0);

  return (
    <>
      <div className="action-bar mb-3">
        <div className="text-sm">
          Tổng công nợ còn lại:{" "}
          <span className="font-bold" style={{ color: tongConNo > 0 ? "#dc2626" : "#16a34a" }}>
            {tongConNo.toLocaleString("vi-VN")}đ
          </span>
        </div>
        <button className="btn-primary" onClick={() => setOpenThem(true)}>
          + Thêm nhà cung cấp
        </button>
      </div>

      {loi && <p className="badge badge-danger !inline-block mb-3">{loi}</p>}

      <div className="table-container" style={{ border: "none", boxShadow: "none" }}>
        <table>
          <thead>
            <tr>
              <th>Nhà cung cấp</th>
              <th>SĐT</th>
              <th>Thiết bị đang dùng</th>
              <th>Tổng nợ phát sinh</th>
              <th>Đã thanh toán</th>
              <th>Còn nợ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {danhSach.map((ncc) => (
              <tr key={ncc.id}>
                <td>
                  <Link href={`/suppliers/${ncc.id}`} className="font-semibold text-[var(--accent-primary)] hover:underline">
                    {ncc.ten}
                  </Link>
                </td>
                <td className="font-mono text-xs">{ncc.so_dien_thoai || "—"}</td>
                <td>{ncc.soThietBiDangDung}</td>
                <td>{ncc.tongNo.toLocaleString("vi-VN")}đ</td>
                <td>{ncc.tongDaTra.toLocaleString("vi-VN")}đ</td>
                <td className="font-bold" style={{ color: ncc.conNo > 0 ? "#dc2626" : "#16a34a" }}>
                  {ncc.conNo.toLocaleString("vi-VN")}đ
                </td>
                <td className="text-right whitespace-nowrap">
                  <button
                    className="text-xs text-[var(--accent-primary)] hover:underline mr-3"
                    onClick={() => setDangSua(ncc)}
                  >
                    Sửa
                  </button>
                  <button
                    disabled={dangXoa === ncc.id}
                    className="text-xs text-red-600 hover:underline disabled:opacity-40"
                    onClick={() => xoa(ncc)}
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
            {danhSach.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-[var(--text-muted)]">
                  Chưa có nhà cung cấp nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {openThem && <SupplierModal onClose={() => setOpenThem(false)} />}
      {dangSua && <SupplierModal nhaCungCap={dangSua} onClose={() => setDangSua(null)} />}
    </>
  );
}
