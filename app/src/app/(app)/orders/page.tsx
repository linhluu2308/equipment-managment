import Link from "next/link";
import { listDonThue } from "@/lib/actions/donThue";
import { CHANG_BADGE, CHANG_LABEL, type ChangDon } from "@/lib/types";
import { soNgayThue, tongTienDon, tongDaThu } from "@/lib/calculations";
import NewOrderButton from "@/components/orders/NewOrderButton";

export const dynamic = "force-dynamic";

const TABS: { value: ChangDon | "tat_ca"; label: string }[] = [
  { value: "tat_ca", label: "Tất cả" },
  { value: "yeu_cau", label: "Yêu cầu" },
  { value: "bao_gia", label: "Báo giá" },
  { value: "da_giao", label: "Đã giao" },
  { value: "cho_tra", label: "Chờ trả" },
  { value: "xong", label: "Xong" },
  { value: "huy", label: "Đã huỷ" },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ chang?: string }>;
}) {
  const { chang } = await searchParams;
  const filter = (chang as ChangDon | undefined) ?? undefined;
  const orders = await listDonThue(filter);

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <input type="text" className="input !w-64" placeholder="🔍 Tên khách · SĐT · Mã đơn..." />
          <div className="flex gap-1.5 flex-wrap">
            {TABS.map((t) => (
              <Link
                key={t.value}
                href={t.value === "tat_ca" ? "/orders" : `/orders?chang=${t.value}`}
                className={`pill ${(filter ?? "tat_ca") === t.value ? "active" : ""}`}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
        <NewOrderButton />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Dải ngày thuê</th>
              <th>Tổng tiền</th>
              <th>Đã thu</th>
              <th>Công nợ</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const soNgay = soNgayThue(o.ngay_bat_dau, o.ngay_tra_du_kien);
              const tong = tongTienDon(o.don_thue_chi_tiet, soNgay, o.chi_phi);
              const daThu = tongDaThu(o.thanh_toan);
              return (
                <tr key={o.id}>
                  <td>
                    <Link href={`/orders/${o.id}`} className="font-semibold text-[var(--accent-primary)] hover:underline">
                      {o.khach_hang?.ten ?? "—"}
                    </Link>
                    <div className="text-xs text-[var(--text-muted)]">{o.khach_hang?.so_dien_thoai}</div>
                  </td>
                  <td>
                    {o.ngay_bat_dau} → {o.ngay_tra_du_kien} ({soNgay} ngày)
                  </td>
                  <td>{tong.toLocaleString("vi-VN")}đ</td>
                  <td>{daThu.toLocaleString("vi-VN")}đ</td>
                  <td className="font-bold" style={{ color: tong - daThu > 0 ? "#dc2626" : "#16a34a" }}>
                    {(tong - daThu).toLocaleString("vi-VN")}đ
                  </td>
                  <td>
                    <span className={`badge ${CHANG_BADGE[o.chang as ChangDon]}`}>
                      {CHANG_LABEL[o.chang as ChangDon]}
                    </span>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-[var(--text-muted)]">
                  Không có đơn nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
