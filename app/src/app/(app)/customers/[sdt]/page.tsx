import Link from "next/link";
import { notFound } from "next/navigation";
import { layKhachHangTheoSdt } from "@/lib/queries/khachHang";
import { CHANG_BADGE, CHANG_LABEL, type ChangDon } from "@/lib/types";
import { formatNgay } from "@/lib/formatDate";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: Promise<{ sdt: string }> }) {
  const { sdt } = await params;
  const khachHang = await layKhachHangTheoSdt(sdt);
  if (!khachHang) notFound();

  return (
    <div className="max-w-3xl w-full space-y-5">
      <Link href="/customers" className="text-sm font-semibold text-[var(--accent-primary)] hover:underline">
        ← Danh sách khách hàng
      </Link>

      <div>
        <h1 className="text-xl font-extrabold">{khachHang.ten}</h1>
        <p className="text-sm text-[var(--text-muted)] font-mono">
          {khachHang.soDienThoai}
          {khachHang.nguoiGioiThieu && ` · Người giới thiệu: ${khachHang.nguoiGioiThieu}`}
        </p>
      </div>

      <section className="card">
        <div className="card-title !mb-0">Công nợ</div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Stat label="Tổng chi tiêu" value={khachHang.tongChiTieu} />
          <Stat label="Đã thu" value={khachHang.daThu} />
          <Stat label="Còn nợ" value={khachHang.conNo} highlight={khachHang.conNo > 0} />
        </div>
      </section>

      <section className="card">
        <div className="card-title">Lịch sử đơn hàng ({khachHang.soDon})</div>
        <div className="table-container" style={{ border: "none", boxShadow: "none" }}>
          <table>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Dải ngày thuê</th>
                <th>Chặng</th>
                <th>Tổng tiền</th>
                <th>Đã thu</th>
                <th>Công nợ</th>
              </tr>
            </thead>
            <tbody>
              {khachHang.donList.map((d) => (
                <tr key={d.id}>
                  <td>
                    <Link href={`/orders/${d.id}`} className="font-mono text-xs text-[var(--accent-primary)] hover:underline">
                      {d.ma_don ?? d.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td>
                    {formatNgay(d.ngay_bat_dau)} → {formatNgay(d.ngay_tra_du_kien)}
                  </td>
                  <td>
                    <span className={`badge ${CHANG_BADGE[d.chang as ChangDon]}`}>{CHANG_LABEL[d.chang as ChangDon]}</span>
                  </td>
                  <td>{d.tong.toLocaleString("vi-VN")}đ</td>
                  <td>{d.daThu.toLocaleString("vi-VN")}đ</td>
                  <td className="font-bold" style={{ color: d.conNo > 0 ? "#dc2626" : "#16a34a" }}>
                    {d.conNo.toLocaleString("vi-VN")}đ
                  </td>
                </tr>
              ))}
              {khachHang.donList.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-[var(--text-muted)]">
                    Chưa có đơn nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">{label}</div>
      <div className="text-sm sm:text-lg font-extrabold" style={{ color: highlight ? "#dc2626" : "var(--text-main)" }}>
        {value.toLocaleString("vi-VN")}đ
      </div>
    </div>
  );
}
