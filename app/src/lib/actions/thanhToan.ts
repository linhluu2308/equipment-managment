"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/admin";
import type { LoaiThanhToan } from "@/lib/types";

export async function ghiThanhToan(
  donId: string,
  input: { so_tien: number; hinh_thuc?: string; loai: LoaiThanhToan }
) {
  if (!input.so_tien || input.so_tien <= 0) throw new Error("Số tiền phải lớn hơn 0.");

  const supabase = await createClient();
  const { error } = await supabase.from("thanh_toan").insert({
    don_thue_id: donId,
    so_tien: input.so_tien,
    hinh_thuc: input.hinh_thuc || null,
    loai: input.loai,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/orders/${donId}`);
  revalidatePath("/orders");
}
