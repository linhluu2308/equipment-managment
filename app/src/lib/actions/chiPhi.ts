"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/admin";
import { ghiNhatKyRoiThucHien, nguoiDungHienTaiLaChu } from "@/lib/quyenVaNhatKy";

type DuLieuChiPhi = { loai: string; mo_ta: string | null; thu_khach: number; cineb_chi: number };

/** Khách chịu: thu_khach = cineb_chi. CineB chịu: thu_khach = 0. Phụ phí không tốn gì: cineb_chi = 0. */
function loiSoTien(input: { thu_khach: number; cineb_chi: number }): string | null {
  if (!(input.thu_khach >= 0) || !(input.cineb_chi >= 0)) return "Số tiền không được âm.";
  if (input.thu_khach === 0 && input.cineb_chi === 0) return "Cần nhập ít nhất một số tiền lớn hơn 0.";
  return null;
}

export async function ghiChiPhi(
  donId: string,
  input: { loai: string; mo_ta?: string; thu_khach: number; cineb_chi: number }
): Promise<{ error?: string }> {
  const loi = loiSoTien(input);
  if (loi) return { error: loi };

  const supabase = await createClient();
  const { error } = await supabase.from("chi_phi").insert({
    don_thue_id: donId,
    loai: input.loai,
    mo_ta: input.mo_ta || null,
    thu_khach: input.thu_khach,
    cineb_chi: input.cineb_chi,
  });
  if (error) return { error: error.message };
  revalidatePath(`/orders/${donId}`);
  revalidatePath("/orders");
  revalidatePath("/reports");
  return {};
}

const TRUONG_SUA_DUOC = ["loai", "mo_ta", "thu_khach", "cineb_chi"] as const;

const LOI_CHUA_CHAY_MIGRATION =
  "Chưa chạy migration 0019_chi_phi_thu_khach_cineb_chi.sql trong Supabase SQL Editor nên chưa ghi được lịch sử — chưa thay đổi gì.";

async function layChiPhi(id: string, donId: string) {
  const { data, error } = await createClient()
    .from("chi_phi")
    .select("loai, mo_ta, thu_khach, cineb_chi")
    .eq("id", id)
    .eq("don_thue_id", donId)
    .single();
  if (error || !data) return null;
  return { ...data, thu_khach: Number(data.thu_khach), cineb_chi: Number(data.cineb_chi) } as DuLieuChiPhi;
}

/**
 * Chủ sửa một khoản chi phí đã ghi (vd khoản cũ trước migration 0019 mặc định là
 * "Khách chịu" nhưng thực ra CineB chịu). Chỉ ghi các trường thực sự đổi vào nhật ký.
 */
export async function suaChiPhi(
  id: string,
  donId: string,
  input: DuLieuChiPhi,
  lyDo: string
): Promise<{ error?: string }> {
  let nguoiSua: { ten: string; email: string };
  try {
    nguoiSua = await nguoiDungHienTaiLaChu();
  } catch (err) {
    return { error: (err as Error).message };
  }
  if (!lyDo.trim()) return { error: "Cần nhập lý do sửa chi phí." };
  const loi = loiSoTien(input);
  if (loi) return { error: loi };

  const chiPhi = await layChiPhi(id, donId);
  if (!chiPhi) return { error: "Không tìm thấy khoản chi phí này (có thể đã bị xoá)." };

  const moi: DuLieuChiPhi = { ...input, mo_ta: input.mo_ta || null };
  const cu: Record<string, unknown> = {};
  const doi: Record<string, unknown> = {};
  for (const k of TRUONG_SUA_DUOC) {
    if (chiPhi[k] !== moi[k]) {
      cu[k] = chiPhi[k];
      doi[k] = moi[k];
    }
  }
  if (Object.keys(doi).length === 0) return { error: "Không có gì thay đổi." };

  return ghiNhatKyRoiThucHien(donId, nguoiSua, "sua_chi_phi", lyDo.trim(), cu, doi, LOI_CHUA_CHAY_MIGRATION, () =>
    createClient().from("chi_phi").update(doi).eq("id", id)
  );
}

/** Chủ xoá hẳn một khoản chi phí (vd ghi trùng). Toàn bộ nội dung khoản được lưu trong nhật ký. */
export async function xoaChiPhi(id: string, donId: string, lyDo: string): Promise<{ error?: string }> {
  let nguoiSua: { ten: string; email: string };
  try {
    nguoiSua = await nguoiDungHienTaiLaChu();
  } catch (err) {
    return { error: (err as Error).message };
  }
  if (!lyDo.trim()) return { error: "Cần nhập lý do xoá chi phí." };

  const chiPhi = await layChiPhi(id, donId);
  if (!chiPhi) return { error: "Không tìm thấy khoản chi phí này (có thể đã bị xoá)." };

  return ghiNhatKyRoiThucHien(donId, nguoiSua, "xoa_chi_phi", lyDo.trim(), chiPhi, null, LOI_CHUA_CHAY_MIGRATION, () =>
    createClient().from("chi_phi").delete().eq("id", id)
  );
}
