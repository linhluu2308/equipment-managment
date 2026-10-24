"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useVai } from "@/lib/auth-context";
import { chuyenChangDon, xoaDonThue, khoiPhucDonThue } from "@/lib/actions/donThue";
import { ghiThanhToan } from "@/lib/actions/thanhToan";
import { ghiChiPhi } from "@/lib/actions/chiPhi";
import { themCocGiayTo, hoanTraGiayTo } from "@/lib/actions/cocGiayTo";
import { ghiKiemTraTinhTrang } from "@/lib/actions/kiemTra";
import { capNhatNgayTraThucTeDong, apDungNgayTraThucTeChoTatCa } from "@/lib/actions/donThue";
import { LOAI_THANH_TOAN_LABEL, type ChangDon, type DonThueDetail, type LoaiThanhToan, type TinhTrangThietBi } from "@/lib/types";
import { formatNgay } from "@/lib/formatDate";
import { congNoConLai } from "@/lib/calculations";
import MoneyInput from "@/components/MoneyInput";
import EditOrderModal from "./EditOrderModal";
import OrderLyDoModal from "./OrderLyDoModal";

type DonChiTiet = {
  id: string;
  thiet_bi_id: string;
  ngay_tra_thuc_te: string | null;
  thiet_bi: { ten: string } | null;
};

export default function OrderActions({ don }: { don: DonThueDetail }) {
  const router = useRouter();
  const { vai } = useVai();
  const [pending, start] = useTransition();
  const [loi, setLoi] = useState("");

  function chuyenChang(changMoi: ChangDon) {
    setLoi("");
    start(async () => {
      const res = await chuyenChangDon(don.id, changMoi);
      if (res.error) {
        setLoi(res.error);
        return;
      }
      router.refresh();
    });
  }

  const congNo = Math.round(congNoConLai(don.don_thue_chi_tiet, don, don.chi_phi, don.thanh_toan));
  const choPhepChuyenChang = !don.da_xoa && don.chang !== "xong" && don.chang !== "huy";
  const hienFormTaiChinh = !don.da_xoa && (don.chang === "bao_gia" || don.chang === "da_giao" || don.chang === "cho_tra");

  // Đơn đã Xong/Huỷ và không phải vai chu thì không có gì để làm ở đây.
  if (!choPhepChuyenChang && !hienFormTaiChinh && vai !== "chu") return null;

  return (
    <section className="card space-y-4">
      <div className="card-title !mb-0">Thao tác</div>
      {loi && <p className="badge badge-danger !inline-block">{loi}</p>}

      {choPhepChuyenChang && (
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
            <>
              <ActionButton onClick={() => chuyenChang("xong")} pending={pending} disabled={congNo !== 0}>
                Chốt công nợ & Hoàn tất
              </ActionButton>
              {congNo !== 0 && (
                <span className="self-center text-xs text-[var(--text-muted)]">
                  {congNo > 0
                    ? `Còn phải thu ${congNo.toLocaleString("vi-VN")}đ — thu đủ mới hoàn tất được.`
                    : `Khách trả dư ${(-congNo).toLocaleString("vi-VN")}đ — ghi nhận hoàn cọc trước khi hoàn tất.`}
                </span>
              )}
            </>
          )}
        </div>
      )}

      {hienFormTaiChinh && (
        <div className="grid gap-4 border-t border-[var(--border-color)] pt-4 md:grid-cols-2">
          <ThanhToanForm donId={don.id} congNo={congNo} />
          <ChiPhiForm donId={don.id} chiPhiList={don.chi_phi} />
          <CocGiayToForm donId={don.id} cocList={don.coc_giay_to} />
          {(don.chang === "da_giao" || don.chang === "cho_tra") && (
            <TraThietBiSection don={don} laChu={vai === "chu"} />
          )}
        </div>
      )}

      {vai === "chu" && <ChuActions don={don} />}
    </section>
  );
}

