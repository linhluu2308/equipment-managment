import { layBaoCaoThietBi } from "@/lib/queries/baoCao";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const { dong, tongDoanhThu, tongLoiNhuan, soDonHoanTat } = await layBaoCaoThietBi();

  const chuaTungChoThue = dong.filter((d) => d.luotThue === 0);
  const daChoThue = dong.filter((d) => d.luotThue > 0);
  const topLoiNhuan = daChoThue[0];
  const topTanSuat = [...daChoThue].sort((a, b) => b.luotThue - a.luotThue)[0];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="kpi-label">Tổng doanh thu (đơn đã xong)</div>
          <div className="kpi-value">{(tongDoanhThu / 1000).toLocaleString("vi-VN")}k</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Tổng lợi nhuận ròng</div>
          <div className="kpi-value" style={{ color: tongLoiNhuan >= 0 ? "#16a34a" : "#dc2626" }}>
            {(tongLoiNhuan / 1000).toLocaleString("vi-VN")}k
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Số đơn đã hoàn tất</div>
          <div className="kpi-value">{soDonHoanTat}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Thiết bị sinh lời tốt nhất</div>
          <div className="text-sm font-bold mt-1 leading-tight">{topLoiNhuan ? topLoiNhuan.ten : "—"}</div>
          {topLoiNhuan && (
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              {topLoiNhuan.loiNhuan.toLocaleString("vi-VN")}đ lợi nhuận
            </div>
          )}
        </div>
      </div>

      {topTanSuat && (
        <div className="card">
          <div className="card-title !mb-0">
            Thiết bị được thuê nhiều nhất: <span className="font-extrabold">{topTanSuat.ten}</span> —{" "}
            {topTanSuat.luotThue} lượt, {topTanSuat.tongNgayThue} ngày thuê cộng dồn
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">Xếp hạng lợi nhuận & tần suất theo thiết bị</div>
        <p className="text-xs text-[var(--text-muted)] mb-3">
          Doanh thu/lợi nhuận chỉ tính trên đơn đã ở chặng &quot;Xong&quot;. Tần suất &amp; số ngày thuê tính trên mọi
          đơn chưa huỷ (kể cả đang chạy), phản ánh mức độ được chọn thuê thực tế.
        </p>
        <div className="table-container" style={{ border: "none", boxShadow: "none" }}>
          <table>
            <thead>
              <tr>
                <th>Thiết bị</th>
                <th>Danh mục</th>
                <th>Lượt thuê</th>
                <th>Tổng ngày thuê</th>
                <th>Doanh thu</th>
                <th>Giá vốn</th>
                <th>Lợi nhuận</th>
              </tr>
            </thead>
            <tbody>
              {dong.map((d) => (
                <tr key={d.id}>
                  <td>
                    <span className="font-semibold">{d.ten}</span>{" "}
                    {d.ma && <span className="text-[var(--text-muted)] font-mono text-xs">· {d.ma}</span>}
                  </td>
                  <td>{d.danhMuc || "—"}</td>
                  <td>{d.luotThue}</td>
                  <td>{d.tongNgayThue}</td>
                  <td>{d.doanhThu.toLocaleString("vi-VN")}đ</td>
                  <td>{d.giaVon.toLocaleString("vi-VN")}đ</td>
                  <td className="font-bold" style={{ color: d.loiNhuan >= 0 ? "#16a34a" : "#dc2626" }}>
                    {d.loiNhuan.toLocaleString("vi-VN")}đ
                  </td>
                </tr>
              ))}
              {dong.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-[var(--text-muted)]">
                    Chưa có thiết bị nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {chuaTungChoThue.length > 0 && (
        <div className="card">
          <div className="card-title">Thiết bị chưa từng được thuê</div>
          <p className="text-xs text-[var(--text-muted)] mb-2">
            Cân nhắc điều chỉnh giá hoặc quảng bá thêm cho các thiết bị này.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {chuaTungChoThue.map((d) => (
              <span key={d.id} className="badge badge-neutral">
                {d.ten}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
