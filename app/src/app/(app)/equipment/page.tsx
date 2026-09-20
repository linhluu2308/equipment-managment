import Link from "next/link";
import { listThietBi } from "@/lib/actions/thietBi";
import { TRANG_THAI_THIET_BI_BADGE, TRANG_THAI_THIET_BI_LABEL, type TrangThaiThietBi } from "@/lib/types";
import EquipmentToolbar from "@/components/equipment/EquipmentToolbar";

export const dynamic = "force-dynamic";

export default async function EquipmentPage() {
  const thietBiList = await listThietBi();

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <input type="text" className="input w-full sm:!w-64" placeholder="🔍 Tên/mã thiết bị..." />
        <EquipmentToolbar />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tên thiết bị</th>
              <th>Danh mục</th>
              <th>Giá thuê/ngày</th>
              <th>Nguồn gốc</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {thietBiList.map((tb) => (
              <tr key={tb.id}>
                <td className="font-mono text-xs text-[var(--text-muted)]">{tb.ma || "—"}</td>
                <td>
                  <Link href={`/equipment/${tb.id}`} className="font-semibold text-[var(--accent-primary)] hover:underline">
                    {tb.ten}
                  </Link>
                </td>
                <td>{tb.danh_muc || "—"}</td>
                <td>{tb.gia_hien_hanh.toLocaleString("vi-VN")}đ</td>
                <td>{tb.nguon_goc === "so_huu" ? "Tự sở hữu" : "Thuê ngoài"}</td>
                <td>
                  <span className={`badge ${TRANG_THAI_THIET_BI_BADGE[tb.trang_thai as TrangThaiThietBi]}`}>
                    {TRANG_THAI_THIET_BI_LABEL[tb.trang_thai as TrangThaiThietBi]}
                  </span>
                </td>
              </tr>
            ))}
            {thietBiList.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-[var(--text-muted)]">
                  Chưa có thiết bị nào. Thêm mới hoặc Import Excel để bắt đầu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