function ChuActions({ don }: { don: DonThueDetail }) {
  const [openSua, setOpenSua] = useState(false);
  const [openXoa, setOpenXoa] = useState(false);
  const [openKhoiPhuc, setOpenKhoiPhuc] = useState(false);

  return (
    <div className="border-t border-[var(--border-color)] pt-4">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
        Quản lý đơn (chủ)
      </h3>
      <div className="flex flex-wrap gap-2">
        {don.da_xoa ? (
          <button className="btn-primary" onClick={() => setOpenKhoiPhuc(true)}>
            🔄 Khôi phục đơn
          </button>
        ) : (
          <>
            <button className="btn-secondary" onClick={() => setOpenSua(true)}>
              ✏️ Sửa đơn
            </button>
            <button className="btn-danger-outline" onClick={() => setOpenXoa(true)}>
              🗑️ Xoá đơn
            </button>
          </>
        )}
      </div>

      {openSua && <EditOrderModal don={don} onClose={() => setOpenSua(false)} />}
      {openXoa && (
        <OrderLyDoModal
          title="Xoá đơn thuê"
          warning={
            don.chang === "xong"
              ? 'Đơn sẽ được đánh dấu "Đã xoá" — ẩn khỏi danh sách và báo cáo nhưng vẫn giữ lại dữ liệu để đối chiếu/khôi phục sau. Đơn này đã ở chặng "Xong" nên công nợ nhà cung cấp đã phát sinh từ đơn sẽ bị xoá theo — khôi phục đơn sẽ tự phát sinh lại.'
              : 'Đơn sẽ được đánh dấu "Đã xoá" — ẩn khỏi danh sách và báo cáo nhưng vẫn giữ lại dữ liệu để đối chiếu/khôi phục sau. Thiết bị của đơn chưa kiểm tra trả (đang ở chỗ khách) sẽ tự chuyển về "Sẵn sàng".'
          }
          confirmLabel="Xoá đơn"
          danger
          action={(lyDo) => xoaDonThue(don.id, lyDo)}
          onClose={() => setOpenXoa(false)}
        />
      )}
      {openKhoiPhuc && (
        <OrderLyDoModal
          title="Khôi phục đơn thuê"
          warning="Đơn sẽ hiện lại trong danh sách và báo cáo như bình thường."
          confirmLabel="Khôi phục đơn"
          action={(lyDo) => khoiPhucDonThue(don.id, lyDo)}
          onClose={() => setOpenKhoiPhuc(false)}
        />
      )}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  pending,
  danger,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  pending: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button disabled={pending || disabled} onClick={onClick} className={danger ? "btn-danger-outline" : "btn-primary"}>
      {pending ? "Đang xử lý..." : children}
    </button>
  );
}

