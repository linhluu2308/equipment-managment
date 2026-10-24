"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVai } from "@/lib/auth-context";
import { suaThanhToan, xoaThanhToan } from "@/lib/actions/thanhToan";
import { LOAI_THANH_TOAN_LABEL, type LoaiThanhToan, type ThanhToan } from "@/lib/types";
import { formatNgay } from "@/lib/formatDate";
import MoneyInput from "@/components/MoneyInput";
import OrderLyDoModal from "./OrderLyDoModal";

/** Nút sửa/xoá một giao dịch thanh toán — chỉ vai "chu" thấy, server cũng kiểm tra lại quyền. */
export default function ThanhToanChuActions({ donId, giaoDich }: { donId: string; giaoDich: ThanhToan }) {
  const { vai } = useVai();
  const [openSua, setOpenSua] = useState(false);
  const [openXoa, setOpenXoa] = useState(false);

  if (vai !== "chu") return null;

  return (
    <>
      <span className="ml-2 inline-flex gap-1">
        <button
          type="button"
          title="Sửa giao dịch"
          onClick={() => setOpenSua(true)}
          className="rounded px-1.5 text-xs text-[var(--text-muted)] hover:bg-[#f1f5f9] hover:text-[var(--text-main)]"
        >
          ✏️
        </button>
        <button
          type="button"
          title="Xoá giao dịch"
          onClick={() => setOpenXoa(true)}
          className="rounded px-1.5 text-xs text-[var(--text-muted)] hover:bg-[#fef2f2] hover:text-[#dc2626]"
        >
          🗑️
        </button>
      </span>

      {openSua && <SuaThanhToanModal donId={donId} giaoDich={giaoDich} onClose={() => setOpenSua(false)} />}
      {openXoa && (
        <OrderLyDoModal
          title="Xoá giao dịch thanh toán"
          warning={`Xoá giao dịch ${LOAI_THANH_TOAN_LABEL[giaoDich.loai]} ${giaoDich.so_tien.toLocaleString("vi-VN")}đ ngày ${formatNgay(giaoDich.ngay_thu)}. Công nợ của đơn sẽ được tính lại; nội dung giao dịch vẫn được lưu trong Lịch sử thay đổi.`}
          confirmLabel="Xoá giao dịch"
          danger
          action={(lyDo) => xoaThanhToan(giaoDich.id, donId, lyDo)}
          onClose={() => setOpenXoa(false)}
        />
      )}
    </>
  );
}

function SuaThanhToanModal({
  donId,
  giaoDich,
  onClose,
}: {
  donId: string;
  giaoDich: ThanhToan;
  onClose: () => void;
}) {
  const router = useRouter();
  const [soTien, setSoTien] = useState(String(giaoDich.so_tien));
  const [loai, setLoai] = useState<LoaiThanhToan>(giaoDich.loai);
  const [hinhThuc, setHinhThuc] = useState(giaoDich.hinh_thuc ?? "");
  const [ngayThu, setNgayThu] = useState(giaoDich.ngay_thu);
  const [lyDo, setLyDo] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState("");

  async function luu() {
    if (!lyDo.trim()) return;
    setLoi("");
    setDangGui(true);
    try {
      const res = await suaThanhToan(
        giaoDich.id,
        donId,
        { so_tien: Number(soTien), loai, hinh_thuc: hinhThuc || null, ngay_thu: ngayThu },
        lyDo
      );
      if (res.error) {
        setLoi(res.error);
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
      <div className="modal-card" style={{ maxWidth: "440px" }}>
        <div className="modal-header">
          <div className="modal-title">Sửa giao dịch thanh toán</div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-xl leading-none">
            ✕
          </button>
        </div>
        <div className="modal-body space-y-3 text-sm">
          <Truong label="Số tiền">
            <MoneyInput value={soTien} onChange={setSoTien} />
          </Truong>
          <div className="grid grid-cols-2 gap-2">
            <Truong label="Loại">
              <select className="input" value={loai} onChange={(e) => setLoai(e.target.value as LoaiThanhToan)}>
                {(Object.keys(LOAI_THANH_TOAN_LABEL) as LoaiThanhToan[]).map((l) => (
                  <option key={l} value={l}>
                    {LOAI_THANH_TOAN_LABEL[l]}
                  </option>
                ))}
              </select>
            </Truong>
            <Truong label="Hình thức">
              <select className="input" value={hinhThuc} onChange={(e) => setHinhThuc(e.target.value)}>
                <option value="Chuyển khoản">Chuyển khoản</option>
                <option value="Tiền mặt">Tiền mặt</option>
                {hinhThuc !== "Chuyển khoản" && hinhThuc !== "Tiền mặt" && <option value={hinhThuc}>{hinhThuc || "—"}</option>}
              </select>
            </Truong>
          </div>
          <Truong label="Ngày thu">
            <input className="input" type="date" value={ngayThu} onChange={(e) => setNgayThu(e.target.value)} />
          </Truong>
          <Truong label="Lý do (bắt buộc)">
            <textarea className="input" rows={2} value={lyDo} onChange={(e) => setLyDo(e.target.value)} />
          </Truong>
          {loi && <p className="badge badge-danger !inline-block">{loi}</p>}
        </div>
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">
            Huỷ
          </button>
          <button type="button" disabled={dangGui || !lyDo.trim() || !soTien} onClick={luu} className="btn-primary">
            {dangGui ? "Đang lưu..." : "Lưu thay đổi"}
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
