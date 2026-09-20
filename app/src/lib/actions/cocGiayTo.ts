"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/admin";

export async function themCocGiayTo(
  donId: string,
  input: { loai_giay_to: string; so_hieu?: string; anh_url?: string }
) {
  const supabase = await createClient();
  const { error } = await supabase.from("coc_giay_to").insert({
    don_thue_id: donId,
    loai_giay_to: input.loai_giay_to,
    so_hieu: input.so_hieu || null,
    anh_url: input.anh_url || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/orders/${donId}`);
}

export async function hoanTraGiayTo(id: string, donId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("coc_giay_to")
    .update({ trang_thai: "da_hoan_tra" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/orders/${donId}`);
}