/** Khung chung cho các khối thao tác tài chính, giữ cùng một kiểu hiển thị. */
function KhoiThaoTac({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 rounded-lg border border-[var(--border-color)] bg-[#f8fafc] p-3.5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{title}</h3>
      {children}
    </div>
  );
}

/** Ghi chú ngắn cho khối đã hoàn thành, kèm nút mở lại (nếu có) để thao tác tiếp. */
function GhiChuHoanThanh({
  children,
  moLaiLabel,
  onMoLai,
}: {
  children: React.ReactNode;
  moLaiLabel?: string;
  onMoLai?: () => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-[#15803d]">✓ {children}</p>
      {moLaiLabel && onMoLai && (
        <button type="button" onClick={onMoLai} className="text-xs font-semibold text-[var(--accent-primary)] hover:underline">
          {moLaiLabel}
        </button>
      )}
    </div>
  );
}

/**
 * Khoá khi khách đã thanh toán đủ (công nợ = 0). Công nợ có thể mở lại tự động
 * nếu sau đó ghi thêm chi phí phát sinh. Khách trả dư (công nợ < 0) thì chỉ cho
 * ghi "Hoàn cọc". Server action cũng kiểm tra lại cùng quy tắc.
 */
function ThanhToanForm({ donId, congNo }: { donId: string; congNo: number }) {
  const router = useRouter();
  const traDu = congNo < 0;
  const cacLoai: LoaiThanhToan[] = traDu ? ["hoan_coc"] : ["coc", "dot", "tat_toan"];
  const [soTien, setSoTien] = useState("");
  const [hinhThuc, setHinhThuc] = useState("Chuyển khoản");
  const [loai, setLoai] = useState<LoaiThanhToan>(cacLoai[0]);
  const [loi, setLoi] = useState("");
  const [pending, start] = useTransition();

  // Danh sách loại đổi khi chuyển giữa "còn nợ" và "trả dư" — luôn giữ lựa chọn hợp lệ.
  const loaiHienTai = cacLoai.includes(loai) ? loai : cacLoai[0];

  if (congNo === 0) {
    return (
      <KhoiThaoTac title="Thanh toán">
        <GhiChuHoanThanh>Khách đã thanh toán đủ — đã khoá ghi nhận.</GhiChuHoanThanh>
        <p className="text-xs text-[var(--text-muted)]">Nếu phát sinh thêm chi phí, phần này sẽ tự mở lại.</p>
      </KhoiThaoTac>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!soTien) return;
    setLoi("");
    start(async () => {
      const res = await ghiThanhToan(donId, { so_tien: Number(soTien), hinh_thuc: hinhThuc, loai: loaiHienTai });
      if (res.error) {
        setLoi(res.error);
        return;
      }
      setSoTien("");
      router.refresh();
    });
  }

  function dienSoConLai() {
    setSoTien(String(Math.abs(congNo)));
    if (!traDu) setLoai("tat_toan");
  }

  return (
    <form onSubmit={submit}>
      <KhoiThaoTac title={traDu ? "Hoàn tiền dư cho khách" : "Ghi nhận thanh toán"}>
        <p className="text-sm">
          {traDu ? "Khách trả dư: " : "Còn phải thu: "}
          <span className="font-bold" style={{ color: traDu ? "var(--text-main)" : "#dc2626" }}>
            {Math.abs(congNo).toLocaleString("vi-VN")}đ
          </span>{" "}
          <button type="button" onClick={dienSoConLai} className="text-xs font-semibold text-[var(--accent-primary)] hover:underline">
            {traDu ? "(điền số cần hoàn)" : "(điền đủ số còn lại)"}
          </button>
        </p>
        {loi && <p className="badge badge-danger !inline-block">{loi}</p>}
        <div className="flex gap-2">
          <MoneyInput placeholder="Số tiền" value={soTien} onChange={setSoTien} />
          <select className="input" value={loaiHienTai} onChange={(e) => setLoai(e.target.value as LoaiThanhToan)}>
            {cacLoai.map((l) => (
              <option key={l} value={l}>
                {LOAI_THANH_TOAN_LABEL[l]}
              </option>
            ))}
          </select>
        </div>
        <select className="input" value={hinhThuc} onChange={(e) => setHinhThuc(e.target.value)}>
          <option>Chuyển khoản</option>
          <option>Tiền mặt</option>
        </select>
        <button disabled={pending} className="btn-primary w-full">
          {pending ? "Đang lưu..." : traDu ? "Ghi nhận hoàn cọc" : "Ghi nhận"}
        </button>
      </KhoiThaoTac>
    </form>
  );
}

/** Thu gọn mặc định: chỉ hiện tóm tắt các khoản đã ghi, bấm mới mở form thêm. */
function ChiPhiForm({ donId, chiPhiList }: { donId: string; chiPhiList: { so_tien: number }[] }) {
  const router = useRouter();
  const [mo, setMo] = useState(false);
  const [loai, setLoai] = useState("Vận chuyển");
  const [moTa, setMoTa] = useState("");
  const [soTien, setSoTien] = useState("");
  const [pending, start] = useTransition();

  const tongChiPhi = chiPhiList.reduce((s, c) => s + c.so_tien, 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!soTien) return;
    start(async () => {
      await ghiChiPhi(donId, { loai, mo_ta: moTa, so_tien: Number(soTien) });
      setSoTien("");
      setMoTa("");
      setMo(false);
      router.refresh();
    });
  }

  if (!mo) {
    return (
      <KhoiThaoTac title="Chi phí phát sinh">
        <p className="text-sm text-[var(--text-muted)]">
          {chiPhiList.length > 0
            ? `Đã ghi ${chiPhiList.length} khoản · ${tongChiPhi.toLocaleString("vi-VN")}đ (xem ở mục Tài chính)`
            : "Chưa có chi phí phát sinh."}
        </p>
        <button type="button" className="btn-secondary w-full" onClick={() => setMo(true)}>
          + Thêm chi phí phát sinh
        </button>
      </KhoiThaoTac>
    );
  }

  return (
    <form onSubmit={submit}>
      <KhoiThaoTac title="Thêm chi phí phát sinh">
        <select className="input" value={loai} onChange={(e) => setLoai(e.target.value)}>
          <option>Vận chuyển</option>
          <option>Bồi thường hư hại</option>
          <option>Phụ phí</option>
        </select>
        <input className="input" placeholder="Mô tả" value={moTa} onChange={(e) => setMoTa(e.target.value)} />
        <MoneyInput placeholder="Số tiền" value={soTien} onChange={setSoTien} />
        <div className="flex gap-2">
          <button type="button" className="btn-secondary flex-1" onClick={() => setMo(false)}>
            Đóng
          </button>
          <button disabled={pending} className="btn-primary flex-1">
            {pending ? "Đang lưu..." : "Thêm chi phí"}
          </button>
        </div>
      </KhoiThaoTac>
    </form>
  );
}

/**
 * Khi mọi giấy tờ cọc đã hoàn trả: ẩn form, chỉ còn ghi chú + link mở lại nếu cần
 * nhận thêm giấy tờ. Đang giữ giấy tờ nào thì hiện nút hoàn trả theo đúng tên giấy tờ.
 */
function CocGiayToForm({
  donId,
  cocList,
}: {
  donId: string;
  cocList: { id: string; trang_thai: string; loai_giay_to: string; so_hieu: string | null }[];
}) {
  const router = useRouter();
  const [loaiGiayTo, setLoaiGiayTo] = useState("CCCD");
  const [soHieu, setSoHieu] = useState("");
  const [moThem, setMoThem] = useState(false);
  const [pending, start] = useTransition();

  const dangGiu = cocList.filter((c) => c.trang_thai === "dang_giu");
  const daHoanTraHet = cocList.length > 0 && dangGiu.length === 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      await themCocGiayTo(donId, { loai_giay_to: loaiGiayTo, so_hieu: soHieu });
      setSoHieu("");
      setMoThem(false);
      router.refresh();
    });
  }

  function hoanTra(id: string) {
    start(async () => {
      await hoanTraGiayTo(id, donId);
      router.refresh();
    });
  }

  if (daHoanTraHet && !moThem) {
    return (
      <KhoiThaoTac title="Cọc giấy tờ">
        <GhiChuHoanThanh moLaiLabel="+ Nhận thêm giấy tờ cọc" onMoLai={() => setMoThem(true)}>
          Đã hoàn trả đủ {cocList.length} giấy tờ cho khách.
        </GhiChuHoanThanh>
      </KhoiThaoTac>
    );
  }

  return (
    <form onSubmit={submit}>
      <KhoiThaoTac title="Cọc giấy tờ">
        {dangGiu.length > 0 && (
          <div className="space-y-1 pb-1">
            <p className="text-xs text-[var(--text-muted)]">
              Đang giữ {dangGiu.length} giấy tờ — bấm khi đã trả lại khách:
            </p>
            {dangGiu.map((c) => (
              <button
                type="button"
                key={c.id}
                disabled={pending}
                onClick={() => hoanTra(c.id)}
                className="w-full rounded-lg border border-[var(--border-color)] bg-white py-1.5 text-xs font-semibold text-[var(--text-main)] hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ↩ Đã trả {c.loai_giay_to}
                {c.so_hieu ? ` · ${c.so_hieu}` : ""}
              </button>
            ))}
          </div>
        )}
        <select className="input" value={loaiGiayTo} onChange={(e) => setLoaiGiayTo(e.target.value)}>
          <option>CCCD</option>
          <option>Bằng lái xe</option>
          <option>Cà vẹt xe</option>
          <option>Passport</option>
          <option>Khác</option>
        </select>
        <input className="input" placeholder="Số hiệu" value={soHieu} onChange={(e) => setSoHieu(e.target.value)} />
        <div className="flex gap-2">
          {moThem && (
            <button type="button" className="btn-secondary flex-1" onClick={() => setMoThem(false)}>
              Đóng
            </button>
          )}
          <button disabled={pending} className="btn-primary flex-1">
            {pending ? "Đang lưu..." : "Thêm giấy tờ cọc"}
          </button>
        </div>
      </KhoiThaoTac>
    </form>
  );
}

