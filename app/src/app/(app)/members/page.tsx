import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { layThanhVienTheoEmail, layDanhSachThanhVien } from "@/lib/queries/thanhVien";
import MembersManager from "@/components/members/MembersManager";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const thanhVien = user?.email ? await layThanhVienTheoEmail(user.email) : null;
  if (!thanhVien || thanhVien.vai !== "chu") redirect("/");

  const danhSach = await layDanhSachThanhVien();

  return (
    <div className="card">
      <div className="card-title">Thành viên được phép đăng nhập</div>
      <p className="text-xs text-[var(--text-muted)] mb-3">
        Chỉ email có trong danh sách này mới đăng nhập được bằng Google. Thêm/sửa/xoá ở đây có hiệu lực ngay.
      </p>
      <MembersManager danhSach={danhSach} />
    </div>
  );
}
