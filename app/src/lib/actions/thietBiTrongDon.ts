"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/admin";
import { ghiNhatKyThayDoiDon, nguoiDungHienTai } from "@/lib/quyenVaNhatKy";
import { kiemTraTrungLich } from "@/lib/actions/donThue";
import { khoangSuDungDong, loiChietKhau, ngayXuatKhoDong, soNgaySuDungDong, tienDong } from "@/lib/calculations";
import { capNhatTrangThaiSauKiemTra, datDangThue, nhaMotThietBi } from "@/lib/trangThaiThietBi";
import type { ChangDon, CoSoTinhGiaVon, HanhDongThayDoiDon, TinhTrangThietBi } from "@/lib/types";

/*
 * Thêm/bớt thiết bị trong hành trình đơn (đã chốt với user 2026-10-24):
 *  - Yêu cầu/Báo giá: mọi người thêm/bỏ thiết bị, theo ngày của cả đơn.
 *  - Đã giao: mọi người thuê thêm (có ngày giao riêng, tính tiền theo số ngày riêng)
 *    và trả sớm (tính tiền tới ngày thực dùng). Bỏ hẳn dòng: chỉ chủ, có lý do.
 *  - Chờ thanh toán: chỉ chủ bỏ dòng để đính chính, có lý do. Xong/Huỷ: khoá.
 * Mọi thao tác ghi nhật ký đơn TRƯỚC khi đổi dữ liệu (cần migration 0017).
 */

const LOI_CHUA_CHAY_MIGRATION =
  "Chưa chạy migration 0017_them_bot_thiet_bi_trong_don.sql trong Supabase SQL Editor — chưa thay đổi gì.";

type DonCoBan = {
  chang: ChangDon;
  da_xoa: boolean;
  ngay_bat_dau: string;
  ngay_tra_du_kien: string;
  ngay_bat_dau_su_dung: string;
  ngay_ket_thuc_su_dung: string;
};

async function layDon(donId: string): Promise<DonCoBan | null> {
  const { data } = await createClient()
    .from("don_thue")
    .select("chang, da_xoa, ngay_bat_dau, ngay_tra_du_kien, ngay_bat_dau_su_dung, ngay_ket_thuc_su_dung")
    .eq("id", donId)
    .single();
  return (data as DonCoBan | null) ?? null;
}

async function ghiNhatKy(
  donId: string,
  nguoi: { ten: string; email: string },
  hanhDong: HanhDongThayDoiDon,
  lyDo: string,
  cu: Record<string, unknown> | null,
  moi: Record<string, unknown> | null
): Promise<{ id?: string; error?: string }> {
  try {
    return { id: await ghiNhatKyThayDoiDon(donId, nguoi, hanhDong, lyDo, cu, moi) };
  } catch (err) {
    const msg = (err as Error).message;
    return { error: msg.includes("hanh_dong_check") ? LOI_CHUA_CHAY_MIGRATION : msg };
  }
}

async function xoaNhatKy(id: string) {
  await createClient().from("nhat_ky_thay_doi_don").delete().eq("id", id);
}

function revalidateDon(donId: string) {
  revalidatePath(`/orders/${donId}`);
  revalidatePath("/orders");
  revalidatePath("/");
  revalidatePath("/equipment");
  revalidatePath("/calendar");
}

export interface DauVaoThemThietBi {
  thietBi: {
    thiet_bi_id: string;
    gia_thue_chot: number;
    phan_tram_chiet_khau: number;
    tien_chiet_khau_ngay?: number;
    tinh_gia_von_theo?: CoSoTinhGiaVon;
  }[];
  /** Chỉ dùng khi đơn đã giao: ngày giao thêm và ngày bắt đầu tính tiền của các thiết bị thêm. */
  ngay_giao?: string;
  ngay_bat_dau_su_dung?: string;
}

