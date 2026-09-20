"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/admin";

export async function ghiChiPhi(
  donId: string,
  input: { loai: string; mo_ta?: string; so_tien: number }
) {
  if (!input.so_tien || input.so_tien <= 0) throw new Error("Số tiền phải lớn hơn 0.");

  const supabase = await createClient();
  const { error } = await supabase.from("chi_phi").insert({
    don_thue_id: donId,
    loai: input.loai,
    mo_ta: input.mo_ta || null,
    so_tien: input.so_tien,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/orders/${donId}`);
}
