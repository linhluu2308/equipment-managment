"use client";

import { useEffect, useMemo, useState } from "react";
import { listThietBi } from "@/lib/actions/thietBi";
import { taoDonThue, kiemTraTrungLich } from "@/lib/actions/donThue";
import { CO_SO_TINH_GIA_VON_LABEL, type CoSoTinhGiaVon } from "@/lib/types";

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
  phan_tram_chiet_khau: number;
  tinh_gia_von_theo: CoSoTinhGiaVon;
};

export default function NewOrderModal({ onClose }: { onClose: () => void }) {
  const [thietBiList, setThietBiList] = useState<ThietBiOption[]>([]);
  const [tuKhoa, setTuKhoa] = useState("");
  const [danhMuc, setDanhMuc] = useState("Tất cả");
  const [chon, setChon] = useState<Record<string, ChonThietBi>>({});
  const [canhBao, setCanhBao] = useState<Record<string, string>>({});

  const [ten, setTen] = useState("");
  const [sdt, setSdt] = useState("");
  const [nguoiGioiThieu, setNguoiGioiThieu] = useState("");
  const [ngayBatDau, setNgayBatDau] = useState("");
  const [ngayTra, setNgayTra] = useState("");
  const [ngayBatDauSuDung, setNgayBatDauSuDung] = useState("");
  const [ngayKetThucSuDung, setNgayKetThucSuDung] = useState("");
  const [ghiChu, setGhiChu] = useState("");

  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState("");

  useEffect(() => {
    listThietBi().then((data) => setThietBiList(data as unknown as ThietBiOption[]));
  }, []);

  const danhMucs = useMemo(() => {
    const s = new Set(thietBiList.map((t) => t.danh_muc || "Khác"));
    return ["Tất cả", ...Array.from(s)];
  }, [thietBiList]);

  const filtered = thietBiList.filter((t) => {
    const matchTuKhoa =
      !tuKhoa ||
      t.ten.toLowerCase().includes(tuKhoa.toLowerCase()) ||
      (t.ma ?? "").toLowerCase().includes(tuKhoa.toLowerCase());
    const matchDanhMuc = danhMuc === "Tất cả" || (t.danh_muc || "Khác") === danhMuc;
    return matchTuKhoa && matchDanhMuc;
  });

  async function toggleChon(tb: ThietBiOption) {
    setChon((prev) => {
      const next = { ...prev };
      if (next[tb.id]) {
        delete next[tb.id];
      } else {
        next[tb.id] = {
          thiet_bi_id: tb.id,
          gia_thue_chot: tb.gia_hien_hanh,
          phan_tram_chiet_khau: 0,
          tinh_gia_von_theo: "ngay_di_chuyen",
        };
      }
      return next;
    });

    if (!chon[tb.id] && ngayBatDau && ngayTra) {
      const kq = await kiemTraTrungLich(tb.id, ngayBatDau, ngayTra);
      if (kq.tinhTrang !== "trong") {
        setCanhBao((p) => ({
          ...p,
          [tb.id]:
            kq.tinhTrang === "khoa_cung"
              ? `Đã bị giữ bởi đơn khác (${kq.donTrung?.ma_don ?? kq.donTrung?.id})`
              : `Có đơn khác đang hỏi cùng ngày (${kq.donTrung?.ma_don ?? kq.donTrung?.id})`,
        }));
      }
    }
  }

  function capNhatChietKhau(id: string, value: number) {
    setChon((prev) => ({ ...prev, [id]: { ...prev[id], phan_tram_chiet_khau: value } }));
  }

  function capNhatCoSoTinhGiaVon(id: string, value: CoSoTinhGiaVon) {
    setChon((prev) => ({ ...prev, [id]: { ...prev[id], tinh_gia_von_theo: value } }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoi("");
    if (!ten || !sdt) return setLoi("Cần nhập tên và số điện thoại khách hàng.");
    if (!ngayBatDau || !ngayTra) return setLoi("Cần chọn ngày xuất kho và ngày nhập kho dự kiến.");
    if (ngayTra < ngayBatDau) return setLoi("Ngày nhập kho dự kiến không được sớm hơn ngày xuất kho.");
    if (!ngayBatDauSuDung || !ngayKetThucSuDung) {
      return setLoi("Cần chọn ngày bắt đầu và ngày kết thúc sử dụng thực tế.");
    }
    if (ngayBatDauSuDung < ngayBatDau) return setLoi("Ngày bắt đầu sử dụng không thể sớm hơn ngày xuất kho.");
    if (ngayKetThucSuDung < ngayBatDauSuDung) {
      return setLoi("Ngày kết thúc sử dụng không thể sớm hơn ngày bắt đầu sử dụng.");
    }
    if (ngayTra < ngayKetThucSuDung) return setLoi("Ngày nhập kho dự kiến không thể sớm hơn ngày kết thúc sử dụng.");
    if (Object.keys(chon).length === 0) return setLoi("Cần chọn ít nhất một thiết bị.");

    setDangGui(true);
    // Không bọc try/catch quanh lời gọi này: taoDonThue() tự redirect ngay trong
    // Server Action khi thành công, tín hiệu đó không được bắt nhầm thành lỗi ở đây.
    const ketQua = await taoDonThue({
      khachHang: { ten, so_dien_thoai: sdt, nguoi_gioi_thieu: nguoiGioiThieu || undefined },
      ngay_bat_dau: ngayBatDau,
      ngay_tra_du_kien: ngayTra,
      ngay_bat_dau_su_dung: ngayBatDauSuDung,
      ngay_ket_thuc_su_dung: ngayKetThucSuDung,
      ghi_chu: ghiChu || undefined,
      thietBi: Object.values(chon),
    });
    setDangGui(false);
    if (ketQua?.error) setLoi(ketQua.error);
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: "680px" }}>
        <div className="modal-header">
          <div className="modal-title">Tạo đơn thuê mới</div>
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
              <input
                className="input"
                value={nguoiGioiThieu}
                onChange={(e) => setNguoiGioiThieu(e.target.value)}
              />
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
          <p className="text-xs text-[var(--text-muted)] -mt-1">
            Khách có thể lấy sớm/trả muộn hơn ngày thực sự dùng để di chuyển — tổng tiền đơn chỉ tính theo
            dải ngày sử dụng ở trên.
          </p>

          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <input
                className="input max-w-xs"
                placeholder="🔍 Tìm tên máy, mã..."
                value={tuKhoa}
                onChange={(e) => setTuKhoa(e.target.value)}
              />
              <div className="flex flex-wrap gap-1.5">
                {danhMucs.map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setDanhMuc(d)}
                    className={`pill ${danhMuc === d ? "active" : ""}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto rounded-lg border border-[var(--border-color)]">
              {filtered.map((tb) => (
                <label
                  key={tb.id}
                  className="flex flex-wrap items-center gap-2 border-b border-[var(--border-color)] px-3 py-2.5 text-sm last:border-b-0 hover:bg-[#f8fafc]"
                >
                  <input
                    type="checkbox"
                    checked={!!chon[tb.id]}
                    onChange={() => toggleChon(tb)}
                  />
                  <span className="flex-1 min-w-[140px]">
                    <span className="font-semibold">{tb.ten}</span>{" "}
                    {tb.ma && <span className="text-[var(--text-muted)] font-mono text-xs">· {tb.ma}</span>}
                    {canhBao[tb.id] && (
                      <span className="badge badge-warning ml-2">{canhBao[tb.id]}</span>
                    )}
                  </span>
                  <span className="text-[var(--text-muted)] whitespace-nowrap">
                    {tb.gia_hien_hanh.toLocaleString("vi-VN")}đ/ngày
                  </span>
                  {chon[tb.id] && (
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="input !w-20"
                      placeholder="% CK"
                      value={chon[tb.id].phan_tram_chiet_khau}
                      onClick={(e) => e.preventDefault()}
                      onChange={(e) => capNhatChietKhau(tb.id, Number(e.target.value))}
                    />
                  )}
                  {chon[tb.id] && tb.nguon_goc === "thue_ngoai" && (
                    <select
                      className="input !w-auto !py-1 text-xs"
                      title="Cơ sở tính giá vốn/công nợ NCC cho thiết bị thuê ngoài này"
                      value={chon[tb.id].tinh_gia_von_theo}
                      onClick={(e) => e.preventDefault()}
                      onChange={(e) => capNhatCoSoTinhGiaVon(tb.id, e.target.value as CoSoTinhGiaVon)}
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
              {filtered.length === 0 && (
                <p className="p-3 text-sm text-[var(--text-muted)]">Không tìm thấy thiết bị phù hợp.</p>
              )}
            </div>
          </div>

          <Field label="Ghi chú">
            <textarea className="input" rows={2} value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} />
          </Field>

          {loi && <p className="badge badge-danger !inline-block">{loi}</p>}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">
            Huỷ
          </button>
          <button type="submit" disabled={dangGui} className="btn-primary">
            {dangGui ? "Đang tạo..." : "Tạo đơn"}
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
