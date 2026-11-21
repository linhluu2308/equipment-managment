"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/admin";
import { ghiNhatKyRoiThucHien, nguoiDungHienTai, nguoiDungHienTaiLaChu } from "@/lib/quyenVaNhatKy";
import { chuyenVaoThungRac, driveDaCauHinh, taiFileLen, thuMucCuaDon } from "@/lib/googleDrive";
import { LOAI_ANH_LABEL, type ChangDon, type LoaiAnhThietBi } from "@/lib/types";

/** Ảnh đã được nén ở trình duyệt (~1600px, JPEG) nên thực tế chỉ vài trăm KB. */
const DUNG_LUONG_TOI_DA = 4 * 1024 * 1024;

/**
 * Chặng được tải ảnh. Xuất kho: lúc chuẩn bị giao (Báo giá) và đã giao. Nhận về: lúc
 * khách trả (Đã giao / Chờ thanh toán). Chủ được bổ sung ảnh ở mọi chặng từ Báo giá
 * đến Xong (vd quên chụp lúc nhận về).
 */
const CHANG_CHO_PHEP: Record<LoaiAnhThietBi, ChangDon[]> = {
  xuat_kho: ["bao_gia", "da_giao"],
  nhan_ve: ["da_giao", "cho_tra"],
};
const CHANG_CHU_BO_SUNG: ChangDon[] = ["bao_gia", "da_giao", "cho_tra", "xong"];

function gioVietNam(d: Date): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
      .formatToParts(d)
      .map((x) => [x.type, x.value])
  );
  return `${p.year}${p.month}${p.day}-${p.hour}${p.minute}${p.second}`;
}

