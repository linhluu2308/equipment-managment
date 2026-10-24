"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { listThietBi } from "@/lib/actions/thietBi";
import { kiemTraTrungLich } from "@/lib/actions/donThue";
import { themThietBiVaoDon } from "@/lib/actions/thietBiTrongDon";
import { CO_SO_TINH_GIA_VON_LABEL, type CoSoTinhGiaVon, type DonThueDetail } from "@/lib/types";
import { formatNgay } from "@/lib/formatDate";
import ChietKhauInput, { CHIET_KHAU_TRONG, sangCotDb, type ChietKhauNhap } from "./ChietKhauInput";

type ThietBiOption = {
  id: string;
  ten: string;
  ma: string | null;
  danh_muc: string | null;
  trang_thai: string;
  nguon_goc: string;
  gia_hien_hanh: number;
};

type ChonThietBi = {
  thiet_bi_id: string;
  gia_thue_chot: number;
  chietKhau: ChietKhauNhap;
  tinh_gia_von_theo: CoSoTinhGiaVon;
};

function homNay() {
  return new Date().toISOString().slice(0, 10);
}

function kepTrongKhoang(ngay: string, tu: string, den: string) {
  return ngay < tu ? tu : ngay > den ? den : ngay;
}

/**
 * Thêm thiết bị vào đơn đã tạo. Đơn chưa giao: theo ngày của cả đơn. Đơn đang giao
 * (khách thuê thêm): chọn ngày giao thêm + ngày bắt đầu tính tiền riêng.
 */
