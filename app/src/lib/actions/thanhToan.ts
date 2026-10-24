"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/admin";
import { getDonThue } from "@/lib/actions/donThue";
import { congNoConLai } from "@/lib/calculations";
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
