"use client";

import { useState } from "react";
import { soNgayThue, thanhTienDong } from "@/lib/calculations";
import type { ChangDon } from "@/lib/types";

type DonChiTiet = {
  gia_thue_chot: number;
  phan_tram_chiet_khau: number;
  thiet_bi: { ten: string; ma: string | null } | null;
};

export default function XuatBaoGiaButton({
  maDon,
  tenKhach,
  sdtKhach,
  ngayBatDau,
  ngayTraDuKien,
  chiTiet,
  chang,
}: {
  maDon: string;
  tenKhach: string;
  sdtKhach: string;
  ngayBatDau: string;
  ngayTraDuKien: string;
  chiTiet: DonChiTiet[];
  chang: ChangDon;
}) {
  const [dangXuat, setDangXuat] = useState(false);
  const [loi, setLoi] = useState("");

  if (chang === "yeu_cau" || chang === "huy") return null;

  async function xuatPdf() {
    setDangXuat(true);
    setLoi("");
    try {
      const [{ pdf }, { default: BaoGiaDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/lib/pdf/BaoGiaDocument"),
      ]);

      const soNgay = soNgayThue(ngayBatDau, ngayTraDuKien);
      const dong = chiTiet.map((l) => ({
        ten: l.thiet_bi?.ten ?? "Thiết bị",
        ma: l.thiet_bi?.ma ?? null,
        donGia: l.gia_thue_chot,
        chietKhauPhanTram: l.phan_tram_chiet_khau,
        thanhTien: thanhTienDong(l, soNgay),
      }));

      const blob = await pdf(
        <BaoGiaDocument
          maDon={maDon}
          ngayLap={new Date().toLocaleDateString("vi-VN")}
          tenKhach={tenKhach}
          sdtKhach={sdtKhach}
          ngayBatDau={ngayBatDau}
          ngayTraDuKien={ngayTraDuKien}
          soNgay={soNgay}
          dong={dong}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bao-gia-CineB-${maDon}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Xuất báo giá PDF lỗi:", err);
      setLoi("Xuất PDF thất bại. Thử lại hoặc báo kỹ thuật kèm thời điểm bấm nút.");
    } finally {
      setDangXuat(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button type="button" onClick={xuatPdf} disabled={dangXuat} className="btn-secondary">
        {dangXuat ? "Đang xuất..." : "📄 Xuất báo giá PDF"}
      </button>
      {loi && <p className="badge badge-danger !inline-block">{loi}</p>}
    </div>
  );
}
