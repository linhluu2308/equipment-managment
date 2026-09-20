import Link from "next/link";
import { notFound } from "next/navigation";
import { getThietBi } from "@/lib/actions/thietBi";
import { TRANG_THAI_THIET_BI_BADGE, TRANG_THAI_THIET_BI_LABEL, type TrangThaiThietBi } from "@/lib/types";
import { soNgayThue, thanhTienDong, loiNhuanThietBi } from "@/lib/calculations";

export const dynamic = "force-dynamic";

const TINH_TRANG_LABEL: Record<string, string> = {
  tot: "Tốt",
  tray_xuoc: "Trầy xước",
  hong: "Hỏng hóc",
};
const TINH_TRANG_BADGE: Record<string, string> = {
  tot: "badge-success",
  tray_xuoc: "badge-warning",
  hong: "badge-danger",
};

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getThietBi(id).catch(() => null);
  if (!data || !data.thietBi) notFound();
  const { thietBi, lichSuGia, donHang, kiemTra } = data;

  const giaHienHanh = lichSuGia[0]?.gia_thue ?? 0;

  const donXong = donHang.filter((d) => d.don_thue?.chang === "xong");
  const doanhThu = donXong.reduce((sum, d) => {
    const soNgay = soNgayThue(d.don_thue.ngay_bat_dau, d.don_thue.ngay_tra_du_kien);
    return sum + thanhTienDong(d, soNgay);
  }, 0);
  const giaVonTong = thietBi.gia_von ? thietBi.gia_von * donXong.length : 0;
  const loiNhuan = loiNhuanThietBi({ doanhThu, giaVon: giaVonTong, chiPhiKhac: 0 });

  return (
    <div className="max-w-3xl w-full space-y-5">
      <Link href="/equipment" className="text-sm font-semibold text-[var(--accent-primary)] hover:underline">
        ← Danh mục thiết bị
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold">{thietBi.ten}</h1>
          <p className="text-sm text-[var(--text-muted)] font-mono">
            {thietBi.ma && `${thietBi.ma} · `}
            {thietBi.danh_muc || "Chưa phân loại"}
          </p>
        </div>
        <span className={`badge ${TRANG_THAI_THIET_BI_BADGE[thietBi.trang_thai as TrangThaiThietBi]}`}>
          {TRANG_THAI_THIET_BI_LABEL[thietBi.trang_thai as TrangThaiThietBi]}
        </span>
      </div>

      <section className="card">
        <div className="card-title">Thông tin & giá</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">
              Giá thuê hiện hành
            </div>
            <div className="text-sm sm:text-lg font-extrabold">{giaHienHanh.toLocaleString("vi-VN")}đ/ngày</div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">
              Nguồn gốc
            </div>
            <div>{thietBi.nguon_goc === "so_huu" ? "Tự sở hữu" : `Thuê ngoài · ${thietBi.nha_cung_cap ?? "—"}`}</div>
          </div>
          {thietBi.nguon_goc === "thue_ngoai" && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">
                Giá vốn
              </div>
              <div>{(thietBi.gia_von ?? 0).toLocaleString("vi-VN")}đ</div>
            </div>
          )}
        </div>
        {thietBi.mo_ta && <p className="text-sm text-[var(--text-muted)] mb-3">{thietBi.mo_ta}</p>}

        <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Lịch sử thay đổi giá
        </h3>
        <ul className="text-sm divide-y divide-[var(--border-color)]">
          {lichSuGia.map((g) => (
            <li key={g.id} className="flex justify-between py-1.5">
              <span>{g.ngay_ap_dung}</span>
              <span className="font-semibold">{g.gia_thue.toLocaleString("vi-VN")}đ/ngày</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <div className="card-title">Lịch sử cho thuê</div>
        <ul className="text-sm divide-y divide-[var(--border-color)]">
          {donHang.map((d) => (
            <li key={d.id} className="flex justify-between py-1.5">
              <Link href={`/orders/${d.don_thue.id}`} className="font-semibold text-[var(--accent-primary)] hover:underline">
                {d.don_thue.khach_hang?.ten} · {d.don_thue.ngay_bat_dau} → {d.don_thue.ngay_tra_du_kien}
              </Link>
              <span className="text-[var(--text-muted)]">{d.don_thue.chang}</span>
            </li>
          ))}
          {donHang.length === 0 && <li className="py-1.5 text-[var(--text-muted)]">Chưa từng được cho thuê.</li>}
        </ul>
      </section>

      <section className="card">
        <div className="card-title">Lịch sử kiểm tra tình trạng</div>
        <ul className="text-sm divide-y divide-[var(--border-color)]">
          {kiemTra.map((k) => (
            <li key={k.id} className="flex justify-between items-center py-1.5">
              <span>
                {k.ngay_tra} {k.nguoi_kiem && `· ${k.nguoi_kiem}`}
              </span>
              <span className={`badge ${TINH_TRANG_BADGE[k.tinh_trang]}`}>{TINH_TRANG_LABEL[k.tinh_trang]}</span>
            </li>
          ))}
          {kiemTra.length === 0 && <li className="py-1.5 text-[var(--text-muted)]">Chưa có lần kiểm tra nào.</li>}
        </ul>
      </section>

      <section className="card">
        <div className="card-title">Hiệu quả sinh lời</div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">
              Doanh thu lũy kế
            </div>
            <div className="text-sm sm:text-lg font-extrabold">{doanhThu.toLocaleString("vi-VN")}đ</div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">
              Giá vốn
            </div>
            <div className="text-sm sm:text-lg font-extrabold">{giaVonTong.toLocaleString("vi-VN")}đ</div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">
              Lợi nhuận ròng
            </div>
            <div className="text-sm sm:text-lg font-extrabold" style={{ color: "#16a34a" }}>
              {loiNhuan.toLocaleString("vi-VN")}đ
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Tính trên các đơn đã ở chặng &quot;Xong&quot;. Chi phí phát sinh theo đơn (vận chuyển, bồi thường...) chưa
          phân bổ theo từng thiết bị trong vòng đầu.
        </p>
      </section>
    </div>
  );
}
