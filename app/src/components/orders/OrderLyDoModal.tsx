"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Modal chung cho Xoá đơn / Khôi phục đơn — cả 2 đều chỉ cần xác nhận + lý do bắt
 * buộc, khác nhau ở nội dung cảnh báo và hàm server action gọi vào.
 */
export default function OrderLyDoModal({
  title,
  warning,
  confirmLabel,
  danger,
  action,
  onClose,
}: {
  title: string;
  warning: string;
  confirmLabel: string;
  danger?: boolean;
  action: (lyDo: string) => Promise<{ error?: string }>;
  onClose: () => void;
}) {
  const router = useRouter();
  const [lyDo, setLyDo] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState("");

  async function xacNhan() {
    if (!lyDo.trim()) return;
    setLoi("");
    setDangGui(true);
    try {
      const ketQua = await action(lyDo);
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
      <div className="modal-card" style={{ maxWidth: "440px" }}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-xl leading-none">
            ✕
          </button>
        </div>
        <div className="modal-body space-y-3">
          <p className="text-sm text-[var(--text-muted)]">{warning}</p>
          <label className="block text-sm">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Lý do (bắt buộc)
            </span>
            <textarea className="input" rows={3} value={lyDo} onChange={(e) => setLyDo(e.target.value)} autoFocus />
          </label>
          {loi && <p className="badge badge-danger !inline-block">{loi}</p>}
        </div>
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">
            Huỷ
          </button>
          <button
            type="button"
            disabled={dangGui || !lyDo.trim()}
            onClick={xacNhan}
            className={danger ? "btn-danger-outline" : "btn-primary"}
          >
            {dangGui ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
