"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/admin";
import { khoangNgayGiao } from "@/lib/calculations";
import type { ChangDon } from "@/lib/types";

const CHANG_KHOA_CUNG: ChangDon[] = ["bao_gia", "da_giao", "cho_tra"];

// Dùng chung ở listDonThue và getDonThue — tránh gõ trùng cấu trúc quan hệ tài chính mỗi lần select.
const QUAN_HE_TAI_CHINH = "thanh_toan(*), chi_phi(*)";

export interface KetQuaTrungLich {
  tinhTrang: "trong" | "khoa_cung" | "canh_bao_mem";
  donTrung?: { id: string; ma_don: string | null; chang: ChangDon };
}

export async function kiemTraTrungLich(
  thietBiId: string,
  ngayBatDau: string,
  ngayTraDuKien: string,
  excludeDonId?: string
): Promise<KetQuaTrungLich> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("don_thue_chi_tiet")
    .select("don_thue_id, don_thue!inner(id, ma_don, chang, ngay_bat_dau, ngay_tra_du_kien)")
    .eq("thiet_bi_id", thietBiId);
  if (error) throw new Error(error.message);

  type Row = {
    don_thue_id: string;
    don_thue: { id: string; ma_don: string | null; chang: ChangDon; ngay_bat_dau: string; ngay_tra_du_kien: string };
  };

  for (const row of (data ?? []) as unknown as Row[]) {
    const don = row.don_thue;
    if (!don || don.id === excludeDonId) continue;
    if (don.chang === "xong" || don.chang === "huy") continue;
    if (!khoangNgayGiao(ngayBatDau, ngayTraDuKien, don.ngay_bat_dau, don.ngay_tra_du_kien)) continue;

    if (CHANG_KHOA_CUNG.includes(don.chang)) {
      return { tinhTrang: "khoa_cung", donTrung: { id: don.id, ma_don: don.ma_don, chang: don.chang } };
    }
    return { tinhTrang: "canh_bao_mem", donTrung: { id: don.id, ma_don: don.ma_don, chang: don.chang } };
  }

  return { tinhTrang: "trong" };
}

export interface DauVaoTaoDonThue {
  khachHang: { ten: string; so_dien_thoai: string; nguoi_gioi_thieu?: string };
  ngay_bat_dau: string;
  ngay_tra_du_kien: string;
  ghi_chu?: string;
  thietBi: { thiet_bi_id: string; gia_thue_chot: number; phan_tram_chiet_khau: number }[];
}

export async function taoDonThue(input: DauVaoTaoDonThue): Promise<{ error?: string }> {
  if (input.ngay_tra_du_kien < input.ngay_bat_dau) {
    return { error: "Ngày trả dự kiến không được sớm hơn ngày bắt đầu thuê." };
  }

  for (const tb of input.thietBi) {
    if (tb.phan_tram_chiet_khau < 0 || tb.phan_tram_chiet_khau > 100) {
      return { error: "Chiết khấu phải nằm trong khoảng 0–100%." };
    }
    if (!tb.gia_thue_chot || tb.gia_thue_chot <= 0) {
      return { error: "Giá thuê chốt cho thiết bị phải lớn hơn 0." };
    }
  }

  const supabase = await createClient();

  for (const tb of input.thietBi) {
    const kq = await kiemTraTrungLich(tb.thiet_bi_id, input.ngay_bat_dau, input.ngay_tra_du_kien);
    if (kq.tinhTrang === "khoa_cung") {
      return {
        error: `Thiết bị không còn trống trong khoảng ngày này (đã bị giữ bởi đơn ${kq.donTrung?.ma_don ?? kq.donTrung?.id}).`,
      };
    }
  }

  // Gọi 1 hàm Postgres chạy trong 1 giao dịch — nếu lỗi giữa chừng thì tự huỷ hết,
  // không để sót khách hàng/đơn "mồ côi" (xem app/supabase/migrations/0002_tao_don_thue_transaction.sql).
  const { data: donId, error: eRpc } = await supabase.rpc("tao_don_thue", {
    p_khach_ten: input.khachHang.ten,
    p_khach_sdt: input.khachHang.so_dien_thoai,
    p_khach_nguoi_gioi_thieu: input.khachHang.nguoi_gioi_thieu || null,
    p_ngay_bat_dau: input.ngay_bat_dau,
    p_ngay_tra_du_kien: input.ngay_tra_du_kien,
    p_ghi_chu: input.ghi_chu || null,
    p_thiet_bi: input.thietBi,
  });
  if (eRpc) return { error: eRpc.message };

  revalidatePath("/orders");
  revalidatePath("/");
  // redirect() ngay trong action (thay vì router.push()+router.refresh() ở client) để
  // tránh Next tự render lại trang đang gọi action — nguyên nhân lỗi React #441 trước đây.
  redirect(`/orders/${donId}`);
}

