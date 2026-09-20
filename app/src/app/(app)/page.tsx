import Link from "next/link";
import { layTongQuan } from "@/lib/queries/tongQuan";
import { CHANG_BADGE, CHANG_LABEL, type ChangDon } from "@/lib/types";

export const dynamic = "force-dynamic";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default async function DashboardPage() {
  const { donDangChay, donSapToi, tonKho } = await layTongQuan();
  const today = todayStr();

  const kpis = [
    { label: "Đơn thuê đang chạy", value: donDangChay.length },
    { label: "Cần bàn giao hôm nay", value: donDangChay.filter((o) => o.ngay_bat_dau === today).length },
    { label: "Dự kiến nhận về hôm nay", value: donDangChay.filter((o) => o.ngay_tra_du_kien === today).length },
    { label: "Thiết bị sẵn sàng", value: tonKho.reduce((s, t) => s + t.conTrong, 0) },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-4">
        <div className="card">
          <div className="card-title">Đơn thuê đang diễn ra</div>
          <OrderTable orders={donDangChay} empty="Không có đơn nào đang diễn ra." />
        </div>
        <div className="card">
          <div className="card-title">Tồn kho nhanh theo loại</div>
          <div className="table-container" style={{ border: "none", boxShadow: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>Loại</th>
                  <th>Tổng</th>
                  <th>Trống</th>
                </tr>
              </thead>
              <tbody>
                {tonKho.map((t) => (
                  <tr key={t.danhMuc}>
                    <td>{t.danhMuc}</td>
                    <td>{t.tong}</td>
                    <td className="font-semibold text-emerald-600">{t.conTrong}</td>
                  </tr>
                ))}
                {tonKho.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-[var(--text-muted)]">
                      Chưa có thiết bị.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {donSapToi.length > 0 && (
        <div className="card">
          <div className="card-title">Yêu cầu / sắp tới</div>
          <OrderTable orders={donSapToi} empty="Không có yêu cầu nào đang chờ." />
        </div>
      )}
    </>
  );
}

type OrderRow = {
  id: string;
  chang: string;
  ngay_bat_dau: string;
  ngay_tra_du_kien: string;
  khach_hang: { ten: string; so_dien_thoai: string } | null;
  don_thue_chi_tiet: { id: string }[];
};

function OrderTable({ orders, empty }: { orders: OrderRow[]; empty: string }) {
  if (orders.length === 0) {
    return <p className="text-sm text-[var(--text-muted)]">{empty}</p>;
  }
  return (
    <div className="table-container" style={{ border: "none", boxShadow: "none" }}>
      <table>
        <thead>
          <tr>
            <th>Khách hàng</th>
            <th>Dải ngày thuê</th>
            <th>SL máy</th>
            <th>Chặng</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <Link href={`/orders/${o.id}`} className="font-semibold text-[var(--accent-primary)] hover:underline">
                  {o.khach_hang?.ten ?? "—"}
                </Link>
                <div className="text-xs text-[var(--text-muted)]">{o.khach_hang?.so_dien_thoai}</div>
              </td>
              <td>
                {o.ngay_bat_dau} → {o.ngay_tra_du_kien}
              </td>
              <td>{o.don_thue_chi_tiet?.length ?? 0}</td>
              <td>
                <span className={`badge ${CHANG_BADGE[o.chang as ChangDon]}`}>
                  {CHANG_LABEL[o.chang as ChangDon] ?? o.chang}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
