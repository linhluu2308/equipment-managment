"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { chuyenChangDon } from "@/lib/actions/donThue";
import { ghiThanhToan } from "@/lib/actions/thanhToan";
import { ghiChiPhi } from "@/lib/actions/chiPhi";
import { themCocGiayTo, hoanTraGiayTo } from "@/lib/actions/cocGiayTo";
import { ghiKiemTraTinhTrang } from "@/lib/actions/kiemTra";
import type { ChangDon, LoaiThanhToan, TinhTrangThietBi } from "@/lib/types";

type DonChiTiet = { id: string; thiet_bi_id: string; thiet_bi: { ten: string } | null };
type DonForActions = {
  id: string;
  chang: ChangDon;
  don_thue_chi_tiet: DonChiTiet[];
  coc_giay_to: { id: string; trang_thai: string }[];
};

export default function OrderActions({ don }: { don: DonForActions }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [loi, setLoi] = useState("");

  function chuyenChang(changMoi: ChangDon) {
    setLoi("");
    start(async () => {
      try {
        await chuyenChangDon(don.id, changMoi);
        router.refresh();
      } catch (err) {
        setLoi((err as Error).message);
      }
    });
  }

  if (don.chang === "xong" || don.chang === "huy") {
    return null;
  }

  return (
    <section className="card space-y-4">
      <div className="card-title !mb-0">Thao tác</div>
      {loi && <p className="badge badge-danger !inline-block">{loi}</p>}

      <div className="flex flex-wrap gap-2">
        {don.chang === "yeu_cau" && (
          <>
            <ActionButton onClick={() => chuyenChang("bao_gia")} pending={pending}>
              Lập báo giá
            </ActionButton>
            <ActionButton onClick={() => chuyenChang("huy")} pending={pending} danger>
              Từ chối / Huỷ đơn
            </ActionButton>
          </>
        )}
        {don.chang === "bao_gia" && (
          <>
            <ActionButton onClick={() => chuyenChang("da_giao")} pending={pending}>
              Xác nhận giao thiết bị
            </ActionButton>
            <ActionButton onClick={() => chuyenChang("huy")} pending={pending} danger>
              Huỷ đơn
            </ActionButton>
          </>
        )}
        {don.chang === "da_giao" && (
          <ActionButton onClick={() => chuyenChang("cho_tra")} pending={pending}>
            Nhận thiết bị về kho
          </ActionButton>
        )}
        {don.chang === "cho_tra" && (
          <ActionButton onClick={() => chuyenChang("xong")} pending={pending}>
            Chốt công nợ & Hoàn tất
          </ActionButton>
        )}
      </div>

      {don.chang !== "yeu_cau" && (
        <div className="grid gap-4 border-t border-[var(--border-color)] pt-4 md:grid-cols-2">
          <ThanhToanForm donId={don.id} />
          <ChiPhiForm donId={don.id} />
          <CocGiayToForm donId={don.id} cocList={don.coc_giay_to} />
          {(don.chang === "da_giao" || don.chang === "cho_tra") && (
            <KiemTraForm donId={don.id} chiTiet={don.don_thue_chi_tiet} />
          )}
        </div>
      )}
    </section>
  );
}

function ActionButton({
  children,
  onClick,
  pending,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  pending: boolean;
  danger?: boolean;
}) {
  return (
    <button disabled={pending} onClick={onClick} className={danger ? "btn-danger-outline" : "btn-primary"}>
      {pending ? "Đang xử lý..." : children}
    </button>
  );
}

