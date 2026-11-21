import { createClient } from "@/lib/supabase/admin";
import type { AnhThietBiTrongDon } from "@/lib/types";

/**
 * Ảnh của 1 đơn, cũ → mới. Tách riêng khỏi getDonThue() và KHÔNG throw: nếu chưa chạy
 * migration 0020 thì chỉ mất phần ảnh, trang chi tiết đơn vẫn mở được (trước đây lỗi
 * select trong getDonThue() bị nuốt thành 404 — xem MEMORY.md 2026-10-04).
 */
export async function layAnhCuaDon(donId: string): Promise<{ anh: AnhThietBiTrongDon[]; loi?: string }> {
  const { data, error } = await createClient()
    .from("anh_thiet_bi_trong_don")
    .select("*")
    .eq("don_thue_id", donId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("layAnhCuaDon:", error.message);
    return { anh: [], loi: "Chưa xem được ảnh thiết bị (đã chạy migration 0020 chưa?)." };
  }
  return { anh: data as AnhThietBiTrongDon[] };
}
