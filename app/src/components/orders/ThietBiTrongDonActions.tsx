"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVai } from "@/lib/auth-context";
import { boThietBiKhoiDon, traSomThietBi } from "@/lib/actions/thietBiTrongDon";
import { khoangSuDungDong, ngayXuatKhoDong, soNgayThue, thanhTienDong } from "@/lib/calculations";
import { formatNgay } from "@/lib/formatDate";
import type { DonThueDetail, TinhTrangThietBi } from "@/lib/types";
import OrderLyDoModal from "./OrderLyDoModal";
import ThemThietBiModal from "./ThemThietBiModal";

type Dong = DonThueDetail["don_thue_chi_tiet"][number];

/** Nút "+ Thêm thiết bị" — Yêu cầu/Báo giá/Đã giao, mọi vai. */
export function ThemThietBiButton({ don }: { don: DonThueDetail }) {
  const [open, setOpen] = useState(false);
  if (don.da_xoa || !["yeu_cau", "bao_gia", "da_giao"].includes(don.chang)) return null;
  return (
    <>
      <button type="button" className="btn-secondary !py-1 text-xs" onClick={() => setOpen(true)}>
        + {don.chang === "da_giao" ? "Khách thuê thêm" : "Thêm thiết bị"}
      </button>
      {open && <ThemThietBiModal don={don} onClose={() => setOpen(false)} />}
    </>
  );
}

/**
 * Thao tác trên 1 dòng thiết bị: "Trả sớm" (Đã giao, chưa kiểm tra trả — mọi vai) và
 * "Bỏ" (chưa giao: mọi vai; Đã giao/Chờ thanh toán: chỉ chủ, có lý do).
 */
export default function DongThietBiActions({ don, line }: { don: DonThueDetail; line: Dong }) {
  const router = useRouter();
  const { vai } = useVai();
  const [openTraSom, setOpenTraSom] = useState(false);
  const [openBo, setOpenBo] = useState(false);
  const [dangBo, setDangBo] = useState(false);
  const [loi, setLoi] = useState("");

  if (don.da_xoa) return null;
  const chuaGiao = don.chang === "yeu_cau" || don.chang === "bao_gia";
  const dangChay = don.chang === "da_giao" || don.chang === "cho_tra";
  const daKiemTra = don.kiem_tra_tinh_trang.some((k) => k.thiet_bi_id === line.thiet_bi_id);
  const choTraSom = don.chang === "da_giao" && !daKiemTra;
  const choBo = don.don_thue_chi_tiet.length > 1 && (chuaGiao || (dangChay && vai === "chu"));
  if (!choTraSom && !choBo) return null;

  async function boNgay() {
    if (!confirm(`Bỏ "${line.thiet_bi?.ten}" khỏi đơn?`)) return;
    setLoi("");
    setDangBo(true);
    try {
      const res = await boThietBiKhoiDon(don.id, line.id, "");
      if (res.error) return setLoi(res.error);
      router.refresh();
    } finally {
      setDangBo(false);
    }
  }

  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-2">
      {choTraSom && (
        <button type="button" className="text-xs font-semibold text-[var(--accent-primary)] hover:underline" onClick={() => setOpenTraSom(true)}>
          Trả sớm
        </button>
      )}
      {choBo && (
        <button
          type="button"
          disabled={dangBo}
          className="text-xs text-red-600 hover:underline disabled:opacity-50"
          onClick={() => (chuaGiao ? boNgay() : setOpenBo(true))}
        >
          {dangBo ? "..." : "Bỏ"}
        </button>
      )}
      {loi && <span className="badge badge-danger">{loi}</span>}

      {openTraSom && <TraSomModal don={don} line={line} onClose={() => setOpenTraSom(false)} />}
      {openBo && (
        <OrderLyDoModal
          title="Bỏ thiết bị khỏi đơn"
          warning={`Bỏ hẳn "${line.thiet_bi?.ten}" khỏi đơn — không tính tiền thiết bị này nữa, thiết bị về "Sẵn sàng". Chỉ dùng khi nhập nhầm; khách trả sớm thì dùng "Trả sớm" để vẫn tính tiền những ngày đã dùng.`}
          confirmLabel="Bỏ thiết bị"
          danger
          action={(lyDo) => boThietBiKhoiDon(don.id, line.id, lyDo)}
          onClose={() => setOpenBo(false)}
        />
      )}
    </span>
  );
}

