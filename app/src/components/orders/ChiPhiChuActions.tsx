"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVai } from "@/lib/auth-context";
import { suaChiPhi, xoaChiPhi } from "@/lib/actions/chiPhi";
import { aiChiuChiPhi, moTaChiPhi } from "@/lib/calculations";
import { LOAI_CHI_PHI, type ChiPhi } from "@/lib/types";
import ChiPhiSoTienInput, { daNhapSoTien, soTienChiPhi, type GiaTriChiPhi } from "./ChiPhiSoTienInput";
import OrderLyDoModal from "./OrderLyDoModal";

/** Nút sửa/xoá một khoản chi phí phát sinh — chỉ vai "chu" thấy, server cũng kiểm tra lại quyền. */
export default function ChiPhiChuActions({ donId, chiPhi }: { donId: string; chiPhi: ChiPhi }) {
  const { vai } = useVai();
  const [openSua, setOpenSua] = useState(false);
  const [openXoa, setOpenXoa] = useState(false);

  if (vai !== "chu") return null;

  return (
    <>
      <span className="ml-2 inline-flex gap-1">
        <button
          type="button"
          title="Sửa chi phí"
          onClick={() => setOpenSua(true)}
          className="rounded px-1.5 text-xs text-[var(--text-muted)] hover:bg-[#f1f5f9] hover:text-[var(--text-main)]"
        >
          ✏️
        </button>
        <button
          type="button"
          title="Xoá chi phí"
          onClick={() => setOpenXoa(true)}
          className="rounded px-1.5 text-xs text-[var(--text-muted)] hover:bg-[#fef2f2] hover:text-[#dc2626]"
        >
          🗑️
        </button>
      </span>

      {openSua && <SuaChiPhiModal donId={donId} chiPhi={chiPhi} onClose={() => setOpenSua(false)} />}
      {openXoa && (
        <OrderLyDoModal
          title="Xoá chi phí phát sinh"
          warning={`Xoá khoản ${chiPhi.loai} (${moTaChiPhi(chiPhi)}). Công nợ và báo cáo sẽ được tính lại; nội dung khoản vẫn được lưu trong Lịch sử thay đổi.`}
          confirmLabel="Xoá chi phí"
          danger
          action={(lyDo) => xoaChiPhi(chiPhi.id, donId, lyDo)}
          onClose={() => setOpenXoa(false)}
        />
      )}
    </>
  );
}

function SuaChiPhiModal({ donId, chiPhi, onClose }: { donId: string; chiPhi: ChiPhi; onClose: () => void }) {
  const router = useRouter();
  const [loai, setLoai] = useState(chiPhi.loai);
  const [moTa, setMoTa] = useState(chiPhi.mo_ta ?? "");
  const [soTien, setSoTien] = useState<GiaTriChiPhi>(() => {
    const aiChiu = aiChiuChiPhi(chiPhi);
    return {
      aiChiu,
      soTien: String(aiChiu === "cineb" ? chiPhi.cineb_chi : chiPhi.thu_khach),
      thuKhach: String(chiPhi.thu_khach),
      cinebChi: String(chiPhi.cineb_chi),
    };
  });
  const [lyDo, setLyDo] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState("");

  async function luu() {
    if (!lyDo.trim()) return;
    setLoi("");
    setDangGui(true);
    try {
      const res = await suaChiPhi(chiPhi.id, donId, { loai, mo_ta: moTa || null, ...soTienChiPhi(soTien) }, lyDo);
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
          <div className="modal-title">Sửa chi phí phát sinh</div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-xl leading-none">
            ✕
          </button>
        </div>
        <div className="modal-body space-y-3 text-sm">
          <Truong label="Loại">
            <select className="input" value={loai} onChange={(e) => setLoai(e.target.value)}>
              {LOAI_CHI_PHI.map((l) => (
                <option key={l}>{l}</option>
              ))}
              {!(LOAI_CHI_PHI as readonly string[]).includes(loai) && <option value={loai}>{loai}</option>}
            </select>
          </Truong>
          <Truong label="Mô tả">
            <input className="input" value={moTa} onChange={(e) => setMoTa(e.target.value)} />
          </Truong>
          <Truong label="Ai chịu">
            <ChiPhiSoTienInput value={soTien} onChange={setSoTien} />
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
          <button
            type="button"
            disabled={dangGui || !lyDo.trim() || !daNhapSoTien(soTien)}
            onClick={luu}
            className="btn-primary"
          >
            {dangGui ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Truong({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
      {children}
    </div>
  );
}