const TINH_TRANG_LABEL: Record<TinhTrangThietBi, string> = { tot: "Tốt", tray_xuoc: "Trầy xước", hong: "Hỏng hóc" };

/**
 * Ngày trả thực tế + Biên bản kiểm tra khi trả. Khi mọi thiết bị đã có biên bản thì
 * thu gọn thành ghi chú (thiết bị đã về kho, server nhả lịch ngay lúc ghi biên bản);
 * chỉ chủ thấy nút "Sửa biên bản" để mở lại — server cũng chặn người khác sửa.
 */
function TraThietBiSection({ don, laChu }: { don: DonThueDetail; laChu: boolean }) {
  const [moLai, setMoLai] = useState(false);
  const daKiem = new Map(don.kiem_tra_tinh_trang.map((k) => [k.thiet_bi_id, k.tinh_trang]));
  const daDu = don.don_thue_chi_tiet.length > 0 && don.don_thue_chi_tiet.every((l) => daKiem.has(l.thiet_bi_id));

  if (daDu && !moLai) {
    const dem = new Map<TinhTrangThietBi, number>();
    for (const t of daKiem.values()) dem.set(t, (dem.get(t) ?? 0) + 1);
    const tomTat =
      dem.size === 1 && dem.has("tot")
        ? "tất cả Tốt"
        : [...dem.entries()].map(([t, n]) => `${n} ${TINH_TRANG_LABEL[t]}`).join(", ");
    return (
      <div className="md:col-span-2">
        <KhoiThaoTac title="Trả thiết bị & biên bản kiểm tra">
          <GhiChuHoanThanh moLaiLabel={laChu ? "✏️ Sửa biên bản / ngày trả (chủ)" : undefined} onMoLai={() => setMoLai(true)}>
            Đã kiểm tra đủ {don.don_thue_chi_tiet.length} thiết bị — {tomTat}. Thiết bị đã về kho.
          </GhiChuHoanThanh>
        </KhoiThaoTac>
      </div>
    );
  }

  return (
    <>
      {moLai && (
        <div className="flex items-center justify-between md:col-span-2">
          <span className="text-xs font-semibold text-[var(--text-muted)]">Đang sửa biên bản (chủ)</span>
          <button type="button" className="btn-secondary !py-1" onClick={() => setMoLai(false)}>
            Đóng
          </button>
        </div>
      )}
      <NgayTraThucTeForm
        donId={don.id}
        ngayBatDau={don.ngay_bat_dau}
        ngayTraDuKien={don.ngay_tra_du_kien}
        chiTiet={don.don_thue_chi_tiet}
      />
      <KiemTraForm donId={don.id} chiTiet={don.don_thue_chi_tiet} daKiem={daKiem} />
    </>
  );
}

