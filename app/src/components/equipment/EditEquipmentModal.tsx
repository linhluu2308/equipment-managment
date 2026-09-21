"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { suaThietBi } from "@/lib/actions/thietBi";
import type { NguonGoc, ThietBi } from "@/lib/types";

export default function EditEquipmentModal({
  thietBi,
  giaHienHanh,
  onClose,
}: {
  thietBi: ThietBi;
  giaHienHanh: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const [ten, setTen] = useState(thietBi.ten);
  const [ma, setMa] = useState(thietBi.ma ?? "");
  const [danhMuc, setDanhMuc] = useState(thietBi.danh_muc ?? "");
  const [nguonGoc, setNguonGoc] = useState<NguonGoc>(thietBi.nguon_goc);
  const [nhaCungCap, setNhaCungCap] = useState(thietBi.nha_cung_cap ?? "");
  const [giaVon, setGiaVon] = useState(thietBi.gia_von != null ? String(thietBi.gia_von) : "");
  const [giaThue, setGiaThue] = useState(String(giaHienHanh));
  const [moTa, setMoTa] = useState(thietBi.mo_ta ?? "");
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoi("");
    if (!ten || !giaThue) return setLoi("Cần nhập tên thiết bị và giá thuê/ngày.");
    setDangGui(true);
    try {
      await suaThietBi(
        thietBi.id,
        {
          ten,
          ma: ma || undefined,
          danh_muc: danhMuc || undefined,
          nguon_goc: nguonGoc,
          nha_cung_cap: nhaCungCap || undefined,
          gia_von: giaVon ? Number(giaVon) : undefined,
          gia_thue: Number(giaThue),
          mo_ta: moTa || undefined,
        },
        giaHienHanh
      );
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
      <div className="modal-card" style={{ maxWidth: "520px" }}>
        <div className="modal-header">
          <div className="modal-title">Sửa thiết bị</div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-xl leading-none">
            ✕
          </button>
        </div>
        <form onSubmit={submit} className="flex flex-col overflow-hidden">
        <div className="modal-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input" placeholder="Tên thiết bị" value={ten} onChange={(e) => setTen(e.target.value)} />
            <input className="input" placeholder="Mã/Serial" value={ma} onChange={(e) => setMa(e.target.value)} />
          </div>
          <input className="input" placeholder="Danh mục (Body, Lens, Đèn...)" value={danhMuc} onChange={(e) => setDanhMuc(e.target.value)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select className="input" value={nguonGoc} onChange={(e) => setNguonGoc(e.target.value as NguonGoc)}>
              <option value="so_huu">Tự sở hữu</option>
              <option value="thue_ngoai">Thuê ngoài</option>
            </select>
            <input
              className="input"
              type="number"
              placeholder="Giá thuê/ngày (VND)"
              value={giaThue}
              onChange={(e) => setGiaThue(e.target.value)}
            />
          </div>
          {giaThue && Number(giaThue) !== giaHienHanh && (
            <p className="text-xs text-[var(--text-muted)]">
              Giá thuê thay đổi sẽ được ghi thêm một dòng mới vào lịch sử giá (giá cũ vẫn giữ nguyên trong lịch sử).
            </p>
          )}
          {nguonGoc === "thue_ngoai" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                className="input"
                placeholder="Nhà cung cấp"
                value={nhaCungCap}
                onChange={(e) => setNhaCungCap(e.target.value)}
              />
              <input
                className="input"
                type="number"
                placeholder="Giá vốn (VND)"
                value={giaVon}
                onChange={(e) => setGiaVon(e.target.value)}
              />
            </div>
          )}
          <textarea className="input" rows={2} placeholder="Mô tả" value={moTa} onChange={(e) => setMoTa(e.target.value)} />

          {loi && <p className="badge badge-danger !inline-block">{loi}</p>}
        </div>
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">
            Huỷ
          </button>
          <button type="submit" disabled={dangGui} className="btn-primary">
            {dangGui ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}