export async function xoaThietBiKhoiDon(chiTietId: string, donId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("don_thue_chi_tiet").delete().eq("id", chiTietId);
  if (error) throw new Error(error.message);
  revalidatePath(`/orders/${donId}`);
}

const CHUYEN_TIEP: Record<ChangDon, ChangDon[]> = {
  yeu_cau: ["bao_gia", "huy"],
  bao_gia: ["da_giao", "huy"],
  da_giao: ["cho_tra"],
  cho_tra: ["xong"],
  xong: [],
  huy: [],
};

export async function chuyenChangDon(donId: string, changMoi: ChangDon) {
  const supabase = await createClient();
  const { data: don, error: eGet } = await supabase
    .from("don_thue")
    .select("chang")
    .eq("id", donId)
    .single();
  if (eGet) throw new Error(eGet.message);

  if (!CHUYEN_TIEP[don.chang as ChangDon].includes(changMoi)) {
    throw new Error(`Không thể chuyển từ chặng "${don.chang}" sang "${changMoi}".`);
  }

  if (changMoi === "xong") {
    const chiTiet = await layChiTietDon(donId);
    const { data: kiemTraList, error: eKt } = await supabase
      .from("kiem_tra_tinh_trang")
      .select("thiet_bi_id")
      .eq("don_thue_id", donId);
    if (eKt) throw new Error(eKt.message);
    const daKiem = new Set((kiemTraList ?? []).map((k) => k.thiet_bi_id));
    const thieu = chiTiet.filter((l) => !daKiem.has(l.thiet_bi_id));
    if (thieu.length > 0) {
      throw new Error("Chưa kiểm tra tình trạng đầy đủ cho tất cả thiết bị trong đơn.");
    }
  }

  const { data: updated, error } = await supabase
    .from("don_thue")
    .update({ chang: changMoi })
    .eq("id", donId)
    .eq("chang", don.chang) // chỉ ghi nếu chặng vẫn đúng như lúc vừa đọc ở trên
    .select("id");
  if (error) throw new Error(error.message);
  if (!updated || updated.length === 0) {
    throw new Error(
      "Đơn vừa bị người khác chuyển chặng trong lúc bạn thao tác. Tải lại trang và thử lại."
    );
  }

  if (changMoi === "da_giao") {
    await capNhatTrangThaiTheoThietBiTrongDon(donId, "dang_thue");
  }
  if (changMoi === "xong" || changMoi === "huy") {
    await capNhatTrangThaiTheoThietBiTrongDon(donId, "san_sang");
  }

  revalidatePath(`/orders/${donId}`);
  revalidatePath("/orders");
  revalidatePath("/");
  revalidatePath("/equipment");
}

async function capNhatTrangThaiTheoThietBiTrongDon(
  donId: string,
  trangThai: "dang_thue" | "san_sang"
) {
  const supabase = await createClient();
  const { data: lines, error: eLines } = await supabase
    .from("don_thue_chi_tiet")
    .select("thiet_bi_id")
    .eq("don_thue_id", donId);
  if (eLines) throw new Error(eLines.message);

  for (const l of lines ?? []) {
    const { error } = await supabase
      .from("thiet_bi")
      .update({ trang_thai: trangThai })
      .eq("id", l.thiet_bi_id);
    if (error) {
      throw new Error(
        `Đã đổi chặng đơn nhưng cập nhật trạng thái thiết bị ${l.thiet_bi_id} thất bại: ${error.message}. Cần kiểm tra lại trạng thái các thiết bị trong đơn này bằng tay.`
      );
    }
  }
}

async function layChiTietDon(donId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("don_thue_chi_tiet")
    .select("*")
    .eq("don_thue_id", donId);
  if (error) throw new Error(error.message);
  return data;
}

export async function listDonThue(chang?: ChangDon) {
  const supabase = await createClient();
  let query = supabase
    .from("don_thue")
    .select(
      `*, khach_hang(ten, so_dien_thoai), don_thue_chi_tiet(*), ${QUAN_HE_TAI_CHINH}`
    )
    .order("created_at", { ascending: false });
  if (chang) query = query.eq("chang", chang);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getDonThue(id: string) {
  const supabase = await createClient();
  const { data: donThue, error } = await supabase
    .from("don_thue")
    .select(
      `*, khach_hang(*),
       don_thue_chi_tiet(*, thiet_bi(id, ten, ma, danh_muc)),
       ${QUAN_HE_TAI_CHINH}, coc_giay_to(*), kiem_tra_tinh_trang(*)`
    )
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return donThue;
}
