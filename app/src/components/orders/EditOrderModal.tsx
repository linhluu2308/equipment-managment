"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { suaDonThue } from "@/lib/actions/donThue";
import type { DonThueDetail } from "@/lib/types";
import MoneyInput from "@/components/MoneyInput";

export default function EditOrderModal({ don, onClose }: { don: DonThueDetail; onClose: () => void }) {
  const router = useRouter();
  const [ten, setTen] = useState(don.khach_hang.ten);
  const [sdt, setSdt] = useState(don.khach_hang.so_dien_thoai);
  const [nguoiGioiThieu, setNguoiGioiThieu] = useState(don.khach_hang.nguoi_gioi_thieu ?? "");
  const [ngayBatDau, setNgayBatDau] = useState(don.ngay_bat_dau);
  const [ngayTra, setNgayTra] = useState(don.ngay_tra_du_kien);
  const [ngayBatDauSuDung, setNgayBatDauSuDung] = useState(don.ngay_bat_dau_su_dung);
  const [ngayKetThucSuDung, setNgayKetThucSuDung] = useState(don.ngay_ket_thuc_su_dung);
  const [ghiChu, setGhiChu] = useState(don.ghi_chu ?? "");
  const [thietBi, setThietBi] = useState(
    don.don_thue_chi_tiet.map((l) => ({
      id: l.id,
      ten: l.thiet_bi?.ten ?? "",
      gia_thue_chot: String(l.gia_thue_chot),
      phan_tram_chiet_khau: String(l.phan_tram_chiet_khau),
    }))
  );
  const [lyDo, setLyDo] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState("");

  function capNhatDong(id: string, field: "gia_thue_chot" | "phan_tram_chiet_khau", value: string) {
    setThietBi((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoi("");
    if (!ten || !sdt) return setLoi("Cần nhập tên và số điện thoại khách hàng.");
    if (!lyDo.trim()) return setLoi("Cần nhập lý do sửa đơn.");

    setDangGui(true);
    try {
      const ketQua = await suaDonThue(
        don.id,
        {
          khachHang: { ten, so_dien_thoai: sdt, nguoi_gioi_thieu: nguoiGioiThieu || undefined },
          ngay_bat_dau: ngayBatDau,
          ngay_tra_du_kien: ngayTra,
          ngay_bat_dau_su_dung: ngayBatDauSuDung,
          ngay_ket_thuc_su_dung: ngayKetThucSuDung,
          ghi_chu: ghiChu || undefined,
          thietBi: thietBi.map((l) => ({
            id: l.id,
            gia_thue_chot: Number(l.gia_thue_chot),
            phan_tram_chiet_khau: Number(l.phan_tram_chiet_khau),
          })),
        },
        lyDo
      );
      if (ketQua?.error) {
        setLoi(ketQua.error);
        return;
      }
      router.refresh();
      onClose();
    } finally {
      setDangGui(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: "680px" }}>
        <div className="modal-header">
          <div className="modal-title">Sửa đơn thuê</div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-xl leading-none">
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col overflow-hidden">
          <div className="modal-body">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Tên khách hàng">
                <input className="input" value={ten} onChange={(e) => setTen(e.target.value)} />
              </Field>
              <Field label="Số điện thoại">
                <input className="input" value={sdt} onChange={(e) => setSdt(e.target.value)} />
              </Field>
              <Field label="Người giới thiệu (không bắt buộc)">
                <input className="input" value={nguoiGioiThieu} onChange={(e) => setNguoiGioiThieu(e.target.value)} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Ngày xuất kho">
                <input
                  type="date"
                  className="input"
                  value={ngayBatDau}
                  max={ngayTra || undefined}
                  onChange={(e) => setNgayBatDau(e.target.value)}
                />
              </Field>
              <Field label="Ngày nhập kho dự kiến">
                <input
                  type="date"
                  className="input"
                  value={ngayTra}
                  min={ngayBatDau || undefined}
                  onChange={(e) => setNgayTra(e.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Ngày bắt đầu sử dụng (tính tiền)">
                <input
                  type="date"
                  className="input"
                  value={ngayBatDauSuDung}
                  min={ngayBatDau || undefined}
                  max={ngayKetThucSuDung || ngayTra || undefined}
                  onChange={(e) => setNgayBatDauSuDung(e.target.value)}
                />
              </Field>
              <Field label="Ngày kết thúc sử dụng (tính tiền)">
                <input
                  type="date"
                  className="input"
                  value={ngayKetThucSuDung}
                  min={ngayBatDauSuDung || ngayBatDau || undefined}
                  max={ngayTra || undefined}
                  onChange={(e) => setNgayKetThucSuDung(e.target.value)}
                />
              </Field>
            </div>

            <div>
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Giá thuê & chiết khấu từng thiết bị
              </div>
              <div className="divide-y divide-[var(--border-color)] rounded-lg border border-[var(--border-color)]">
                {thietBi.map((l) => (
                  <div key={l.id} className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm">
                    <span className="flex-1 min-w-[140px] font-semibold">{l.ten}</span>
                    <MoneyInput
                      placeholder="Giá thuê/ngày"
                      value={l.gia_thue_chot}
                      onChange={(v) => capNhatDong(l.id, "gia_thue_chot", v)}
                    />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="input !w-20"
                      placeholder="% CK"
                      value={l.phan_tram_chiet_khau}
                      onChange={(e) => capNhatDong(l.id, "phan_tram_chiet_khau", e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Field label="Ghi chú">
              <textarea className="input" rows={2} value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} />
            </Field>

            <Field label="Lý do sửa đơn (bắt buộc)">
              <textarea
                className="input"
                rows={2}
                placeholder="Vd: Nhập sai số điện thoại khách, khách đổi ngày lấy máy..."
                value={lyDo}
                onChange={(e) => setLyDo(e.target.value)}
              />
            </Field>

            {loi && <p className="badge badge-danger !inline-block">{loi}</p>}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Huỷ
            </button>
            <button type="submit" disabled={dangGui || !lyDo.trim()} className="btn-primary">
              {dangGui ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}
