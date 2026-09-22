import { createClient } from "@/lib/supabase/admin";
import { TRANG_THAI_THIET_BI_LABEL } from "@/lib/types";

export async function layTongQuan() {
  const supabase = await createClient();
  const homNay = new Date().toISOString().slice(0, 10);

  const { data: donMo, error: e1 } = await supabase
    .from("don_thue")
    .select("*, khach_hang(ten, so_dien_thoai), don_thue_chi_tiet(id)")
    .in("chang", ["yeu_cau", "bao_gia", "da_giao", "cho_tra"])
    .order("ngay_bat_dau");
  if (e1) throw new Error(e1.message);

  const dsDonMo = donMo ?? [];

  // "Đang diễn ra" = thiết bị thực sự đang ở ngoài (đã giao/chờ trả) VÀ hôm nay nằm
  // trong dải ngày thuê. "Sắp tới" = yêu cầu/báo giá chưa tới ngày bắt đầu (chưa giao).
  // "Quá hạn" = đã giao/chờ trả nhưng đã qua ngày trả dự kiến mà chưa ai chốt về kho.
  const donDangChay = dsDonMo.filter(
    (d) =>
      (d.chang === "da_giao" || d.chang === "cho_tra") &&
      d.ngay_bat_dau <= homNay &&
      homNay <= d.ngay_tra_du_kien
  );
  const donSapToi = dsDonMo.filter(
    (d) => (d.chang === "yeu_cau" || d.chang === "bao_gia") && d.ngay_bat_dau >= homNay
  );
  const donQuaHan = dsDonMo
    .filter((d) => (d.chang === "da_giao" || d.chang === "cho_tra") && d.ngay_tra_du_kien < homNay)
    .sort((a, b) => (a.ngay_tra_du_kien < b.ngay_tra_du_kien ? -1 : 1));

  const { data: thietBi, error: e3 } = await supabase.from("thiet_bi").select("danh_muc, trang_thai");
  if (e3) throw new Error(e3.message);

  const tonKho = new Map<string, { tong: number; dangThue: number }>();
  for (const tb of thietBi ?? []) {
    const key = tb.danh_muc || "Chưa phân loại";
    const cur = tonKho.get(key) || { tong: 0, dangThue: 0 };
    cur.tong += 1;
    if (tb.trang_thai === "dang_thue") cur.dangThue += 1;
    tonKho.set(key, cur);
  }

  return {
    donDangChay,
    donSapToi,
    donQuaHan,
    tonKho: Array.from(tonKho.entries()).map(([danhMuc, s]) => ({
      danhMuc,
      tong: s.tong,
      dangThue: s.dangThue,
      conTrong: s.tong - s.dangThue,
    })),
    trangThaiLabel: TRANG_THAI_THIET_BI_LABEL,
  };
}
