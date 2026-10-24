// Cập nhật thiet_bi.trang_thai theo vòng đời đơn thuê — dùng chung cho donThue.ts và
// kiemTra.ts. CỐ Ý không "use server" (xem lý do ở quyenVaNhatKy.ts).
//
// Quy tắc: thiết bị về kho ngay khi có biên bản kiểm tra khi trả (Tốt/Trầy xước →
// Sẵn sàng, Hỏng hóc → Hỏng), không đợi đơn chốt "Xong". Không bao giờ ghi đè khi:
// thiết bị đã thanh lý, hoặc đang bị một đơn KHÁC giữ thật sự (Đã giao/Chờ thanh toán,
// chưa kiểm tra trả) — tránh nhả nhầm thiết bị đang nằm ở đơn khác.
import { createClient } from "@/lib/supabase/admin";
import type { TinhTrangThietBi } from "@/lib/types";

async function dangBiDonKhacGiu(thietBiId: string, donId: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("don_thue_chi_tiet")
    .select("don_thue_id, don_thue!inner(chang, da_xoa)")
    .eq("thiet_bi_id", thietBiId)
    .neq("don_thue_id", donId);
  if (error) throw new Error(error.message);

  type Row = { don_thue_id: string; don_thue: { chang: string; da_xoa: boolean } };
  const donDangGiu = ((data ?? []) as unknown as Row[])
    .filter((r) => (r.don_thue.chang === "da_giao" || r.don_thue.chang === "cho_tra") && !r.don_thue.da_xoa)
    .map((r) => r.don_thue_id);
  if (donDangGiu.length === 0) return false;

  const { data: kt, error: eKt } = await supabase
    .from("kiem_tra_tinh_trang")
    .select("don_thue_id")
    .eq("thiet_bi_id", thietBiId)
    .in("don_thue_id", donDangGiu);
  if (eKt) throw new Error(eKt.message);
  const daTra = new Set((kt ?? []).map((k) => k.don_thue_id));
  return donDangGiu.some((id) => !daTra.has(id));
}

async function datTrangThai(thietBiId: string, trangThai: string) {
  const { error } = await createClient().from("thiet_bi").update({ trang_thai: trangThai }).eq("id", thietBiId);
  if (error) throw new Error(`Cập nhật trạng thái thiết bị ${thietBiId} thất bại: ${error.message}`);
}

async function layTrangThai(thietBiId: string): Promise<string | null> {
  const { data } = await createClient().from("thiet_bi").select("trang_thai").eq("id", thietBiId).single();
  return data?.trang_thai ?? null;
}

/** Sau khi ghi/sửa biên bản kiểm tra của 1 thiết bị trong đơn: đưa thiết bị về kho theo kết quả. */
export async function capNhatTrangThaiSauKiemTra(donId: string, thietBiId: string, tinhTrang: TinhTrangThietBi) {
  const hienTai = await layTrangThai(thietBiId);
  if (!hienTai || hienTai === "thanh_ly") return;
  if (await dangBiDonKhacGiu(thietBiId, donId)) return;
  const moi = tinhTrang === "hong" ? "hong" : "san_sang";
  if (hienTai !== moi) await datTrangThai(thietBiId, moi);
}

/** Áp lại trạng thái theo toàn bộ biên bản của đơn (dùng khi chốt "Xong", gồm cả đơn kiểm tra trước khi có quy tắc này). */
export async function capNhatTrangThaiTheoBienBanCuaDon(donId: string) {
  const { data, error } = await createClient()
    .from("kiem_tra_tinh_trang")
    .select("thiet_bi_id, tinh_trang")
    .eq("don_thue_id", donId);
  if (error) throw new Error(error.message);
  for (const k of data ?? []) await capNhatTrangThaiSauKiemTra(donId, k.thiet_bi_id, k.tinh_trang as TinhTrangThietBi);
}

/**
 * Huỷ/xoá đơn: nhả các thiết bị CHƯA kiểm tra trả của đơn về "Sẵn sàng" — chỉ khi đang
 * "Đang thuê" và không bị đơn khác giữ (không đè trạng thái Hỏng/Thanh lý đặt tay).
 */
export async function nhaThietBiChuaKiemTraCuaDon(donId: string) {
  const supabase = createClient();
  const [{ data: lines, error: e1 }, { data: kt, error: e2 }] = await Promise.all([
    supabase.from("don_thue_chi_tiet").select("thiet_bi_id").eq("don_thue_id", donId),
    supabase.from("kiem_tra_tinh_trang").select("thiet_bi_id").eq("don_thue_id", donId),
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);
  const daKiem = new Set((kt ?? []).map((k) => k.thiet_bi_id));

  for (const l of lines ?? []) {
    if (daKiem.has(l.thiet_bi_id)) continue;
    if ((await layTrangThai(l.thiet_bi_id)) !== "dang_thue") continue;
    if (await dangBiDonKhacGiu(l.thiet_bi_id, donId)) continue;
    await datTrangThai(l.thiet_bi_id, "san_sang");
  }
}

/** Đơn đã có biên bản kiểm tra cho MỌI thiết bị chưa — đủ rồi thì biên bản + ngày trả bị khoá, chỉ chủ sửa. */
export async function bienBanDaDu(donId: string): Promise<boolean> {
  const supabase = createClient();
  const [{ data: lines, error: e1 }, { data: kt, error: e2 }] = await Promise.all([
    supabase.from("don_thue_chi_tiet").select("thiet_bi_id").eq("don_thue_id", donId),
    supabase.from("kiem_tra_tinh_trang").select("thiet_bi_id").eq("don_thue_id", donId),
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);
  const daKiem = new Set((kt ?? []).map((k) => k.thiet_bi_id));
  return (lines ?? []).length > 0 && (lines ?? []).every((l) => daKiem.has(l.thiet_bi_id));
}
