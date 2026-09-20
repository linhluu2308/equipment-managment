import { createClient } from "@/lib/supabase/admin";
import { TRANG_THAI_THIET_BI_LABEL } from "@/lib/types";

export async function layTongQuan() {
  const supabase = await createClient();

  const { data: donDangChay, error: e1 } = await supabase
    .from("don_thue")
    .select("*, khach_hang(ten, so_dien_thoai), don_thue_chi_tiet(id)")
    .in("chang", ["bao_gia", "da_giao", "cho_tra"])
    .order("ngay_bat_dau");
  if (e1) throw new Error(e1.message);

  const { data: donSapToi, error: e2 } = await supabase
    .from("don_thue")
    .select("*, khach_hang(ten, so_dien_thoai), don_thue_chi_tiet(id)")
    .eq("chang", "yeu_cau")
    .order("ngay_bat_dau");
  if (e2) throw new Error(e2.message);

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
    donDangChay: donDangChay ?? [],
    donSapToi: donSapToi ?? [],
    tonKho: Array.from(tonKho.entries()).map(([danhMuc, s]) => ({
      danhMuc,
      tong: s.tong,
      dangThue: s.dangThue,
      conTrong: s.tong - s.dangThue,
    })),
    trangThaiLabel: TRANG_THAI_THIET_BI_LABEL,
  };
}