function homNay() {
  return new Date().toISOString().slice(0, 10);
}

function TraSomModal({ don, line, onClose }: { don: DonThueDetail; line: Dong; onClose: () => void }) {
  const router = useRouter();
  const { tu, den } = khoangSuDungDong(don, line);
  const ngayGiao = ngayXuatKhoDong(don, line);
  const macDinh = homNay() < ngayGiao ? ngayGiao : homNay();
  const [ngayTra, setNgayTra] = useState(macDinh);
  const [ngayCuoi, setNgayCuoi] = useState(macDinh > den ? den : macDinh < tu ? tu : macDinh);
  const [tinhTrang, setTinhTrang] = useState<TinhTrangThietBi>("tot");
  const [nguoiKiem, setNguoiKiem] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState("");

  const soNgayCu = soNgayThue(tu, den);
  const soNgayMoi = ngayCuoi >= tu ? soNgayThue(tu, ngayCuoi) : 0;

  async function luu() {
    setLoi("");
    setDangGui(true);
    try {
      const res = await traSomThietBi(don.id, line.id, {
        ngay_tra: ngayTra,
        ngay_ket_thuc_su_dung: ngayCuoi,
        tinh_trang: tinhTrang,
        nguoi_kiem: nguoiKiem,
        ghi_chu: ghiChu,
      });
      if (res.error) return setLoi(res.error);
      router.refresh();
      onClose();
    } finally {
      setDangGui(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card text-left" style={{ maxWidth: "460px" }}>
        <div className="modal-header">
          <div className="modal-title">Trả sớm: {line.thiet_bi?.ten}</div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-xl leading-none">
            ✕
          </button>
        </div>
        <div className="modal-body space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <Truong label="Ngày trả về kho">
              <input
                type="date"
                className="input"
                value={ngayTra}
                min={ngayGiao}
                onChange={(e) => {
                  setNgayTra(e.target.value);
                  if (ngayCuoi > e.target.value) setNgayCuoi(e.target.value < tu ? tu : e.target.value);
                }}
              />
            </Truong>
            <Truong label="Ngày cuối khách dùng">
              <input
                type="date"
                className="input"
                value={ngayCuoi}
                min={tu}
                max={ngayTra < den ? ngayTra : den}
                onChange={(e) => setNgayCuoi(e.target.value)}
              />
            </Truong>
          </div>
          <p className="rounded-lg bg-[#f8fafc] p-2 text-xs">
            Tính tiền: {formatNgay(tu)} → {formatNgay(ngayCuoi)} ={" "}
            <span className="font-bold">{soNgayMoi} ngày</span> (trước đây {soNgayCu} ngày) ·{" "}
            <span className="font-bold">{thanhTienDong(line, soNgayMoi).toLocaleString("vi-VN")}đ</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Truong label="Tình trạng khi trả">
              <select className="input" value={tinhTrang} onChange={(e) => setTinhTrang(e.target.value as TinhTrangThietBi)}>
                <option value="tot">Tốt</option>
                <option value="tray_xuoc">Trầy xước</option>
                <option value="hong">Hỏng hóc</option>
              </select>
            </Truong>
            <Truong label="Người kiểm">
              <input className="input" value={nguoiKiem} onChange={(e) => setNguoiKiem(e.target.value)} />
            </Truong>
          </div>
          <Truong label="Ghi chú">
            <input className="input" value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} />
          </Truong>
          {loi && <p className="badge badge-danger !inline-block">{loi}</p>}
        </div>
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">
            Huỷ
          </button>
          <button type="button" disabled={dangGui || soNgayMoi <= 0} onClick={luu} className="btn-primary">
            {dangGui ? "Đang lưu..." : "Xác nhận trả sớm"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Truong({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
      {children}
    </label>
  );
}
