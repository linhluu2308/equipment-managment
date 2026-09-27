"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ghiNhanThanhToanNcc, xoaNhaCungCap } from "@/lib/actions/nhaCungCap";
import type { NhaCungCap } from "@/lib/types";
import SupplierModal from "./SupplierModal";

export default function SupplierDetailActions({ nhaCungCap }: { nhaCungCap: NhaCungCap }) {
  const router = useRouter();
  const [openThanhToan, setOpenThanhToan] = useState(false);
  const [openSua, setOpenSua] = useState(false);
  const [dangXoa, setDangXoa] = useState(false);
  const [loi, setLoi] = useState("");

  async function xoa() {
    setLoi("");
    if (!confirm(`Xoá vĩnh viễn nhà cung cấp "${nhaCungCap.ten}"?`)) return;
    setDangXoa(true);
    try {
      const ketQua = await xoaNhaCungCap(nhaCungCap.id);
      if (ketQua?.error) setLoi(ketQua.error);
      else router.push("/suppliers");
    } finally {
      setDangXoa(false);
    }
  }

  return (
    <section className="card space-y-3">
      <div className="card-title !mb-0">Quản lý nhà cung cấp</div>
      {loi && <p className="badge badge-danger !inline-block">{loi}</p>}

      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={() => setOpenThanhToan(true)}>
          💸 Ghi nhận thanh toán
        </button>
        <button className="btn-secondary" onClick={() => setOpenSua(true)}>
          ✏️ Sửa thông tin
        </button>
        <button disabled={dangXoa} className="btn-danger-outline" onClick={xoa}>
          {dangXoa ? "Đang xử lý..." : "🗑️ Xoá nhà cung cấp"}
        </button>
      </div>
      <p className="text-xs text-[var(--text-muted)]">
        Không xoá được nhà cung cấp đang gắn với thiết bị hoặc đã có lịch sử công nợ.
      </p>

      {openThanhToan && (
        <RecordPaymentModal nhaCungCapId={nhaCungCap.id} onClose={() => setOpenThanhToan(false)} />
      )}
      {openSua && <SupplierModal nhaCungCap={nhaCungCap} onClose={() => setOpenSua(false)} />}
    </section>
  );
}

function RecordPaymentModal({ nhaCungCapId, onClose }: { nhaCungCapId: string; onClose: () => void }) {
  const router = useRouter();
  const [soTien, setSoTien] = useState("");
  const [ngay, setNgay] = useState(() => new Date().toISOString().slice(0, 10));
  const [ghiChu, setGhiChu] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoi("");
    if (!soTien || Number(soTien) <= 0) return setLoi("Cần nhập số tiền lớn hơn 0.");
    setDangGui(true);
    try {
      await ghiNhanThanhToanNcc(nhaCungCapId, { so_tien: Number(soTien), ngay, ghi_chu: ghiChu || undefined });
      router.refresh();
      onClose();
    } catch (err) {
      setLoi((err as Error).message);
    } finally {
      setDangGui(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: "420px" }}>
        <div className="modal-header">
          <div className="modal-title">Ghi nhận thanh toán</div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-xl leading-none">
            ✕
          </button>
        </div>
        <form onSubmit={submit} className="flex flex-col overflow-hidden">
          <div className="modal-body">
            <input
              className="input"
              type="number"
              placeholder="Số tiền (VND)"
              value={soTien}
              onChange={(e) => setSoTien(e.target.value)}
            />
            <input className="input" type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} />
            <textarea className="input" rows={2} placeholder="Ghi chú" value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} />

            {loi && <p className="badge badge-danger !inline-block">{loi}</p>}
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Huỷ
            </button>
            <button type="submit" disabled={dangGui} className="btn-primary">
              {dangGui ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
