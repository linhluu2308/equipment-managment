"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/admin";
import { nguoiDungHienTaiLaChu } from "@/lib/quyenVaNhatKy";
import { bienBanDaDu, capNhatTrangThaiSauKiemTra } from "@/lib/trangThaiThietBi";
import type { TinhTrangThietBi } from "@/lib/types";

/**
 * Ghi/sửa biên bản kiểm tra 1 thiết bị khi trả. Ghi xong thì thiết bị về kho ngay
 * (Tốt/Trầy xước → Sẵn sàng, Hỏng hóc → Hỏng), không đợi đơn chốt "Xong". Biên bản
 * đã đủ mọi thiết bị thì bị khoá — chỉ chủ được sửa.
 */
export async function ghiKiemTraTinhTrang(
  donId: string,
  input: { thiet_bi_id: string; tinh_trang: TinhTrangThietBi; ghi_chu?: string; nguoi_kiem?: string }
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: don, error: eDon } = await supabase.from("don_thue").select("chang, da_xoa").eq("id", donId).single();
  if (eDon) return { error: eDon.message };
  if (don.da_xoa || (don.chang !== "da_giao" && don.chang !== "cho_tra")) {
    return { error: "Đơn không còn ở chặng cho phép ghi biên bản kiểm tra." };
  }
  if (await bienBanDaDu(donId)) {
    try {
      await nguoiDungHienTaiLaChu();
    } catch {
      return { error: "Biên bản đã kiểm tra đủ thiết bị — chỉ chủ mới được sửa." };
    }
  }

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
  if (error) return { error: error.message };

  try {
    await capNhatTrangThaiSauKiemTra(donId, input.thiet_bi_id, input.tinh_trang);
  } catch (err) {
    return { error: `Đã lưu biên bản nhưng ${(err as Error).message}. Kiểm tra lại trạng thái thiết bị bằng tay.` };
  } finally {
    revalidatePath(`/orders/${donId}`);
    revalidatePath("/equipment");
    revalidatePath("/");
  }
  return {};
}