function ThanhToanForm({ donId }: { donId: string }) {
  const router = useRouter();
  const [soTien, setSoTien] = useState("");
  const [hinhThuc, setHinhThuc] = useState("Chuyển khoản");
  const [loai, setLoai] = useState<LoaiThanhToan>("coc");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!soTien) return;
    start(async () => {
      await ghiThanhToan(donId, { so_tien: Number(soTien), hinh_thuc: hinhThuc, loai });
      setSoTien("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-lg border border-[var(--border-color)] bg-[#f8fafc] p-3.5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Ghi nhận thanh toán</h3>
      <div className="flex gap-2">
        <input
          className="input"
          type="number"
          placeholder="Số tiền"
          value={soTien}
          onChange={(e) => setSoTien(e.target.value)}
        />
        <select className="input" value={loai} onChange={(e) => setLoai(e.target.value as LoaiThanhToan)}>
          <option value="coc">Cọc tiền</option>
          <option value="dot">Thanh toán đợt</option>
          <option value="tat_toan">Tất toán</option>
          <option value="hoan_coc">Hoàn cọc</option>
        </select>
      </div>
      <select className="input" value={hinhThuc} onChange={(e) => setHinhThuc(e.target.value)}>
        <option>Chuyển khoản</option>
        <option>Tiền mặt</option>
      </select>
      <button disabled={pending} className="btn-primary w-full">
        {pending ? "Đang lưu..." : "Ghi nhận"}
      </button>
    </form>
  );
}

function ChiPhiForm({ donId }: { donId: string }) {
  const router = useRouter();
  const [loai, setLoai] = useState("Vận chuyển");
  const [moTa, setMoTa] = useState("");
  const [soTien, setSoTien] = useState("");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!soTien) return;
    start(async () => {
      await ghiChiPhi(donId, { loai, mo_ta: moTa, so_tien: Number(soTien) });
      setSoTien("");
      setMoTa("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-lg border border-[var(--border-color)] bg-[#f8fafc] p-3.5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Chi phí phát sinh</h3>
      <select className="input" value={loai} onChange={(e) => setLoai(e.target.value)}>
        <option>Vận chuyển</option>
        <option>Bồi thường hư hại</option>
        <option>Phụ phí</option>
      </select>
      <input className="input" placeholder="Mô tả" value={moTa} onChange={(e) => setMoTa(e.target.value)} />
      <input
        className="input"
        type="number"
        placeholder="Số tiền"
        value={soTien}
        onChange={(e) => setSoTien(e.target.value)}
      />
      <button disabled={pending} className="btn-primary w-full">
        {pending ? "Đang lưu..." : "Thêm chi phí"}
      </button>
    </form>
  );
}

function CocGiayToForm({
  donId,
  cocList,
}: {
  donId: string;
  cocList: { id: string; trang_thai: string }[];
}) {
  const router = useRouter();
  const [loaiGiayTo, setLoaiGiayTo] = useState("CCCD");
  const [soHieu, setSoHieu] = useState("");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      await themCocGiayTo(donId, { loai_giay_to: loaiGiayTo, so_hieu: soHieu });
      setSoHieu("");
      router.refresh();
    });
  }

  function hoanTra(id: string) {
    start(async () => {
      await hoanTraGiayTo(id, donId);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-lg border border-[var(--border-color)] bg-[#f8fafc] p-3.5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Cọc giấy tờ</h3>
      <select className="input" value={loaiGiayTo} onChange={(e) => setLoaiGiayTo(e.target.value)}>
        <option>CCCD</option>
        <option>Bằng lái xe</option>
        <option>Cà vẹt xe</option>
        <option>Passport</option>
        <option>Khác</option>
      </select>
      <input className="input" placeholder="Số hiệu" value={soHieu} onChange={(e) => setSoHieu(e.target.value)} />
      <button disabled={pending} className="btn-primary w-full">
        {pending ? "Đang lưu..." : "Thêm giấy tờ cọc"}
      </button>
      {cocList.filter((c) => c.trang_thai === "dang_giu").length > 0 && (
        <div className="space-y-1 pt-1">
          {cocList
            .filter((c) => c.trang_thai === "dang_giu")
            .map((c) => (
              <button
                type="button"
                key={c.id}
                disabled={pending}
                onClick={() => hoanTra(c.id)}
                className="w-full rounded-lg border border-[var(--border-color)] bg-white py-1.5 text-xs font-semibold text-[var(--text-main)] hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Đánh dấu đã hoàn trả giấy tờ (mã {c.id.slice(0, 6)})
              </button>
            ))}
        </div>
      )}
    </form>
  );
}

function KiemTraForm({ donId, chiTiet }: { donId: string; chiTiet: DonChiTiet[] }) {
  const router = useRouter();
  const [thietBiId, setThietBiId] = useState(chiTiet[0]?.thiet_bi_id ?? "");
  const [tinhTrang, setTinhTrang] = useState<TinhTrangThietBi>("tot");
  const [nguoiKiem, setNguoiKiem] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!thietBiId) return;
    start(async () => {
      await ghiKiemTraTinhTrang(donId, { thiet_bi_id: thietBiId, tinh_trang: tinhTrang, nguoi_kiem: nguoiKiem, ghi_chu: ghiChu });
      setGhiChu("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-lg border border-[var(--border-color)] bg-[#f8fafc] p-3.5 md:col-span-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Biên bản kiểm tra thiết bị khi trả</h3>
      <div className="grid grid-cols-3 gap-2">
        <select className="input" value={thietBiId} onChange={(e) => setThietBiId(e.target.value)}>
          {chiTiet.map((l) => (
            <option key={l.thiet_bi_id} value={l.thiet_bi_id}>
              {l.thiet_bi?.ten}
            </option>
          ))}
        </select>
        <select className="input" value={tinhTrang} onChange={(e) => setTinhTrang(e.target.value as TinhTrangThietBi)}>
          <option value="tot">Tốt</option>
          <option value="tray_xuoc">Trầy xước</option>
          <option value="hong">Hỏng hóc</option>
        </select>
        <input className="input" placeholder="Người kiểm" value={nguoiKiem} onChange={(e) => setNguoiKiem(e.target.value)} />
      </div>
      <input className="input" placeholder="Ghi chú" value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} />
      <button disabled={pending} className="btn-primary w-full">
        {pending ? "Đang lưu..." : "Lưu kiểm tra"}
      </button>
    </form>
  );
}
