import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { layThanhVienTheoEmail } from "@/lib/queries/thanhVien";
import { layNhaCungCap } from "@/lib/queries/nhaCungCap";
import SupplierDetailActions from "@/components/suppliers/SupplierDetailActions";

export const dynamic = "force-dynamic";

const LOAI_GIAO_DICH_LABEL: Record<string, string> = {
  no_phat_sinh: "Nợ phát sinh",
  thanh_toan: "Đã thanh toán",
};
const LOAI_GIAO_DICH_BADGE: Record<string, string> = {
  no_phat_sinh: "badge-danger",
  thanh_toan: "badge-success",
};

export default async function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const thanhVien = user?.email ? await layThanhVienTheoEmail(user.email) : null;
  if (!thanhVien || thanhVien.vai !== "chu") redirect("/");

  const data = await layNhaCungCap(id).catch(() => null);
  if (!data || !data.nhaCungCap) notFound();
  const { nhaCungCap, giaoDich, thietBi, tongNo, tongDaTra, conNo } = data;

  return (
    <div className="max-w-3xl w-full space-y-5">
      <Link href="/suppliers" className="text-sm font-semibold text-[var(--accent-primary)] hover:underline">
        ← Nhà cung cấp
      </Link>

      <div>
        <h1 className="text-xl font-extrabold">{nhaCungCap.ten}</h1>
        <p className="text-sm text-[var(--text-muted)]">
          {nhaCungCap.so_dien_thoai || "Chưa có SĐT"}
          {nhaCungCap.ghi_chu && ` · ${nhaCungCap.ghi_chu}`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="kpi-card">
          <div className="kpi-label">Tổng nợ phát sinh</div>
          <div className="kpi-value">{tongNo.toLocaleString("vi-VN")}đ</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Đã thanh toán</div>
          <div className="kpi-value">{tongDaTra.toLocaleString("vi-VN")}đ</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Còn nợ</div>
          <div className="kpi-value" style={{ color: conNo > 0 ? "#dc2626" : "#16a34a" }}>
            {conNo.toLocaleString("vi-VN")}đ
          </div>
        </div>
      </div>

      <section className="card">
        <div className="card-title">Thiết bị đang thuê từ nhà cung cấp này</div>
        <ul className="text-sm divide-y divide-[var(--border-color)]">
          {thietBi.map((tb) => (
            <li key={tb.id} className="flex justify-between py-1.5">
              <Link href={`/equipment/${tb.id}`} className="font-semibold text-[var(--accent-primary)] hover:underline">
                {tb.ten} {tb.ma && <span className="text-[var(--text-muted)] font-mono text-xs">· {tb.ma}</span>}
              </Link>
              <span className="text-[var(--text-muted)]">{(tb.gia_von ?? 0).toLocaleString("vi-VN")}đ/ngày</span>
            </li>
          ))}
          {thietBi.length === 0 && <li className="py-1.5 text-[var(--text-muted)]">Chưa có thiết bị nào.</li>}
        </ul>
      </section>

      <section className="card">
        <div className="card-title">Sổ công nợ</div>
        <div className="table-container" style={{ border: "none", boxShadow: "none" }}>
          <table>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Loại</th>
                <th>Thiết bị / đơn liên quan</th>
                <th>Số tiền</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {giaoDich.map((g) => (
                <tr key={g.id}>
                  <td className="font-mono text-xs">{g.ngay}</td>
                  <td>
                    <span className={`badge ${LOAI_GIAO_DICH_BADGE[g.loai]}`}>{LOAI_GIAO_DICH_LABEL[g.loai]}</span>
                  </td>
                  <td>
                    {g.don_thue ? (
                      <Link href={`/orders/${g.don_thue.id}`} className="text-[var(--accent-primary)] hover:underline">
                        {g.thiet_bi?.ten} ({g.don_thue.ma_don ?? "—"})
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={g.loai === "no_phat_sinh" ? "text-[#dc2626]" : "text-[#16a34a]"}>
                    {g.so_tien.toLocaleString("vi-VN")}đ
                  </td>
                  <td className="text-[var(--text-muted)]">{g.ghi_chu || "—"}</td>
                </tr>
              ))}
              {giaoDich.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-[var(--text-muted)]">
                    Chưa có giao dịch nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <SupplierDetailActions nhaCungCap={nhaCungCap} />
    </div>
  );
}