/** Bỏ ký tự không hợp lệ trong tên file/thư mục Drive. */
function tenAnToan(s: string): string {
  return s.replace(/[\\/:*?"<>|\r\n]+/g, "-").trim().slice(0, 80);
}

/** Tải 1 ảnh của 1 thiết bị trong đơn lên Google Drive. FormData: donId, thietBiId, loai, file. */
export async function taiAnhThietBi(formData: FormData): Promise<{ error?: string }> {
  const donId = String(formData.get("donId") ?? "");
  const thietBiId = String(formData.get("thietBiId") ?? "");
  const loai = String(formData.get("loai") ?? "") as LoaiAnhThietBi;
  const file = formData.get("file");

  if (!donId || !thietBiId || !(loai in CHANG_CHO_PHEP)) return { error: "Thiếu thông tin ảnh." };
  if (!(file instanceof File) || file.size === 0) return { error: "Không nhận được file ảnh." };
  if (!file.type.startsWith("image/")) return { error: "File không phải ảnh." };
  if (file.size > DUNG_LUONG_TOI_DA) return { error: "Ảnh quá lớn (tối đa 4MB sau khi nén)." };
  if (!driveDaCauHinh()) return { error: "Chưa kết nối Google Drive — liên hệ quản trị viên." };

  let nguoi: { ten: string; email: string; laChu: boolean };
  try {
    nguoi = await nguoiDungHienTai();
  } catch (err) {
    return { error: (err as Error).message };
  }

  const supabase = createClient();
  const { data: don, error: eDon } = await supabase
    .from("don_thue")
    .select("id, ma_don, chang, da_xoa, ngay_bat_dau, khach_hang(ten)")
    .eq("id", donId)
    .single();
  if (eDon) return { error: eDon.message };
  const chang = don.chang as ChangDon;
  const duocTai = nguoi.laChu ? CHANG_CHU_BO_SUNG.includes(chang) : CHANG_CHO_PHEP[loai].includes(chang);
  if (don.da_xoa || !duocTai) {
    return { error: `Đơn đang ở chặng không cho tải ảnh "${LOAI_ANH_LABEL[loai]}".` };
  }

  const { data: dong, error: eDong } = await supabase
    .from("don_thue_chi_tiet")
    .select("thiet_bi(ma, ten)")
    .eq("don_thue_id", donId)
    .eq("thiet_bi_id", thietBiId)
    .limit(1)
    .maybeSingle();
  if (eDong) return { error: eDong.message };
  if (!dong) return { error: "Thiết bị không còn trong đơn này." };

  const thietBi = dong.thiet_bi as unknown as { ma: string | null; ten: string } | null;
  const khach = don.khach_hang as unknown as { ten: string } | null;
  const maDon = don.ma_don ?? don.id.slice(0, 8).toUpperCase();
  const tenThuMucDon = tenAnToan(`Đơn ${maDon} – ${khach?.ten ?? "Khách"}`);
  const tienTo = loai === "xuat_kho" ? "XuatKho" : "NhanVe";
  const tenFile = `${tienTo}_${tenAnToan(thietBi?.ma || thietBi?.ten || "thiet-bi")}_${gioVietNam(new Date())}-${crypto
    .randomUUID()
    .slice(0, 4)}.jpg`;

  let fileId: string;
  try {
    const thuMuc = await thuMucCuaDon(String(don.ngay_bat_dau).slice(0, 7), tenThuMucDon);
    fileId = await taiFileLen(thuMuc, tenFile, file.type, await file.arrayBuffer());
  } catch (err) {
    return { error: (err as Error).message };
  }

  const { error } = await supabase.from("anh_thiet_bi_trong_don").insert({
    don_thue_id: donId,
    thiet_bi_id: thietBiId,
    loai,
    drive_file_id: fileId,
    ten_file: tenFile,
    nguoi_tai: nguoi.ten,
    nguoi_tai_email: nguoi.email,
  });
  if (error) {
    // Không để file "mồ côi" trên Drive mà app không biết tới.
    await chuyenVaoThungRac(fileId).catch(() => {});
    return {
      error: error.message.includes("anh_thiet_bi_trong_don")
        ? "Chưa chạy migration 0020 (bảng ảnh thiết bị) trong Supabase."
        : error.message,
    };
  }

  revalidatePath(`/orders/${donId}`);
  return {};
}

/** Chủ xoá 1 ảnh (bắt buộc lý do, ghi nhật ký). File trên Drive chuyển vào Thùng rác. */
export async function xoaAnhThietBi(anhId: string, lyDo: string): Promise<{ error?: string }> {
  if (!lyDo.trim()) return { error: "Cần nhập lý do xoá ảnh." };
  let chu: { ten: string; email: string };
  try {
    chu = await nguoiDungHienTaiLaChu();
  } catch (err) {
    return { error: (err as Error).message };
  }

  const supabase = createClient();
  const { data: anh, error: eAnh } = await supabase
    .from("anh_thiet_bi_trong_don")
    .select("*, thiet_bi(ten)")
    .eq("id", anhId)
    .single();
  if (eAnh) return { error: eAnh.message };

  const res = await ghiNhatKyRoiThucHien(
    anh.don_thue_id,
    chu,
    "xoa_anh_thiet_bi",
    lyDo.trim(),
    {
      thiet_bi: (anh.thiet_bi as { ten: string } | null)?.ten ?? null,
      loai: LOAI_ANH_LABEL[anh.loai as LoaiAnhThietBi],
      ten_file: anh.ten_file,
      nguoi_tai: anh.nguoi_tai,
      tai_luc: anh.created_at,
    },
    null,
    "Chưa chạy migration 0020 trong Supabase — chưa xoá được ảnh.",
    () => supabase.from("anh_thiet_bi_trong_don").delete().eq("id", anhId)
  );
  if (res.error) return res;

  // Đã xoá khỏi app; Drive lỗi thì file chỉ còn sót trong thư mục, không ảnh hưởng dữ liệu.
  await chuyenVaoThungRac(anh.drive_file_id).catch((err) =>
    console.error(`Không chuyển được ảnh ${anh.drive_file_id} vào Thùng rác Drive:`, err)
  );
  return {};
}
