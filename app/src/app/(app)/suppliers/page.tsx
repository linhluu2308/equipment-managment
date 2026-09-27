import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { layThanhVienTheoEmail } from "@/lib/queries/thanhVien";
import { layDanhSachNhaCungCap } from "@/lib/queries/nhaCungCap";
import SuppliersManager from "@/components/suppliers/SuppliersManager";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const thanhVien = user?.email ? await layThanhVienTheoEmail(user.email) : null;
  if (!thanhVien || thanhVien.vai !== "chu") redirect("/");

  const danhSach = await layDanhSachNhaCungCap();

  return (
    <div className="card">
      <div className="card-title">Nhà cung cấp & công nợ</div>
      <p className="text-xs text-[var(--text-muted)] mb-3">
        Công nợ tự phát sinh khi đơn thuê dùng thiết bị của nhà cung cấp chuyển sang chặng &quot;Xong&quot; (giá vốn/ngày
        × số ngày thuê). Ghi nhận thanh toán thủ công khi đã trả tiền cho nhà cung cấp.
      </p>
      <SuppliersManager danhSach={danhSach} />
    </div>
  );
}
