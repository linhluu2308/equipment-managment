"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { themNhaCungCap, suaNhaCungCap } from "@/lib/actions/nhaCungCap";
import type { NhaCungCap } from "@/lib/types";

export default function SupplierModal({ nhaCungCap, onClose }: { nhaCungCap?: NhaCungCap; onClose: () => void }) {
  const router = useRouter();
  const dangSua = !!nhaCungCap;
  const [ten, setTen] = useState(nhaCungCap?.ten ?? "");
  const [soDienThoai, setSoDienThoai] = useState(nhaCungCap?.so_dien_thoai ?? "");
  const [ghiChu, setGhiChu] = useState(nhaCungCap?.ghi_chu ?? "");
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoi("");
    if (!ten.trim()) return setLoi("Cần nhập tên nhà cung cấp.");
    setDangGui(true);
    try {
      const input = { ten, so_dien_thoai: soDienThoai || undefined, ghi_chu: ghiChu || undefined };
      if (dangSua) await suaNhaCungCap(nhaCungCap.id, input);
      else await themNhaCungCap(input);
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
      <div className="modal-card" style={{ maxWidth: "440px" }}>
        <div className="modal-header">
          <div className="modal-title">{dangSua ? "Sửa nhà cung cấp" : "Thêm nhà cung cấp"}</div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-xl leading-none">
            ✕
          </button>
        </div>
        <form onSubmit={submit} className="flex flex-col overflow-hidden">
          <div className="modal-body">
            <input className="input" placeholder="Tên nhà cung cấp" value={ten} onChange={(e) => setTen(e.target.value)} />
            <input
              className="input"
              placeholder="Số điện thoại"
              value={soDienThoai}
              onChange={(e) => setSoDienThoai(e.target.value)}
            />
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
