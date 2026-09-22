import Link from "next/link";
import { notFound } from "next/navigation";
import { getDonThue } from "@/lib/actions/donThue";
import { CHANG_LABEL, type DonThueDetail } from "@/lib/types";
import { soNgayThue, thanhTienDong, tongTienDon, tongDaThu } from "@/lib/calculations";
import OrderActions from "@/components/orders/OrderActions";
import RemoveLineButton from "@/components/orders/RemoveLineButton";
import XuatBaoGiaButton from "@/components/orders/XuatBaoGiaButton";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const donRaw = await getDonThue(id).catch(() => null);
  if (!donRaw) notFound();
  const don = donRaw as unknown as DonThueDetail;

  const soNgay = soNgayThue(don.ngay_bat_dau, don.ngay_tra_du_kien);
  const tong = tongTienDon(don.don_thue_chi_tiet, soNgay, don.chi_phi);
  const daThu = tongDaThu(don.thanh_toan);
  const congNo = tong - daThu;

  return (
    <div className="max-w-4xl w-full space-y-5">
      <div>
        <Link href="/orders" className="text-sm font-semibold text-[var(--accent-primary)] hover:underline">
          ← Danh sách đơn
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-xl font-extrabold font-mono">
            Đơn #{don.id.slice(0, 8).toUpperCase()}
          </h1>
          <div className="flex items-center gap-2">
            {don.chang === "huy" ? (
              <span className="badge badge-danger">Đã huỷ</span>
            ) : (
              <span className="badge badge-info">{CHANG_LABEL[don.chang]}</span>
            )}
            <XuatBaoGiaButton
              maDon={don.ma_don ?? don.id.slice(0, 8).toUpperCase()}
              tenKhach={don.khach_hang?.ten ?? "—"}
              sdtKhach={don.khach_hang?.so_dien_thoai ?? ""}
              ngayBatDau={don.ngay_bat_dau}
              ngayTraDuKien={don.ngay_tra_du_kien}
              chiTiet={don.don_thue_chi_tiet}
              chang={don.chang}
            />
          </div>
        </div>
        <Progress chang={don.chang} />
      </div>

      <section className="card">
        <div className="card-title">Khách hàng & ngày thuê</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Field label="Tên khách" value={don.khach_hang?.ten} />
          <Field label="Số điện thoại" value={don.khach_hang?.so_dien_thoai} />
          <Field label="Người giới thiệu" value={don.khach_hang?.nguoi_gioi_thieu || "—"} />
          <Field label="Dải ngày thuê" value={`${don.ngay_bat_dau} → ${don.ngay_tra_du_kien} (${soNgay} ngày)`} />
        </div>
        {don.ghi_chu && <p className="mt-2 text-sm text-[var(--text-muted)]">Ghi chú: {don.ghi_chu}</p>}
      </section>

      <section className="card">
        <div className="card-title">Thiết bị thuê</div>
        <div className="table-container" style={{ border: "none", boxShadow: "none" }}>
          <table>
            <thead>
              <tr>
                <th>Thiết bị</th>
                <th>Đơn giá/ngày</th>
                <th>Chiết khấu</th>
                <th>Thành tiền</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {don.don_thue_chi_tiet.map((l) => (
                <tr key={l.id}>
                  <td>
                    <span className="font-semibold">{l.thiet_bi?.ten}</span>{" "}
                    {l.thiet_bi?.ma && <span className="text-[var(--text-muted)] font-mono text-xs">· {l.thiet_bi.ma}</span>}
                  </td>
                  <td>{l.gia_thue_chot.toLocaleString("vi-VN")}đ</td>
                  <td>{l.phan_tram_chiet_khau}%</td>
                  <td className="font-semibold">{thanhTienDong(l, soNgay).toLocaleString("vi-VN")}đ</td>
                  <td className="text-right">
                    {don.chang === "yeu_cau" && <RemoveLineButton chiTietId={l.id} donId={don.id} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card space-y-4">
        <div className="card-title !mb-0">Tài chính</div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Stat label="Tổng tiền đơn" value={tong} />
          <Stat label="Đã thu" value={daThu} />
          <Stat label="Công nợ còn lại" value={congNo} highlight={congNo > 0} />
        </div>

        <div>
          <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Lịch sử thanh toán
          </h3>
          <ul className="text-sm divide-y divide-[var(--border-color)]">
            {don.thanh_toan.map((t) => (
              <li key={t.id} className="flex justify-between py-1.5">
                <span>
                  {t.loai} · {t.ngay_thu} {t.hinh_thuc && `· ${t.hinh_thuc}`}
                </span>
                <span className="font-semibold">{t.so_tien.toLocaleString("vi-VN")}đ</span>
              </li>
            ))}
            {don.thanh_toan.length === 0 && <li className="py-1.5 text-[var(--text-muted)]">Chưa có giao dịch.</li>}
          </ul>
        </div>

        <div>
          <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Cọc giấy tờ
          </h3>
          <ul className="text-sm divide-y divide-[var(--border-color)]">
            {don.coc_giay_to.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-1.5">
                <span>
                  🪪 {c.loai_giay_to} {c.so_hieu && `· ${c.so_hieu}`}
                </span>
                <span className={`badge ${c.trang_thai === "dang_giu" ? "badge-info" : "badge-neutral"}`}>
                  {c.trang_thai === "dang_giu" ? "Đang giữ" : "✓ Đã hoàn trả"}
                </span>
              </li>
            ))}
            {don.coc_giay_to.length === 0 && <li className="py-1.5 text-[var(--text-muted)]">Không có giấy tờ cọc.</li>}
          </ul>
        </div>

        <div>
          <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Chi phí phát sinh
          </h3>
          <ul className="text-sm divide-y divide-[var(--border-color)]">
            {don.chi_phi.map((c) => (
              <li key={c.id} className="flex justify-between py-1.5">
                <span>
                  {c.loai} {c.mo_ta && `· ${c.mo_ta}`}
                </span>
                <span className="font-semibold">{c.so_tien.toLocaleString("vi-VN")}đ</span>
              </li>
            ))}
            {don.chi_phi.length === 0 && <li className="py-1.5 text-[var(--text-muted)]">Không có chi phí phát sinh.</li>}
          </ul>
        </div>
      </section>

      {(don.chang === "da_giao" || don.chang === "cho_tra" || don.chang === "xong") && (
        <section className="card">
          <div className="card-title">Biên bản kiểm tra khi trả</div>
          <ul className="text-sm divide-y divide-[var(--border-color)]">
            {don.don_thue_chi_tiet.map((l) => {
              const kt = don.kiem_tra_tinh_trang.find((k) => k.thiet_bi_id === l.thiet_bi_id);
              return (
                <li key={l.id} className="flex justify-between py-1.5">
                  <span>{l.thiet_bi?.ten}</span>
                  {kt ? (
                    <span
                      className={`badge ${
                        kt.tinh_trang === "tot"
                          ? "badge-success"
                          : kt.tinh_trang === "tray_xuoc"
                            ? "badge-warning"
                            : "badge-danger"
                      }`}
                    >
                      {kt.tinh_trang === "tot" ? "Tốt" : kt.tinh_trang === "tray_xuoc" ? "Trầy xước" : "Hỏng hóc"}
                    </span>
                  ) : (
                    <span className="badge badge-neutral">Chưa kiểm tra</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <OrderActions don={don} />
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">{label}</div>
      <div>{value || "—"}</div>
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

const CHANG_ORDER = ["yeu_cau", "bao_gia", "da_giao", "cho_tra", "xong"] as const;

function Progress({ chang }: { chang: string }) {
  if (chang === "huy") return null;
  const idx = CHANG_ORDER.indexOf(chang as (typeof CHANG_ORDER)[number]);
  return (
    <div className="mt-3 flex gap-1.5">
      {CHANG_ORDER.map((c, i) => (
        <div
          key={c}
          className="flex-1 text-center text-[10px] font-bold uppercase tracking-wide py-2 rounded"
          style={{
            background: i <= idx ? "var(--sidebar-active)" : "#e2e8f0",
            color: i <= idx ? "#fff" : "var(--text-muted)",
          }}
        >
          {CHANG_LABEL[c]}
        </div>
      ))}
    </div>
  );
}
