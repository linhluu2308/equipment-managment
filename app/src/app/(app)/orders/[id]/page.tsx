import Link from "next/link";
import { notFound } from "next/navigation";
import { getDonThue, getLichSuThayDoiDon } from "@/lib/actions/donThue";
import { CHANG_LABEL, HANH_DONG_LABEL, LOAI_THANH_TOAN_LABEL, type DonThueDetail } from "@/lib/types";
import { khoangSuDungDong, soNgayThue, soNgaySuDungDong, soNgayThueSuDung, tienDong, tongTienDon, tongDaThu } from "@/lib/calculations";
import { formatNgay, formatNgayGio } from "@/lib/formatDate";
import OrderActions from "@/components/orders/OrderActions";
import DongThietBiActions, { ThemThietBiButton } from "@/components/orders/ThietBiTrongDonActions";
import XuatBaoGiaButton from "@/components/orders/XuatBaoGiaButton";
import ThanhToanChuActions from "@/components/orders/ThanhToanChuActions";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const donRaw = await getDonThue(id).catch(() => null);
  if (!donRaw) notFound();
  const don = donRaw as unknown as DonThueDetail;
  const lichSuThayDoi = await getLichSuThayDoiDon(id);

  const soNgayDuKien = soNgayThue(don.ngay_bat_dau, don.ngay_tra_du_kien);
  const soNgaySuDung = soNgayThueSuDung(don);
  const tong = tongTienDon(don.don_thue_chi_tiet, don, don.chi_phi);
  const daThu = tongDaThu(don.thanh_toan);
  const congNo = tong - daThu;
  const soThietBiTraKhacNgay = don.don_thue_chi_tiet.filter(
    (l) => l.ngay_tra_thuc_te && l.ngay_tra_thuc_te !== don.ngay_tra_du_kien
  ).length;

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
              ngayBatDauSuDung={don.ngay_bat_dau_su_dung}
              ngayKetThucSuDung={don.ngay_ket_thuc_su_dung}
              chiTiet={don.don_thue_chi_tiet}
              chang={don.chang}
            />
          </div>
        </div>
        {don.da_xoa && (
          <p className="badge badge-danger !inline-block mt-2">
            🗑️ Đơn đã bị xoá lúc {formatNgayGio(don.xoa_luc)}
            {don.xoa_boi ? ` bởi ${don.xoa_boi}` : ""}
          </p>
        )}
        <Progress chang={don.chang} />
      </div>

      <section className="card">
        <div className="card-title">Khách hàng & ngày thuê</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Field label="Tên khách" value={don.khach_hang?.ten} />
          <Field label="Số điện thoại" value={don.khach_hang?.so_dien_thoai} />
          <Field label="Người giới thiệu" value={don.khach_hang?.nguoi_gioi_thieu || "—"} />
          <Field
            label="Ngày xuất/nhập kho dự kiến"
            value={
              soThietBiTraKhacNgay > 0
                ? `${formatNgay(don.ngay_bat_dau)} → ${formatNgay(don.ngay_tra_du_kien)} (${soNgayDuKien} ngày) · ${soThietBiTraKhacNgay}/${don.don_thue_chi_tiet.length} thiết bị trả khác ngày — xem chi tiết bên dưới`
                : `${formatNgay(don.ngay_bat_dau)} → ${formatNgay(don.ngay_tra_du_kien)} (${soNgayDuKien} ngày)`
            }
          />
          <Field
            label="Ngày sử dụng (cơ sở tính tiền)"
            value={`${formatNgay(don.ngay_bat_dau_su_dung)} → ${formatNgay(don.ngay_ket_thuc_su_dung)} (${soNgaySuDung} ngày)`}
          />
        </div>
        {don.ghi_chu && <p className="mt-2 text-sm text-[var(--text-muted)]">Ghi chú: {don.ghi_chu}</p>}
      </section>

      <section className="card">
        <div className="mb-3 flex items-center justify-between">
          <div className="card-title !mb-0">Thiết bị thuê</div>
          <ThemThietBiButton don={don} />
        </div>
        <div className="table-container" style={{ border: "none", boxShadow: "none" }}>
          <table>
            <thead>
              <tr>
                <th>Thiết bị</th>
                <th>Đơn giá/ngày</th>
                <th>Ngày nhập kho</th>
                <th>Số ngày tính tiền</th>
                <th>Chiết khấu</th>
                <th>Thành tiền</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {don.don_thue_chi_tiet.map((l) => {
                return (
                  <tr key={l.id}>
                    <td>
                      <span className="font-semibold">{l.thiet_bi?.ten}</span>{" "}
                      {l.thiet_bi?.ma && <span className="text-[var(--text-muted)] font-mono text-xs">· {l.thiet_bi.ma}</span>}
                      <GhiChuNgayRieng don={don} line={l} />
                    </td>
                    <td>{l.gia_thue_chot.toLocaleString("vi-VN")}đ</td>
                    <td>
                      {l.ngay_tra_thuc_te ? (
                        <span title="Ngày trả thực tế">{formatNgay(l.ngay_tra_thuc_te)}</span>
                      ) : (
                        <span className="text-[var(--text-muted)]" title="Chưa ghi ngày trả thực tế, tạm dùng ngày dự kiến">
                          {formatNgay(don.ngay_tra_du_kien)} (dự kiến)
                        </span>
                      )}
                    </td>
                    <td>{soNgaySuDungDong(don, l)}</td>
                    <td>{l.phan_tram_chiet_khau}%</td>
                    <td className="font-semibold">{tienDong(don, l).toLocaleString("vi-VN")}đ</td>
                    <td className="text-right">
                      <DongThietBiActions don={don} line={l} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card space-y-4">
        <div className="flex items-center justify-between">
          <div className="card-title !mb-0">Tài chính</div>
          {tong > 0 && Math.round(congNo) === 0 && <span className="badge badge-success">✓ Đã thanh toán đủ</span>}
        </div>
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
              <li key={t.id} className="flex items-center justify-between py-1.5">
                <span>
                  {LOAI_THANH_TOAN_LABEL[t.loai] ?? t.loai} · {formatNgay(t.ngay_thu)} {t.hinh_thuc && `· ${t.hinh_thuc}`}
                </span>
                <span className="flex items-center">
                  <span className="font-semibold">{t.so_tien.toLocaleString("vi-VN")}đ</span>
                  {!don.da_xoa && <ThanhToanChuActions donId={don.id} giaoDich={t} />}
                </span>
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

      {lichSuThayDoi.length > 0 && (
        <section className="card">
          <div className="card-title">Lịch sử thay đổi</div>
          <ul className="text-sm divide-y divide-[var(--border-color)]">
            {lichSuThayDoi.map((nk) => (
              <li key={nk.id} className="py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    <span
                      className={`badge ${
                        nk.hanh_dong === "xoa" || nk.hanh_dong === "xoa_thanh_toan"
                          ? "badge-danger"
                          : nk.hanh_dong === "khoi_phuc"
                            ? "badge-success"
                            : "badge-info"
                      }`}
                    >
                      {HANH_DONG_LABEL[nk.hanh_dong]}
                    </span>{" "}
                    <span className="font-semibold">{nk.nguoi_sua}</span>
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">{formatNgayGio(nk.created_at)}</span>
                </div>
                <p className="mt-1 text-[var(--text-muted)]">Lý do: {nk.ly_do}</p>
                {nk.hanh_dong === "xoa_thiet_bi" && nk.du_lieu_cu ? (
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Đã bỏ: {String(nk.du_lieu_cu.thiet_bi ?? "—")} · {formatGiaTriThayDoi("so_tien", nk.du_lieu_cu.so_tien)}
                  </p>
                ) : nk.hanh_dong === "xoa_thanh_toan" && nk.du_lieu_cu ? (
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Giao dịch đã xoá: {formatGiaTriThayDoi("loai", nk.du_lieu_cu.loai)} ·{" "}
                    {formatGiaTriThayDoi("so_tien", nk.du_lieu_cu.so_tien)} · {formatGiaTriThayDoi("ngay_thu", nk.du_lieu_cu.ngay_thu)}
                    {nk.du_lieu_cu.hinh_thuc ? ` · ${nk.du_lieu_cu.hinh_thuc}` : ""}
                  </p>
                ) : (
                  nk.du_lieu_moi &&
                  Object.keys(nk.du_lieu_moi).length > 0 && (
                    <ul className="mt-1 space-y-0.5 text-xs text-[var(--text-muted)]">
                      {Object.keys(nk.du_lieu_moi).map((key) => (
                        <li key={key}>
                          <span className="font-mono">{key}</span>:{" "}
                          {nk.du_lieu_cu && key in nk.du_lieu_cu && `${formatGiaTriThayDoi(key, nk.du_lieu_cu[key])} → `}
                          {formatGiaTriThayDoi(key, nk.du_lieu_moi?.[key])}
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <OrderActions don={don} />
    </div>
  );
}

function formatGiaTriThayDoi(key: string, v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (key.startsWith("ngay_") && typeof v === "string") return formatNgay(v);
  if (key === "so_tien" && typeof v === "number") return `${v.toLocaleString("vi-VN")}đ`;
  if (key === "loai" && typeof v === "string" && v in LOAI_THANH_TOAN_LABEL)
    return LOAI_THANH_TOAN_LABEL[v as keyof typeof LOAI_THANH_TOAN_LABEL];
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

/** Ghi chú dưới tên thiết bị khi dòng có ngày riêng: giao thêm giữa chừng / trả sớm. */
function GhiChuNgayRieng({ don, line }: { don: DonThueDetail; line: DonThueDetail["don_thue_chi_tiet"][number] }) {
  if (!line.ngay_xuat_kho && !line.ngay_bat_dau_su_dung && !line.ngay_ket_thuc_su_dung) return null;
  const { tu, den } = khoangSuDungDong(don, line);
  return (
    <div className="mt-0.5 text-xs text-[var(--text-muted)]">
      {line.ngay_xuat_kho && <span className="badge badge-info mr-1">Giao thêm {formatNgay(line.ngay_xuat_kho)}</span>}
      {line.ngay_ket_thuc_su_dung && <span className="badge badge-warning mr-1">Trả sớm</span>}
      Tính tiền {formatNgay(tu)} → {formatNgay(den)}
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