export async function themThietBiVaoDon(donId: string, input: DauVaoThemThietBi): Promise<{ error?: string }> {
  let nguoi: { ten: string; email: string };
  try {
    nguoi = await nguoiDungHienTai();
  } catch (err) {
    return { error: (err as Error).message };
  }
  if (input.thietBi.length === 0) return { error: "Cần chọn ít nhất một thiết bị." };
  for (const tb of input.thietBi) {
    if (!tb.gia_thue_chot || tb.gia_thue_chot <= 0) return { error: "Giá thuê phải lớn hơn 0." };
    const loiCk = loiChietKhau(tb);
    if (loiCk) return { error: loiCk };
  }

  const don = await layDon(donId);
  if (!don) return { error: "Không tìm thấy đơn." };
  if (don.da_xoa) return { error: "Đơn đã bị xoá." };
  const dangGiao = don.chang === "da_giao";
  if (!dangGiao && don.chang !== "yeu_cau" && don.chang !== "bao_gia") {
    return { error: "Chỉ thêm được thiết bị khi đơn ở chặng Yêu cầu, Báo giá hoặc Đã giao." };
  }

  // Ngày riêng: chỉ lưu khi khác ngày của cả đơn (NULL = theo đơn).
  let ngayXuatKho: string | null = null;
  let ngayBatDauSuDung: string | null = null;
  if (dangGiao) {
    const ngayGiao = input.ngay_giao || "";
    const batDauSd = input.ngay_bat_dau_su_dung || ngayGiao;
    if (!ngayGiao) return { error: "Cần chọn ngày giao thêm." };
    if (ngayGiao < don.ngay_bat_dau || ngayGiao > don.ngay_tra_du_kien) {
      return { error: "Ngày giao thêm phải nằm trong khoảng ngày xuất/nhập kho của đơn." };
    }
    if (batDauSd < ngayGiao) return { error: "Ngày bắt đầu sử dụng không thể sớm hơn ngày giao thêm." };
    if (batDauSd > don.ngay_ket_thuc_su_dung) {
      return { error: "Ngày bắt đầu sử dụng không thể sau ngày kết thúc sử dụng của đơn." };
    }
    ngayXuatKho = ngayGiao !== don.ngay_bat_dau ? ngayGiao : null;
    ngayBatDauSuDung = batDauSd > don.ngay_bat_dau_su_dung ? batDauSd : null;
  }

  const supabase = createClient();
  const ids = input.thietBi.map((t) => t.thiet_bi_id);
  const [{ data: daCo }, { data: dsThietBi }] = await Promise.all([
    supabase.from("don_thue_chi_tiet").select("thiet_bi_id").eq("don_thue_id", donId).in("thiet_bi_id", ids),
    supabase.from("thiet_bi").select("id, ten, trang_thai").in("id", ids),
  ]);
  if ((daCo ?? []).length > 0) return { error: "Có thiết bị đã nằm trong đơn này rồi." };
  const tenTheoId = new Map((dsThietBi ?? []).map((t) => [t.id, t.ten as string]));
  const hongHoacThanhLy = (dsThietBi ?? []).find((t) => t.trang_thai === "hong" || t.trang_thai === "thanh_ly");
  if (hongHoacThanhLy) return { error: `Thiết bị "${hongHoacThanhLy.ten}" đang Hỏng/Đã thanh lý, không cho thuê được.` };

  const batDauGiu = ngayXuatKho || don.ngay_bat_dau;
  for (const tb of input.thietBi) {
    const kq = await kiemTraTrungLich(tb.thiet_bi_id, batDauGiu, don.ngay_tra_du_kien, donId);
    if (kq.tinhTrang === "khoa_cung") {
      return {
        error: `"${tenTheoId.get(tb.thiet_bi_id)}" đã bị giữ bởi đơn ${kq.donTrung?.ma_don ?? kq.donTrung?.id.slice(0, 8).toUpperCase()} trong khoảng ngày này.`,
      };
    }
  }

  const rows = input.thietBi.map((tb) => ({
    don_thue_id: donId,
    thiet_bi_id: tb.thiet_bi_id,
    gia_thue_chot: tb.gia_thue_chot,
    phan_tram_chiet_khau: tb.phan_tram_chiet_khau,
    tien_chiet_khau_ngay: tb.tien_chiet_khau_ngay ?? 0,
    tinh_gia_von_theo: tb.tinh_gia_von_theo ?? "ngay_di_chuyen",
    ngay_xuat_kho: ngayXuatKho,
    ngay_bat_dau_su_dung: ngayBatDauSuDung,
  }));
  const tongThem = rows.reduce((s, r) => s + tienDong(don, r), 0);

  const nk = await ghiNhatKy(donId, nguoi, "them_thiet_bi", dangGiao ? "Khách thuê thêm thiết bị" : "Thêm thiết bị vào đơn", null, {
    thiet_bi: rows.map((r) => tenTheoId.get(r.thiet_bi_id)).join(", "),
    ...(dangGiao ? { ngay_giao: batDauGiu, ngay_bat_dau_su_dung: khoangSuDungDong(don, rows[0]).tu } : {}),
    so_tien: tongThem,
  });
  if (nk.error) return { error: nk.error };

  const { error } = await supabase.from("don_thue_chi_tiet").insert(rows);
  if (error) {
    await xoaNhatKy(nk.id!);
    return { error: error.code === "23505" ? error.message : `Thêm thiết bị thất bại: ${error.message}` };
  }

  try {
    if (dangGiao) await datDangThue(ids);
  } catch (err) {
    return { error: `Đã thêm thiết bị nhưng ${(err as Error).message}. Kiểm tra lại trạng thái thiết bị bằng tay.` };
  } finally {
    revalidateDon(donId);
  }
  return {};
}

