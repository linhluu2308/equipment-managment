import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/admin";
import { layThanhVienTheoEmail } from "@/lib/queries/thanhVien";
import { taiFileVe } from "@/lib/googleDrive";

// Trả ảnh thiết bị từ Google Drive cho thành viên đã đăng nhập. File trên Drive để
// riêng tư (không chia sẻ công khai) — app đọc bằng token của tài khoản CineB rồi
// chuyển tiếp cho trình duyệt. proxy.ts đã chặn người chưa đăng nhập; kiểm tra lại
// ở đây vì đây là dữ liệu thật, không chỉ là trang giao diện.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabaseUser = await createServerClient();
  const {
    data: { user },
  } = await supabaseUser.auth.getUser();
  if (!user?.email || !(await layThanhVienTheoEmail(user.email))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: anh } = await createClient()
    .from("anh_thiet_bi_trong_don")
    .select("drive_file_id")
    .eq("id", id)
    .maybeSingle();
  if (!anh) return new Response("Not found", { status: 404 });

  try {
    const res = await taiFileVe(anh.drive_file_id);
    return new Response(res.body, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "image/jpeg",
        // Ảnh không bao giờ đổi nội dung (sửa = xoá + tải ảnh mới) nên cache lâu được,
        // "private" để không lưu ở CDN dùng chung.
        "Cache-Control": "private, max-age=604800, immutable",
      },
    });
  } catch (err) {
    console.error(`Không tải được ảnh ${id} từ Google Drive:`, err);
    return new Response("Không tải được ảnh từ Google Drive", { status: 502 });
  }
}
