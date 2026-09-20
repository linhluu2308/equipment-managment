"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/admin";
import type { TinhTrangThietBi } from "@/lib/types";

export async function ghiKiemTraTinhTrang(
  donId: string,
  input: { thiet_bi_id: string; tinh_trang: TinhTrangThietBi; ghi_chu?: string; nguoi_kiem?: string }
) {
  const supabase = await createClient();
  const { error } = await supabase.from("kiem_tra_tinh_trang").upsert(
    {
      don_thue_id: donId,
      thiet_bi_id: input.thiet_bi_id,
      tinh_trang: input.tinh_trang,
      ghi_chu: input.ghi_chu || null,
      nguoi_kiem: input.nguoi_kiem || null,
    },
    { onConflict: "don_thue_id,thiet_bi_id" }
  );
  if (error) throw new Error(error.message);
  revalidatePath(`/orders/${donId}`);
}