export default function ThemThietBiModal({ don, onClose }: { don: DonThueDetail; onClose: () => void }) {
  const router = useRouter();
  const dangGiao = don.chang === "da_giao";
  const daCo = useMemo(() => new Set(don.don_thue_chi_tiet.map((l) => l.thiet_bi_id)), [don]);

  const [thietBiList, setThietBiList] = useState<ThietBiOption[]>([]);
  const [tuKhoa, setTuKhoa] = useState("");
  const [chon, setChon] = useState<Record<string, ChonThietBi>>({});
  const [canhBao, setCanhBao] = useState<Record<string, string>>({});
  const ngayGiaoMacDinh = kepTrongKhoang(homNay(), don.ngay_bat_dau, don.ngay_tra_du_kien);
  const [ngayGiao, setNgayGiao] = useState(ngayGiaoMacDinh);
  const [ngayBatDauSuDung, setNgayBatDauSuDung] = useState(
    ngayGiaoMacDinh > don.ngay_bat_dau_su_dung ? ngayGiaoMacDinh : don.ngay_bat_dau_su_dung
  );
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState("");

  useEffect(() => {
    listThietBi().then((data) => setThietBiList(data as unknown as ThietBiOption[]));
  }, []);

  const filtered = thietBiList.filter((t) => {
    if (daCo.has(t.id) || t.trang_thai === "hong" || t.trang_thai === "thanh_ly") return false;
    const k = tuKhoa.toLowerCase();
    return !k || t.ten.toLowerCase().includes(k) || (t.ma ?? "").toLowerCase().includes(k);
  });

  async function toggleChon(tb: ThietBiOption) {
    if (chon[tb.id]) {
      setChon((p) => {
        const n = { ...p };
        delete n[tb.id];
        return n;
      });
      return;
    }
    setChon((p) => ({
      ...p,
      [tb.id]: { thiet_bi_id: tb.id, gia_thue_chot: tb.gia_hien_hanh, chietKhau: CHIET_KHAU_TRONG, tinh_gia_von_theo: "ngay_di_chuyen" },
    }));
    const kq = await kiemTraTrungLich(tb.id, dangGiao ? ngayGiao : don.ngay_bat_dau, don.ngay_tra_du_kien, don.id);
    if (kq.tinhTrang !== "trong") {
      const ma = kq.donTrung?.ma_don ?? kq.donTrung?.id.slice(0, 8).toUpperCase();
      setCanhBao((p) => ({
        ...p,
        [tb.id]: kq.tinhTrang === "khoa_cung" ? `Đã bị giữ bởi đơn ${ma}` : `Có đơn khác đang hỏi cùng ngày (${ma})`,
      }));
    }
  }

  function capNhat(id: string, patch: Partial<ChonThietBi>) {
    setChon((p) => ({ ...p, [id]: { ...p[id], ...patch } }));
  }

  async function luu() {
    setLoi("");
    if (Object.keys(chon).length === 0) return setLoi("Cần chọn ít nhất một thiết bị.");
    setDangGui(true);
    try {
      const res = await themThietBiVaoDon(don.id, {
        thietBi: Object.values(chon).map(({ chietKhau, ...tb }) => ({ ...tb, ...sangCotDb(chietKhau) })),
        ...(dangGiao ? { ngay_giao: ngayGiao, ngay_bat_dau_su_dung: ngayBatDauSuDung } : {}),
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
      <div className="modal-card" style={{ maxWidth: "640px" }}>
        <div className="modal-header">
          <div className="modal-title">{dangGiao ? "Khách thuê thêm thiết bị" : "Thêm thiết bị vào đơn"}</div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-xl leading-none">
            ✕
          </button>
        </div>
        <div className="modal-body space-y-3">
          {dangGiao ? (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Truong label="Ngày giao thêm">
                  <input
                    type="date"
                    className="input"
                    value={ngayGiao}
                    min={don.ngay_bat_dau}
                    max={don.ngay_tra_du_kien}
                    onChange={(e) => {
                      setNgayGiao(e.target.value);
                      if (ngayBatDauSuDung < e.target.value) setNgayBatDauSuDung(e.target.value);
                    }}
                  />
                </Truong>
                <Truong label="Bắt đầu tính tiền từ">
                  <input
                    type="date"
                    className="input"
                    value={ngayBatDauSuDung}
                    min={ngayGiao > don.ngay_bat_dau_su_dung ? ngayGiao : don.ngay_bat_dau_su_dung}
                    max={don.ngay_ket_thuc_su_dung}
                    onChange={(e) => setNgayBatDauSuDung(e.target.value)}
                  />
                </Truong>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Thiết bị thuê thêm tính tiền từ ngày trên đến {formatNgay(don.ngay_ket_thuc_su_dung)} (ngày kết thúc sử
                dụng của đơn) và chuyển sang &quot;Đang thuê&quot; ngay khi lưu.
              </p>
            </>
          ) : (
            <p className="text-xs text-[var(--text-muted)]">
              Thiết bị thêm vào tính tiền theo ngày sử dụng của đơn ({formatNgay(don.ngay_bat_dau_su_dung)} →{" "}
              {formatNgay(don.ngay_ket_thuc_su_dung)}).
            </p>
          )}

          <input className="input" placeholder="🔍 Tìm tên máy, mã..." value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} />
          <div className="max-h-64 overflow-y-auto rounded-lg border border-[var(--border-color)]">
            {filtered.map((tb) => (
              <label
                key={tb.id}
                className="flex flex-wrap items-center gap-2 border-b border-[var(--border-color)] px-3 py-2.5 text-sm last:border-b-0 hover:bg-[#f8fafc]"
              >
                <input type="checkbox" checked={!!chon[tb.id]} onChange={() => toggleChon(tb)} />
                <span className="flex-1 min-w-[140px]">
                  <span className="font-semibold">{tb.ten}</span>{" "}
                  {tb.ma && <span className="text-[var(--text-muted)] font-mono text-xs">· {tb.ma}</span>}
                  {canhBao[tb.id] && <span className="badge badge-warning ml-2">{canhBao[tb.id]}</span>}
                </span>
                <span className="text-[var(--text-muted)] whitespace-nowrap">{tb.gia_hien_hanh.toLocaleString("vi-VN")}đ/ngày</span>
                {chon[tb.id] && (
                  <ChietKhauInput value={chon[tb.id].chietKhau} onChange={(v) => capNhat(tb.id, { chietKhau: v })} />
                )}
                {chon[tb.id] && tb.nguon_goc === "thue_ngoai" && (
                  <select
                    className="input !w-auto !py-1 text-xs"
                    value={chon[tb.id].tinh_gia_von_theo}
                    onClick={(e) => e.preventDefault()}
                    onChange={(e) => capNhat(tb.id, { tinh_gia_von_theo: e.target.value as CoSoTinhGiaVon })}
                  >
                    {Object.entries(CO_SO_TINH_GIA_VON_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>
                        Giá vốn: {label}
                      </option>
                    ))}
                  </select>
                )}
              </label>
            ))}
            {filtered.length === 0 && <p className="p-3 text-sm text-[var(--text-muted)]">Không tìm thấy thiết bị phù hợp.</p>}
          </div>
          {loi && <p className="badge badge-danger !inline-block">{loi}</p>}
        </div>
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">
            Huỷ
          </button>
          <button type="button" disabled={dangGui} onClick={luu} className="btn-primary">
            {dangGui ? "Đang lưu..." : `Thêm ${Object.keys(chon).length || ""} thiết bị`}
          </button>
        </div>
      </div>
    </div>
  );
}

function Truong({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
      {children}
    </label>
  );
}