/**
 * Bỏ hẳn 1 dòng thiết bị khỏi đơn. Yêu cầu/Báo giá: mọi người. Đã giao/Chờ thanh
 * toán: chỉ chủ, bắt buộc lý do (khách đổi ý thì dùng "Trả sớm" thay vì xoá, để
 * vẫn tính tiền những ngày đã dùng). Không cho bỏ thiết bị cuối cùng — muốn bỏ hết
 * thì huỷ/xoá đơn.
 */
export async function boThietBiKhoiDon(donId: string, chiTietId: string, lyDo: string): Promise<{ error?: string }> {
  let nguoi: { ten: string; email: string; laChu: boolean };
  try {
    nguoi = await nguoiDungHienTai();
  } catch (err) {
    return { error: (err as Error).message };
  }

  const don = await layDon(donId);
  if (!don) return { error: "Không tìm thấy đơn." };
  if (don.da_xoa) return { error: "Đơn đã bị xoá." };
  const chuaGiao = don.chang === "yeu_cau" || don.chang === "bao_gia";
  const dangChay = don.chang === "da_giao" || don.chang === "cho_tra";
  if (!chuaGiao && !dangChay) return { error: "Đơn đã Xong/Huỷ — không bỏ thiết bị được nữa." };
  if (dangChay && !nguoi.laChu) return { error: "Đơn đã giao — chỉ chủ mới được bỏ hẳn thiết bị khỏi đơn." };
  if (dangChay && !lyDo.trim()) return { error: "Cần nhập lý do bỏ thiết bị." };

  const supabase = createClient();
  const { data: lines, error: eLines } = await supabase
    .from("don_thue_chi_tiet")
    .select("*, thiet_bi(ten)")
    .eq("don_thue_id", donId);
  if (eLines) return { error: eLines.message };
  const line = (lines ?? []).find((l) => l.id === chiTietId);
  if (!line) return { error: "Không tìm thấy thiết bị này trong đơn (có thể đã bị bỏ)." };
  if ((lines ?? []).length <= 1) return { error: "Đơn phải còn ít nhất 1 thiết bị — muốn bỏ hết thì huỷ đơn." };

  const nk = await ghiNhatKy(
    donId,
    nguoi,
    "xoa_thiet_bi",
    lyDo.trim() || "Bỏ thiết bị khỏi đơn",
    { thiet_bi: line.thiet_bi?.ten, so_tien: tienDong(don, line) },
    null
  );
  if (nk.error) return { error: nk.error };

  const { error } = await supabase.from("don_thue_chi_tiet").delete().eq("id", chiTietId);
  if (error) {
    await xoaNhatKy(nk.id!);
    return { error: error.message };
  }
  // Biên bản kiểm tra (nếu có) gắn theo đơn + thiết bị, không theo dòng — dọn luôn.
  await supabase.from("kiem_tra_tinh_trang").delete().eq("don_thue_id", donId).eq("thiet_bi_id", line.thiet_bi_id);

  try {
    if (dangChay) await nhaMotThietBi(donId, line.thiet_bi_id);
  } catch (err) {
    return { error: `Đã bỏ thiết bị nhưng ${(err as Error).message}. Kiểm tra lại trạng thái thiết bị bằng tay.` };
  } finally {
    revalidateDon(donId);
  }
  return {};
}

export interface DauVaoTraSom {
  ngay_tra: string;
  ngay_ket_thuc_su_dung: string;
  tinh_trang: TinhTrangThietBi;
  nguoi_kiem?: string;
  ghi_chu?: string;
}

/**
 * Khách trả sớm 1 thiết bị khi đơn đang giao: ghi ngày trả + ngày cuối sử dụng riêng
 * (tính tiền theo số ngày thực dùng) + biên bản kiểm tra, rồi nhả thiết bị về kho.
 */
