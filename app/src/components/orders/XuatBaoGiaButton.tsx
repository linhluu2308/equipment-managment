"use client";

import { useState } from "react";
import { moTaChietKhau, soNgayThue, soNgaySuDungDong, thanhTienDong } from "@/lib/calculations";
import { formatNgay } from "@/lib/formatDate";
import type { ChangDon } from "@/lib/types";

type DonChiTiet = {
  gia_thue_chot: number;
  phan_tram_chiet_khau: number;
  tien_chiet_khau_ngay?: number;
  ngay_bat_dau_su_dung?: string | null;
  ngay_ket_thuc_su_dung?: string | null;
  thiet_bi: { ten: string; ma: string | null } | null;
};

export default function XuatBaoGiaButton({
  maDon,
  tenKhach,
  sdtKhach,
  ngayBatDau,
  ngayTraDuKien,
  ngayBatDauSuDung,
  ngayKetThucSuDung,
  chiTiet,
  giamGiaDon,
  chang,
}: {
  maDon: string;
  tenKhach: string;
  sdtKhach: string;
  ngayBatDau: string;
  ngayTraDuKien: string;
  ngayBatDauSuDung: string;
  ngayKetThucSuDung: string;
  chiTiet: DonChiTiet[];
  giamGiaDon: number;
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

      const soNgay = soNgayThue(ngayBatDauSuDung, ngayKetThucSuDung);
      const dong = chiTiet.map((l) => {
        const soNgayDong = soNgaySuDungDong(
          { ngay_bat_dau_su_dung: ngayBatDauSuDung, ngay_ket_thuc_su_dung: ngayKetThucSuDung },
          l
        );
        return {
          ten: l.thiet_bi?.ten ?? "Thiết bị",
          ma: l.thiet_bi?.ma ?? null,
          donGia: l.gia_thue_chot,
          chietKhau: moTaChietKhau(l),
          soNgay: soNgayDong,
          thanhTien: thanhTienDong(l, soNgayDong),
        };
      });

      const blob = await pdf(
        <BaoGiaDocument
          maDon={maDon}
          ngayLap={formatNgay(new Date().toISOString())}
          tenKhach={tenKhach}
          sdtKhach={sdtKhach}
          ngayBatDau={formatNgay(ngayBatDau)}
          ngayTraDuKien={formatNgay(ngayTraDuKien)}
          ngayBatDauSuDung={formatNgay(ngayBatDauSuDung)}
          ngayKetThucSuDung={formatNgay(ngayKetThucSuDung)}
          soNgay={soNgay}
          dong={dong}
          giamGiaDon={giamGiaDon}
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