function NgayTraThucTeForm({
  donId,
  ngayBatDau,
  ngayTraDuKien,
  chiTiet,
}: {
  donId: string;
  ngayBatDau: string;
  ngayTraDuKien: string;
  chiTiet: DonChiTiet[];
}) {
  const router = useRouter();
  const [ngayApDungTatCa, setNgayApDungTatCa] = useState(ngayTraDuKien);
  const [pendingTatCa, startTatCa] = useTransition();
  const [loi, setLoi] = useState("");

  function apDungTatCa() {
    setLoi("");
    startTatCa(async () => {
      const res = await apDungNgayTraThucTeChoTatCa(donId, ngayApDungTatCa);
      if (res.error) {
        setLoi(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2 rounded-lg border border-[var(--border-color)] bg-[#f8fafc] p-3.5 md:col-span-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
        Ngày trả thực tế (mặc định theo ngày trả dự kiến {formatNgay(ngayTraDuKien)} — chỉnh nếu thiết bị trả sớm/trễ hơn)
      </h3>
      {loi && <p className="badge badge-danger !inline-block">{loi}</p>}

      <div className="flex flex-wrap items-end gap-2">
        <input
          className="input !w-auto"
          type="date"
          min={ngayBatDau}
          value={ngayApDungTatCa}
          onChange={(e) => setNgayApDungTatCa(e.target.value)}
        />
        <button type="button" disabled={pendingTatCa} className="btn-secondary" onClick={apDungTatCa}>
          {pendingTatCa ? "Đang lưu..." : "Áp dụng cho tất cả thiết bị"}
        </button>
      </div>

      <ul className="divide-y divide-[var(--border-color)] text-sm">
        {chiTiet.map((l) => (
          <NgayTraThucTeDong key={l.thiet_bi_id} donId={donId} ngayBatDau={ngayBatDau} line={l} />
        ))}
      </ul>
    </div>
  );
}

function NgayTraThucTeDong({
  donId,
  ngayBatDau,
  line,
}: {
  donId: string;
  ngayBatDau: string;
  line: DonChiTiet;
}) {
  const router = useRouter();
  const [ngay, setNgay] = useState(line.ngay_tra_thuc_te ?? "");
  const [pending, start] = useTransition();
  const [loi, setLoi] = useState("");

  function luu() {
    if (!ngay) return;
    setLoi("");
    start(async () => {
      const res = await capNhatNgayTraThucTeDong(donId, line.thiet_bi_id, ngay);
      if (res.error) {
        setLoi(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 py-1.5">
      <span>{line.thiet_bi?.ten}</span>
      <span className="flex items-center gap-1.5">
        <input className="input !w-auto !py-1" type="date" min={ngayBatDau} value={ngay} onChange={(e) => setNgay(e.target.value)} />
        <button type="button" disabled={pending || !ngay} className="btn-secondary !py-1" onClick={luu}>
          {pending ? "..." : "Lưu"}
        </button>
        {loi && <span className="badge badge-danger">{loi}</span>}
      </span>
    </li>
  );
}

function KiemTraForm({
  donId,
  chiTiet,
  daKiem,
}: {
  donId: string;
  chiTiet: DonChiTiet[];
  daKiem: Map<string, TinhTrangThietBi>;
}) {
  const router = useRouter();
  const chuaKiemDauTien = chiTiet.find((l) => !daKiem.has(l.thiet_bi_id))?.thiet_bi_id;
  const [thietBiId, setThietBiId] = useState(chuaKiemDauTien ?? chiTiet[0]?.thiet_bi_id ?? "");
  const [tinhTrang, setTinhTrang] = useState<TinhTrangThietBi>("tot");
  const [nguoiKiem, setNguoiKiem] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [loi, setLoi] = useState("");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!thietBiId) return;
    setLoi("");
    start(async () => {
      const res = await ghiKiemTraTinhTrang(donId, {
        thiet_bi_id: thietBiId,
        tinh_trang: tinhTrang,
        nguoi_kiem: nguoiKiem,
        ghi_chu: ghiChu,
      });
      if (res.error) {
        setLoi(res.error);
        return;
      }
      setGhiChu("");
      // Tự chuyển sang thiết bị kế tiếp chưa kiểm tra cho đỡ phải chọn lại.
      const keTiep = chiTiet.find((l) => l.thiet_bi_id !== thietBiId && !daKiem.has(l.thiet_bi_id));
      if (keTiep) setThietBiId(keTiep.thiet_bi_id);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-lg border border-[var(--border-color)] bg-[#f8fafc] p-3.5 md:col-span-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
        Biên bản kiểm tra thiết bị khi trả ({daKiem.size}/{chiTiet.length} đã kiểm tra)
      </h3>
      {loi && <p className="badge badge-danger !inline-block">{loi}</p>}
      <div className="grid grid-cols-3 gap-2">
        <select className="input" value={thietBiId} onChange={(e) => setThietBiId(e.target.value)}>
          {chiTiet.map((l) => {
            const kq = daKiem.get(l.thiet_bi_id);
            return (
              <option key={l.thiet_bi_id} value={l.thiet_bi_id}>
                {kq ? "✓ " : ""}
                {l.thiet_bi?.ten}
                {kq ? ` (${TINH_TRANG_LABEL[kq]})` : ""}
              </option>
            );
          })}
        </select>
        <select className="input" value={tinhTrang} onChange={(e) => setTinhTrang(e.target.value as TinhTrangThietBi)}>
          <option value="tot">Tốt</option>
          <option value="tray_xuoc">Trầy xước</option>
          <option value="hong">Hỏng hóc</option>
        </select>
        <input className="input" placeholder="Người kiểm" value={nguoiKiem} onChange={(e) => setNguoiKiem(e.target.value)} />
      </div>
      <input className="input" placeholder="Ghi chú" value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} />
      <p className="text-xs text-[var(--text-muted)]">
        Lưu xong thiết bị về kho ngay: Tốt/Trầy xước → Sẵn sàng, Hỏng hóc → Hỏng.
      </p>
      <button disabled={pending} className="btn-primary w-full">
        {pending ? "Đang lưu..." : "Lưu kiểm tra"}
      </button>
    </form>
  );
}