export async function traSomThietBi(donId: string, chiTietId: string, input: DauVaoTraSom): Promise<{ error?: string }> {
  let nguoi: { ten: string; email: string };
  try {
    nguoi = await nguoiDungHienTai();
  } catch (err) {
    return { error: (err as Error).message };
  }

  const don = await layDon(donId);
  if (!don) return { error: "Không tìm thấy đơn." };
  if (don.da_xoa || don.chang !== "da_giao") return { error: "Chỉ trả sớm được khi đơn đang ở chặng Đã giao." };

  const supabase = createClient();
  const { data: line, error: eLine } = await supabase
    .from("don_thue_chi_tiet")
    .select("*, thiet_bi(ten)")
    .eq("id", chiTietId)
    .eq("don_thue_id", donId)
    .single();
  if (eLine || !line) return { error: "Không tìm thấy thiết bị này trong đơn." };

  const { data: daKiem } = await supabase
    .from("kiem_tra_tinh_trang")
    .select("id")
    .eq("don_thue_id", donId)
    .eq("thiet_bi_id", line.thiet_bi_id);
  if ((daKiem ?? []).length > 0) return { error: "Thiết bị này đã được kiểm tra trả rồi." };

  const { tu, den } = khoangSuDungDong(don, line);
  if (!input.ngay_tra || !input.ngay_ket_thuc_su_dung) return { error: "Cần chọn ngày trả và ngày cuối sử dụng." };
  if (input.ngay_tra < ngayXuatKhoDong(don, line)) return { error: "Ngày trả không thể sớm hơn ngày giao thiết bị." };
  if (input.ngay_ket_thuc_su_dung < tu) return { error: "Ngày cuối sử dụng không thể sớm hơn ngày bắt đầu sử dụng." };
  if (input.ngay_ket_thuc_su_dung > den) {
    return { error: "Ngày cuối sử dụng không thể muộn hơn ngày kết thúc sử dụng hiện tại — đây là trả sớm." };
  }
  if (input.ngay_ket_thuc_su_dung > input.ngay_tra) return { error: "Ngày cuối sử dụng không thể sau ngày trả." };

  const ketThucMoi = input.ngay_ket_thuc_su_dung < don.ngay_ket_thuc_su_dung ? input.ngay_ket_thuc_su_dung : null;
  const lineMoi = { ...line, ngay_ket_thuc_su_dung: ketThucMoi };

  const nk = await ghiNhatKy(
    donId,
    nguoi,
    "tra_som_thiet_bi",
    `Khách trả sớm ${line.thiet_bi?.ten ?? "thiết bị"}`,
    { ngay_ket_thuc_su_dung: den, so_ngay: soNgaySuDungDong(don, line), so_tien: tienDong(don, line) },
    {
      thiet_bi: line.thiet_bi?.ten,
      ngay_tra: input.ngay_tra,
      ngay_ket_thuc_su_dung: input.ngay_ket_thuc_su_dung,
      so_ngay: soNgaySuDungDong(don, lineMoi),
      so_tien: tienDong(don, lineMoi),
    }
  );
  if (nk.error) return { error: nk.error };

  const { error } = await supabase
    .from("don_thue_chi_tiet")
    .update({ ngay_tra_thuc_te: input.ngay_tra, ngay_ket_thuc_su_dung: ketThucMoi })
    .eq("id", chiTietId);
  if (error) {
    await xoaNhatKy(nk.id!);
    return { error: error.message };
  }

  const { error: eKt } = await supabase.from("kiem_tra_tinh_trang").upsert(
    {
      don_thue_id: donId,
      thiet_bi_id: line.thiet_bi_id,
      ngay_tra: input.ngay_tra,
      tinh_trang: input.tinh_trang,
      nguoi_kiem: input.nguoi_kiem || null,
      ghi_chu: input.ghi_chu || null,
    },
    { onConflict: "don_thue_id,thiet_bi_id" }
  );

  try {
    if (eKt) throw new Error(`ghi biên bản kiểm tra thất bại: ${eKt.message}`);
    await capNhatTrangThaiSauKiemTra(donId, line.thiet_bi_id, input.tinh_trang);
  } catch (err) {
    return { error: `Đã ghi trả sớm nhưng ${(err as Error).message}. Kiểm tra lại biên bản/trạng thái thiết bị.` };
  } finally {
    revalidateDon(donId);
  }
  return {};
}
