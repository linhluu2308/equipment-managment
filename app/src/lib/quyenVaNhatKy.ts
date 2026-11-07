// Helper chỉ chạy phía server, dùng chung cho các Server Action sửa/xoá đơn và giao dịch.
// CỐ Ý không đặt "use server" ở file này: mọi export của file "use server" đều thành
// endpoint client gọi được, mà 2 hàm dưới không được phép gọi trực tiếp từ client.
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { layThanhVienTheoEmail } from "@/lib/queries/thanhVien";
import type { HanhDongThayDoiDon } from "@/lib/types";

/** Thành viên đang đăng nhập (mọi vai) — dùng cho thao tác ai cũng làm được nhưng vẫn cần ghi nhật ký. */
export async function nguoiDungHienTai(): Promise<{ ten: string; email: string; laChu: boolean }> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Chưa đăng nhập.");
  const tv = await layThanhVienTheoEmail(user.email);
  if (!tv) throw new Error("Bạn không có quyền truy cập.");
  return { ten: tv.ten, email: user.email, laChu: tv.vai === "chu" };
}

/**
 * Xác thực người gọi đang đăng nhập và có vai "chu" — dùng cho mọi Server Action
 * sửa/xoá/khôi phục đơn. RLS đang tắt toàn app (xem 0001_init.sql) nên đây là lớp
 * kiểm tra quyền duy nhất ở tầng dữ liệu, không thể chỉ dựa vào useVai() ở client.
 */
export async function nguoiDungHienTaiLaChu(): Promise<{ ten: string; email: string }> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Chưa đăng nhập.");
  const tv = await layThanhVienTheoEmail(user.email);
  if (!tv || tv.vai !== "chu") throw new Error("Chỉ chủ mới được thực hiện thao tác này.");
  return { ten: tv.ten, email: user.email };
}

/** Ghi 1 dòng nhật ký thay đổi đơn, trả về id dòng vừa ghi. */
export async function ghiNhatKyThayDoiDon(
  donId: string,
  nguoiSua: { ten: string; email: string },
  hanhDong: HanhDongThayDoiDon,
  lyDo: string,
  duLieuCu: Record<string, unknown> | null,
  duLieuMoi: Record<string, unknown> | null
): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("nhat_ky_thay_doi_don")
    .insert({
      don_thue_id: donId,
      nguoi_sua: nguoiSua.ten,
      nguoi_sua_email: nguoiSua.email,
      hanh_dong: hanhDong,
      ly_do: lyDo,
      du_lieu_cu: duLieuCu,
      du_lieu_moi: duLieuMoi,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

/**
 * Ghi nhật ký TRƯỚC khi đổi dữ liệu: nếu không ghi được (vd chưa chạy migration mở
 * rộng CHECK hanh_dong) thì dừng luôn, không để giao dịch bị sửa/xoá mà không có dấu vết. Đổi dữ liệu thất
 * bại thì xoá lại dòng nhật ký vừa ghi.
 */
export async function ghiNhatKyRoiThucHien(
  donId: string,
  nguoiSua: { ten: string; email: string },
  hanhDong: HanhDongThayDoiDon,
  lyDo: string,
  cu: Record<string, unknown>,
  moi: Record<string, unknown> | null,
  loiChuaChayMigration: string,
  thucHien: () => PromiseLike<{ error: { message: string } | null }>
): Promise<{ error?: string }> {
  let nhatKyId: string;
  try {
    nhatKyId = await ghiNhatKyThayDoiDon(donId, nguoiSua, hanhDong, lyDo, cu, moi);
  } catch (err) {
    const msg = (err as Error).message;
    return { error: msg.includes("hanh_dong_check") ? loiChuaChayMigration : msg };
  }
  const { error } = await thucHien();
  if (error) {
    await createClient().from("nhat_ky_thay_doi_don").delete().eq("id", nhatKyId);
    return { error: error.message };
  }
  revalidatePath(`/orders/${donId}`);
  revalidatePath("/orders");
  revalidatePath("/customers");
  revalidatePath("/reports");
  return {};
}
