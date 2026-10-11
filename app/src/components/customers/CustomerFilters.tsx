"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { KhachHangDong } from "@/lib/queries/khachHang";
import { boDau } from "@/lib/text";

export default function CustomerFilters({ khachHangList }: { khachHangList: KhachHangDong[] }) {
  const [tuKhoa, setTuKhoa] = useState("");

  const filtered = useMemo(() => {
    const tuKhoaChuan = boDau(tuKhoa.trim());
    if (!tuKhoaChuan) return khachHangList;
    return khachHangList.filter(
      (kh) => boDau(kh.ten).includes(tuKhoaChuan) || kh.soDienThoai.includes(tuKhoa.trim())
    );
  }, [khachHangList, tuKhoa]);

  const tongConNo = khachHangList.reduce((s, kh) => s + kh.conNo, 0);

  return (
    <>
      <div className="action-bar">
        <input
          type="text"
          className="input w-full sm:!w-64"
          placeholder="🔍 Tên hoặc số điện thoại khách..."
          value={tuKhoa}
          onChange={(e) => setTuKhoa(e.target.value)}
        />
        <div className="text-sm">
          Tổng công nợ còn lại:{" "}
          <span className="font-bold" style={{ color: tongConNo > 0 ? "#dc2626" : "#16a34a" }}>
            {tongConNo.toLocaleString("vi-VN")}đ
          </span>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tên khách</th>
              <th>Số điện thoại</th>
              <th>Người giới thiệu</th>
              <th>Số đơn</th>
              <th>Tổng chi tiêu</th>
              <th>Đã thu</th>
              <th>Còn nợ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((kh) => (
              <tr key={kh.soDienThoai}>
                <td>
                  <Link
                    href={`/customers/${encodeURIComponent(kh.soDienThoai)}`}
                    className="font-semibold text-[var(--accent-primary)] hover:underline"
                  >
                    {kh.ten}
                  </Link>
                </td>
                <td className="font-mono text-xs">{kh.soDienThoai}</td>
                <td className="text-[var(--text-muted)]">{kh.nguoiGioiThieu || "—"}</td>
                <td>{kh.soDon}</td>
                <td>{kh.tongChiTieu.toLocaleString("vi-VN")}đ</td>
                <td>{kh.daThu.toLocaleString("vi-VN")}đ</td>
                <td className="font-bold" style={{ color: kh.conNo > 0 ? "#dc2626" : "#16a34a" }}>
                  {kh.conNo.toLocaleString("vi-VN")}đ
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-[var(--text-muted)]">
                  {khachHangList.length === 0 ? "Chưa có khách hàng nào." : "Không tìm thấy khách hàng phù hợp."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
