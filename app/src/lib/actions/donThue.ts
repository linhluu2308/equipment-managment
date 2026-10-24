"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/admin";
import { ghiNhatKyThayDoiDon, nguoiDungHienTaiLaChu } from "@/lib/quyenVaNhatKy";
import { khoangNgayGiao, soNgayVonDong } from "@/lib/calculations";
import type { ChangDon, CoSoTinhGiaVon, NhatKyThayDoiDon } from "@/lib/types";

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
  ngay_bat_dau_su_dung: string;
  ngay_ket_thuc_su_dung: string;
  ghi_chu?: string;
  thietBi: {
    thiet_bi_id: string;
    gia_thue_chot: number;
    phan_tram_chiet_khau: number;
    tinh_gia_von_theo?: CoSoTinhGiaVon;
  }[];
}

export async function taoDonThue(input: DauVaoTaoDonThue): Promise<{ error?: string }> {
  if (input.ngay_tra_du_kien < input.ngay_bat_dau) {
    return { error: "Ngày trả dự kiến không được sớm hơn ngày bắt đầu thuê." };
  }
  if (input.ngay_bat_dau_su_dung < input.ngay_bat_dau) {
    return { error: "Ngày bắt đầu sử dụng không thể sớm hơn ngày xuất kho." };
  }
  if (input.ngay_ket_thuc_su_dung < input.ngay_bat_dau_su_dung) {
    return { error: "Ngày kết thúc sử dụng không thể sớm hơn ngày bắt đầu sử dụng." };
  }
  if (input.ngay_tra_du_kien < input.ngay_ket_thuc_su_dung) {
    return { error: "Ngày nhập kho dự kiến không thể sớm hơn ngày kết thúc sử dụng." };
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
    p_ngay_bat_dau_su_dung: input.ngay_bat_dau_su_dung,
    p_ngay_ket_thuc_su_dung: input.ngay_ket_thuc_su_dung,
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

export interface DauVaoSuaDonThue {
  khachHang: { ten: string; so_dien_thoai: string; nguoi_gioi_thieu?: string };
  ngay_bat_dau: string;
  ngay_tra_du_kien: string;
  ngay_bat_dau_su_dung: string;
  ngay_ket_thuc_su_dung: string;
  ghi_chu?: string;
  thietBi: { id: string; gia_thue_chot: number; phan_tram_chiet_khau: number }[];
}

/**
 * Sửa chi tiết đơn (khách hàng/ngày thuê/giá-chiết khấu từng dòng/ghi chú) ở BẤT KỲ
 * chặng nào — khác với taoDonThue(), đây là sửa lại đơn đã tồn tại khi phát hiện
 * nhập sai, không phải tạo mới. Chỉ vai "chu", bắt buộc nhập lý do, ghi 1 dòng vào
 * nhat_ky_thay_doi_don chứa đúng các field thực sự đổi (giống cách suaThietBi() chỉ
 * ghi lich_su_gia khi giá đổi — ở đây mở rộng ra nhiều field hơn 1 field).
 */
export async function suaDonThue(
  donId: string,
  input: DauVaoSuaDonThue,
  lyDo: string
): Promise<{ error?: string }> {
  let nguoiSua: { ten: string; email: string };
  try {
    nguoiSua = await nguoiDungHienTaiLaChu();
  } catch (err) {
    return { error: (err as Error).message };
  }
  if (!lyDo.trim()) return { error: "Cần nhập lý do sửa đơn." };

  if (input.ngay_tra_du_kien < input.ngay_bat_dau) {
    return { error: "Ngày trả dự kiến không được sớm hơn ngày bắt đầu thuê." };
  }
  if (input.ngay_bat_dau_su_dung < input.ngay_bat_dau) {
    return { error: "Ngày bắt đầu sử dụng không thể sớm hơn ngày xuất kho." };
  }
  if (input.ngay_ket_thuc_su_dung < input.ngay_bat_dau_su_dung) {
    return { error: "Ngày kết thúc sử dụng không thể sớm hơn ngày bắt đầu sử dụng." };
  }
  if (input.ngay_tra_du_kien < input.ngay_ket_thuc_su_dung) {
    return { error: "Ngày nhập kho dự kiến không thể sớm hơn ngày kết thúc sử dụng." };
  }
  for (const tb of input.thietBi) {
    if (tb.phan_tram_chiet_khau < 0 || tb.phan_tram_chiet_khau > 100) {
      return { error: "Chiết khấu phải nằm trong khoảng 0–100%." };
    }
    if (!tb.gia_thue_chot || tb.gia_thue_chot <= 0) {
      return { error: "Giá thuê chốt cho thiết bị phải lớn hơn 0." };
    }
  }

  const supabase = createClient();
  const { data: donCu, error: eDon } = await supabase
    .from("don_thue")
    .select(
      "khach_hang_id, ngay_bat_dau, ngay_tra_du_kien, ngay_bat_dau_su_dung, ngay_ket_thuc_su_dung, ghi_chu, khach_hang(ten, so_dien_thoai, nguoi_gioi_thieu), don_thue_chi_tiet(id, gia_thue_chot, phan_tram_chiet_khau)"
    )
    .eq("id", donId)
    .single();
  if (eDon) return { error: eDon.message };

  type DonCu = {
    khach_hang_id: string;
    ngay_bat_dau: string;
    ngay_tra_du_kien: string;
    ngay_bat_dau_su_dung: string;
    ngay_ket_thuc_su_dung: string;
    ghi_chu: string | null;
    khach_hang: { ten: string; so_dien_thoai: string; nguoi_gioi_thieu: string | null } | null;
    don_thue_chi_tiet: { id: string; gia_thue_chot: number; phan_tram_chiet_khau: number }[];
  };
  const cu = donCu as unknown as DonCu;

  if (input.ngay_bat_dau !== cu.ngay_bat_dau || input.ngay_tra_du_kien !== cu.ngay_tra_du_kien) {
    // kiemTraTrungLich cần thiet_bi_id, không phải chi_tiet id — lấy lại từ DB.
    const { data: dsThietBi, error: eTb } = await supabase
      .from("don_thue_chi_tiet")
      .select("thiet_bi_id")
      .eq("don_thue_id", donId);
    if (eTb) return { error: eTb.message };
    for (const l of dsThietBi ?? []) {
      const kq = await kiemTraTrungLich(l.thiet_bi_id, input.ngay_bat_dau, input.ngay_tra_du_kien, donId);
      if (kq.tinhTrang === "khoa_cung") {
        return {
          error: `Thiết bị không còn trống trong khoảng ngày mới này (đã bị giữ bởi đơn ${kq.donTrung?.ma_don ?? kq.donTrung?.id}).`,
        };
      }
    }
  }

  const duLieuCu: Record<string, unknown> = {};
  const duLieuMoi: Record<string, unknown> = {};

  if (input.khachHang.ten !== cu.khach_hang?.ten) {
    duLieuCu.khach_ten = cu.khach_hang?.ten;
    duLieuMoi.khach_ten = input.khachHang.ten;
  }
  if (input.khachHang.so_dien_thoai !== cu.khach_hang?.so_dien_thoai) {
    duLieuCu.khach_sdt = cu.khach_hang?.so_dien_thoai;
    duLieuMoi.khach_sdt = input.khachHang.so_dien_thoai;
  }
  if ((input.khachHang.nguoi_gioi_thieu || null) !== (cu.khach_hang?.nguoi_gioi_thieu || null)) {
    duLieuCu.nguoi_gioi_thieu = cu.khach_hang?.nguoi_gioi_thieu;
    duLieuMoi.nguoi_gioi_thieu = input.khachHang.nguoi_gioi_thieu || null;
  }
  (
    [
      ["ngay_bat_dau", input.ngay_bat_dau, cu.ngay_bat_dau],
      ["ngay_tra_du_kien", input.ngay_tra_du_kien, cu.ngay_tra_du_kien],
      ["ngay_bat_dau_su_dung", input.ngay_bat_dau_su_dung, cu.ngay_bat_dau_su_dung],
      ["ngay_ket_thuc_su_dung", input.ngay_ket_thuc_su_dung, cu.ngay_ket_thuc_su_dung],
    ] as const
  ).forEach(([key, moi, cuGiaTri]) => {
    if (moi !== cuGiaTri) {
      duLieuCu[key] = cuGiaTri;
      duLieuMoi[key] = moi;
    }
  });
  if ((input.ghi_chu || null) !== (cu.ghi_chu || null)) {
    duLieuCu.ghi_chu = cu.ghi_chu;
    duLieuMoi.ghi_chu = input.ghi_chu || null;
  }
  for (const tb of input.thietBi) {
    const chiTietCu = cu.don_thue_chi_tiet.find((l) => l.id === tb.id);
    if (!chiTietCu) continue;
    if (tb.gia_thue_chot !== chiTietCu.gia_thue_chot || tb.phan_tram_chiet_khau !== chiTietCu.phan_tram_chiet_khau) {
      duLieuCu[`thiet_bi_${tb.id}`] = {
        gia_thue_chot: chiTietCu.gia_thue_chot,
        phan_tram_chiet_khau: chiTietCu.phan_tram_chiet_khau,
      };
      duLieuMoi[`thiet_bi_${tb.id}`] = {
        gia_thue_chot: tb.gia_thue_chot,
        phan_tram_chiet_khau: tb.phan_tram_chiet_khau,
      };
    }
  }

  const coThayDoi = Object.keys(duLieuMoi).length > 0;

  const { error: eKhach } = await supabase
    .from("khach_hang")
    .update({
      ten: input.khachHang.ten,
      so_dien_thoai: input.khachHang.so_dien_thoai,
      nguoi_gioi_thieu: input.khachHang.nguoi_gioi_thieu || null,
    })
    .eq("id", cu.khach_hang_id);
  if (eKhach) return { error: eKhach.message };

  const { error: eDonUpdate } = await supabase
    .from("don_thue")
    .update({
      ngay_bat_dau: input.ngay_bat_dau,
      ngay_tra_du_kien: input.ngay_tra_du_kien,
      ngay_bat_dau_su_dung: input.ngay_bat_dau_su_dung,
      ngay_ket_thuc_su_dung: input.ngay_ket_thuc_su_dung,
      ghi_chu: input.ghi_chu || null,
    })
    .eq("id", donId);
  if (eDonUpdate) return { error: eDonUpdate.message };

  for (const tb of input.thietBi) {
    const { error: eLine } = await supabase
      .from("don_thue_chi_tiet")
      .update({ gia_thue_chot: tb.gia_thue_chot, phan_tram_chiet_khau: tb.phan_tram_chiet_khau })
      .eq("id", tb.id);
    if (eLine) return { error: eLine.message };
  }

  if (coThayDoi) {
    await ghiNhatKyThayDoiDon(donId, nguoiSua, "sua", lyDo.trim(), duLieuCu, duLieuMoi);
  }

  revalidatePath(`/orders/${donId}`);
  revalidatePath("/orders");
  revalidatePath("/");
  return {};
}

/**
 * Xoá mềm đơn nhập sai — không xoá cứng vì đơn có thể đã phát sinh thanh toán/chi
 * phí cần giữ lại để đối chiếu. Nếu đơn đang ở chặng "Đã giao"/"Chờ trả" (thiết bị
 * thực sự đang ở ngoài), tự trả thiết bị liên quan về "Sẵn sàng". Nếu đơn đã ở chặng
 * "Xong" (đã phát sinh công nợ NCC), xoá luôn các dòng nợ "no_phat_sinh" gắn với
 * đơn này — tránh treo nợ sai trên sổ công nợ nhà cung cấp sau khi đơn bị xoá.
 */
export async function xoaDonThue(donId: string, lyDo: string): Promise<{ error?: string }> {
  let nguoiSua: { ten: string; email: string };
  try {
    nguoiSua = await nguoiDungHienTaiLaChu();
  } catch (err) {
    return { error: (err as Error).message };
  }
  if (!lyDo.trim()) return { error: "Cần nhập lý do xoá đơn." };

  const supabase = createClient();
  const { data: don, error: eDon } = await supabase.from("don_thue").select("chang, da_xoa").eq("id", donId).single();
  if (eDon) return { error: eDon.message };
  if (don.da_xoa) return { error: "Đơn này đã bị xoá rồi." };

  const { error } = await supabase
    .from("don_thue")
    .update({ da_xoa: true, xoa_luc: new Date().toISOString(), xoa_boi: nguoiSua.ten })
    .eq("id", donId);
  if (error) return { error: error.message };

  if (don.chang === "da_giao" || don.chang === "cho_tra") {
    await capNhatTrangThaiTheoThietBiTrongDon(donId, "san_sang");
  }

  let soDongNoDaXoa = 0;
  if (don.chang === "xong") {
    const { data: xoaNo, error: eXoaNo } = await supabase
      .from("giao_dich_cong_no_ncc")
      .delete()
      .eq("don_thue_id", donId)
      .eq("loai", "no_phat_sinh")
      .select("id");
    if (eXoaNo) {
      return {
        error: `Đã xoá đơn nhưng xoá công nợ NCC liên quan thất bại: ${eXoaNo.message}. Cần kiểm tra lại bằng tay ở trang Nhà cung cấp.`,
      };
    }
    soDongNoDaXoa = xoaNo?.length ?? 0;
  }

  await ghiNhatKyThayDoiDon(
    donId,
    nguoiSua,
    "xoa",
    lyDo.trim(),
    { chang: don.chang, so_dong_no_ncc_da_xoa: soDongNoDaXoa || undefined },
    null
  );

  revalidatePath(`/orders/${donId}`);
  revalidatePath("/orders");
  revalidatePath("/");
  if (don.chang === "da_giao" || don.chang === "cho_tra") revalidatePath("/equipment");
  if (soDongNoDaXoa > 0) revalidatePath("/suppliers");
  return {};
}

/**
 * Khôi phục đơn đã xoá mềm — không tự giữ lại thiết bị, chủ tự xử lý nếu có xung đột
 * lịch. Nếu đơn đang ở chặng "Xong" (nghĩa là công nợ NCC đã bị xoá lúc xoá đơn),
 * phát sinh lại công nợ NCC tương ứng để đồng bộ với trạng thái trước khi xoá.
 */
export async function khoiPhucDonThue(donId: string, lyDo: string): Promise<{ error?: string }> {
  let nguoiSua: { ten: string; email: string };
  try {
    nguoiSua = await nguoiDungHienTaiLaChu();
  } catch (err) {
    return { error: (err as Error).message };
  }
  if (!lyDo.trim()) return { error: "Cần nhập lý do khôi phục đơn." };

  const supabase = createClient();
  const { data: don, error: eDon } = await supabase.from("don_thue").select("chang").eq("id", donId).single();
  if (eDon) return { error: eDon.message };

  const { error } = await supabase
    .from("don_thue")
    .update({ da_xoa: false, xoa_luc: null, xoa_boi: null })
    .eq("id", donId);
  if (error) return { error: error.message };

  if (don.chang === "xong") {
    try {
      await phatSinhCongNoNccChoDon(donId);
    } catch (err) {
      return {
        error: `Đã khôi phục đơn nhưng phát sinh lại công nợ NCC thất bại: ${(err as Error).message}. Cần kiểm tra lại bằng tay ở trang Nhà cung cấp.`,
      };
    }
  }

  await ghiNhatKyThayDoiDon(donId, nguoiSua, "khoi_phuc", lyDo.trim(), null, null);

  revalidatePath(`/orders/${donId}`);
  revalidatePath("/orders");
  revalidatePath("/");
  if (don.chang === "xong") revalidatePath("/suppliers");
  return {};
}

export async function getLichSuThayDoiDon(donId: string): Promise<NhatKyThayDoiDon[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("nhat_ky_thay_doi_don")
    .select("*")
    .eq("don_thue_id", donId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as NhatKyThayDoiDon[];
}

export async function listDonThueDaXoa() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("don_thue")
    .select(`*, khach_hang(ten, so_dien_thoai), don_thue_chi_tiet(*), ${QUAN_HE_TAI_CHINH}`)
    .eq("da_xoa", true)
    .order("xoa_luc", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Ghi ngày trả thực tế cho MỘT thiết bị trong đơn — dùng khi chỉ vài thiết bị
 * trả sớm/trễ hơn báo giá, không phải cả đơn. Sửa được trong lúc đơn đang ở
 * chặng "Đã giao"/"Chờ trả" (trước khi chốt "Xong"), giống lúc ghi biên bản
 * kiểm tra tình trạng khi trả.
 */
export async function capNhatNgayTraThucTeDong(donId: string, thietBiId: string, ngay: string) {
  const supabase = await createClient();
  const { data: don, error: eDon } = await supabase
    .from("don_thue")
    .select("ngay_bat_dau")
    .eq("id", donId)
    .single();
  if (eDon) throw new Error(eDon.message);
  if (ngay < don.ngay_bat_dau) {
    throw new Error("Ngày trả thực tế không thể sớm hơn ngày bắt đầu thuê.");
  }

  const { error } = await supabase
    .from("don_thue_chi_tiet")
    .update({ ngay_tra_thuc_te: ngay })
    .eq("don_thue_id", donId)
    .eq("thiet_bi_id", thietBiId);
  if (error) throw new Error(error.message);
  revalidatePath(`/orders/${donId}`);
}

/**
 * Áp dụng cùng 1 ngày trả thực tế cho TẤT CẢ thiết bị trong đơn — tiện cho
 * trường hợp cả đơn trả cùng lúc, đỡ phải nhập từng dòng.
 */
export async function apDungNgayTraThucTeChoTatCa(donId: string, ngay: string) {
  const supabase = await createClient();
  const { data: don, error: eDon } = await supabase
    .from("don_thue")
    .select("ngay_bat_dau")
    .eq("id", donId)
    .single();
  if (eDon) throw new Error(eDon.message);
  if (ngay < don.ngay_bat_dau) {
    throw new Error("Ngày trả thực tế không thể sớm hơn ngày bắt đầu thuê.");
  }

  const { error } = await supabase.from("don_thue_chi_tiet").update({ ngay_tra_thuc_te: ngay }).eq("don_thue_id", donId);
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
    .select("chang, ngay_bat_dau, ngay_tra_du_kien")
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
  if (changMoi === "xong") {
    await phatSinhCongNoNccChoDon(donId);
  }

  revalidatePath(`/orders/${donId}`);
  revalidatePath("/orders");
  revalidatePath("/");
  revalidatePath("/equipment");
  revalidatePath("/suppliers");
}

/**
 * Khi đơn hoàn tất, tự ghi nợ nhà cung cấp cho từng dòng thiết bị "thuê ngoài"
 * trong đơn: nợ = gia_von (VND/ngày) × số ngày tính giá vốn của riêng thiết bị đó.
 * Tuỳ tinh_gia_von_theo trên dòng chi tiết: 'ngay_di_chuyen' (mặc định) = số ngày
 * logistics (ngay_bat_dau → ngay_tra_thuc_te/ngay_tra_du_kien), hoặc 'ngay_su_dung'
 * = đúng số ngày khách sử dụng của cả đơn — tuỳ quy ước tính tiền của từng NCC. Dùng
 * upsert + ignoreDuplicates trên unique(don_thue_id, thiet_bi_id) để không ghi
 * trùng nếu chuyenChangDon() lỡ chạy lại cho cùng 1 đơn.
 */
async function phatSinhCongNoNccChoDon(donId: string) {
  const supabase = await createClient();

  const { data: don, error: eDon } = await supabase
    .from("don_thue")
    .select("ngay_bat_dau, ngay_tra_du_kien, ngay_bat_dau_su_dung, ngay_ket_thuc_su_dung")
    .eq("id", donId)
    .single();
  if (eDon) throw new Error(eDon.message);

  const { data: chiTiet, error: eChiTiet } = await supabase
    .from("don_thue_chi_tiet")
    .select("thiet_bi_id, ngay_tra_thuc_te, tinh_gia_von_theo, thiet_bi(nguon_goc, nha_cung_cap_id, gia_von)")
    .eq("don_thue_id", donId);
  if (eChiTiet) throw new Error(eChiTiet.message);

  type Dong = {
    thiet_bi_id: string;
    ngay_tra_thuc_te: string | null;
    tinh_gia_von_theo: CoSoTinhGiaVon;
    thiet_bi: { nguon_goc: string; nha_cung_cap_id: string | null; gia_von: number | null } | null;
  };

  const rows = (chiTiet as unknown as Dong[])
    .filter((d) => d.thiet_bi?.nguon_goc === "thue_ngoai" && d.thiet_bi.nha_cung_cap_id && d.thiet_bi.gia_von)
    .map((d) => ({
      nha_cung_cap_id: d.thiet_bi!.nha_cung_cap_id!,
      loai: "no_phat_sinh" as const,
      so_tien: d.thiet_bi!.gia_von! * soNgayVonDong(don, d),
      don_thue_id: donId,
      thiet_bi_id: d.thiet_bi_id,
    }));

  if (rows.length === 0) return;

  const { error } = await supabase
    .from("giao_dich_cong_no_ncc")
    .upsert(rows, { onConflict: "don_thue_id,thiet_bi_id", ignoreDuplicates: true });
  if (error) {
    throw new Error(
      `Đã hoàn tất đơn nhưng ghi công nợ nhà cung cấp thất bại: ${error.message}. Cần kiểm tra lại bằng tay ở trang Nhà cung cấp.`
    );
  }
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
    .eq("da_xoa", false)
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
