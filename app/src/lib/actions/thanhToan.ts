"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/admin";
import { getDonThue } from "@/lib/actions/donThue";
import { congNoConLai } from "@/lib/calculations";
import { ghiNhatKyThayDoiDon, nguoiDungHienTaiLaChu } from "@/lib/quyenVaNhatKy";
import type { DonThueDetail, LoaiThanhToan } from "@/lib/types";

/**
 * Lỗi nghiệp vụ trả về `{ error }` thay vì throw (production Next ẩn message của
 * lỗi throw từ Server Action). Khoá thanh toán khi đơn đã thu đủ: chỉ cho ghi thêm
 * khi còn công nợ, và chỉ cho "Hoàn cọc" khi khách đã trả dư (không hoàn quá số dư).
 * "Cọc tiền" được phép vượt công nợ vì phần dư sẽ hoàn lại qua "Hoàn cọc".
 */
export async function ghiThanhToan(
  donId: string,
  input: { so_tien: number; hinh_thuc?: string; loai: LoaiThanhToan }
): Promise<{ error?: string }> {
  if (!input.so_tien || input.so_tien <= 0) return { error: "Số tiền phải lớn hơn 0." };

  const don = (await getDonThue(donId)) as unknown as DonThueDetail;
  const congNo = Math.round(congNoConLai(don.don_thue_chi_tiet, don, don.chi_phi, don.thanh_toan));

  if (input.loai === "hoan_coc") {
    if (congNo >= 0) return { error: "Khách chưa trả dư nên không có tiền cọc cần hoàn." };
    if (input.so_tien > -congNo)
      return { error: `Số tiền hoàn vượt quá số khách trả dư (${(-congNo).toLocaleString("vi-VN")}đ).` };
  } else {
    if (congNo <= 0) return { error: "Đơn đã thanh toán đủ, không thể ghi nhận thêm." };
    if (input.loai !== "coc" && input.so_tien > congNo)
      return { error: `Số tiền vượt quá công nợ còn lại (${congNo.toLocaleString("vi-VN")}đ).` };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("thanh_toan").insert({
    don_thue_id: donId,
    so_tien: input.so_tien,
    hinh_thuc: input.hinh_thuc || null,
    loai: input.loai,
  });
  if (error) return { error: error.message };
  revalidatePath(`/orders/${donId}`);
  revalidatePath("/orders");
  return {};
}

const TRUONG_SUA_DUOC = ["so_tien", "loai", "hinh_thuc", "ngay_thu"] as const;
type DuLieuGiaoDich = { so_tien: number; loai: LoaiThanhToan; hinh_thuc: string | null; ngay_thu: string };

const LOI_CHUA_CHAY_MIGRATION =
  "Chưa chạy migration 0015_nhat_ky_sua_xoa_thanh_toan.sql trong Supabase SQL Editor nên chưa ghi được lịch sử — chưa thay đổi gì.";

async function layGiaoDich(id: string, donId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("thanh_toan")
    .select("so_tien, loai, hinh_thuc, ngay_thu")
    .eq("id", id)
    .eq("don_thue_id", donId)
    .single();
  if (error || !data) return null;
  return data as DuLieuGiaoDich;
}

/**
 * Ghi nhật ký TRƯỚC khi đổi dữ liệu: nếu không ghi được (vd chưa chạy migration 0015)
 * thì dừng luôn, không để giao dịch bị sửa/xoá mà không có dấu vết. Đổi dữ liệu thất
 * bại thì xoá lại dòng nhật ký vừa ghi.
 */
async function ghiNhatKyRoiThucHien(
  donId: string,
  nguoiSua: { ten: string; email: string },
  hanhDong: "sua_thanh_toan" | "xoa_thanh_toan",
  lyDo: string,
  cu: Record<string, unknown>,
  moi: Record<string, unknown> | null,
  thucHien: () => PromiseLike<{ error: { message: string } | null }>
): Promise<{ error?: string }> {
  let nhatKyId: string;
  try {
    nhatKyId = await ghiNhatKyThayDoiDon(donId, nguoiSua, hanhDong, lyDo, cu, moi);
  } catch (err) {
    const msg = (err as Error).message;
    return { error: msg.includes("hanh_dong_check") ? LOI_CHUA_CHAY_MIGRATION : msg };
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

/**
 * Chủ sửa một giao dịch đã ghi (nhập sai số tiền/loại/ngày). Không áp quy tắc khoá
 * công nợ như ghiThanhToan() vì đây là công cụ đính chính, chỉ ghi lại đúng các
 * trường thực sự đổi vào nhật ký đơn.
 */
export async function suaThanhToan(
  id: string,
  donId: string,
  input: DuLieuGiaoDich,
  lyDo: string
): Promise<{ error?: string }> {
  let nguoiSua: { ten: string; email: string };
  try {
    nguoiSua = await nguoiDungHienTaiLaChu();
  } catch (err) {
    return { error: (err as Error).message };
  }
  if (!lyDo.trim()) return { error: "Cần nhập lý do sửa giao dịch." };
  if (!input.so_tien || input.so_tien <= 0) return { error: "Số tiền phải lớn hơn 0." };
  if (!input.ngay_thu) return { error: "Cần chọn ngày thu." };

  const giaoDich = await layGiaoDich(id, donId);
  if (!giaoDich) return { error: "Không tìm thấy giao dịch này (có thể đã bị xoá)." };

  const moi: DuLieuGiaoDich = { ...input, hinh_thuc: input.hinh_thuc || null };
  const cu: Record<string, unknown> = {};
  const doi: Record<string, unknown> = {};
  for (const k of TRUONG_SUA_DUOC) {
    if (giaoDich[k] !== moi[k]) {
      cu[k] = giaoDich[k];
      doi[k] = moi[k];
    }
  }
  if (Object.keys(doi).length === 0) return { error: "Không có gì thay đổi." };

  return ghiNhatKyRoiThucHien(donId, nguoiSua, "sua_thanh_toan", lyDo.trim(), cu, doi, () =>
    createClient().from("thanh_toan").update(doi).eq("id", id)
  );
}

/** Chủ xoá hẳn một giao dịch (vd ghi trùng). Toàn bộ nội dung giao dịch được lưu trong nhật ký. */
export async function xoaThanhToan(id: string, donId: string, lyDo: string): Promise<{ error?: string }> {
  let nguoiSua: { ten: string; email: string };
  try {
    nguoiSua = await nguoiDungHienTaiLaChu();
  } catch (err) {
    return { error: (err as Error).message };
  }
  if (!lyDo.trim()) return { error: "Cần nhập lý do xoá giao dịch." };

  const giaoDich = await layGiaoDich(id, donId);
  if (!giaoDich) return { error: "Không tìm thấy giao dịch này (có thể đã bị xoá)." };

  return ghiNhatKyRoiThucHien(donId, nguoiSua, "xoa_thanh_toan", lyDo.trim(), giaoDich, null, () =>
    createClient().from("thanh_toan").delete().eq("id", id)
  );
}
