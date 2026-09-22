import { createClient } from "@/lib/supabase/admin";
import { CHANG_LABEL, type ChangDon } from "@/lib/types";

export interface SuKienLich {
  id: string;
  ngayBatDau: string;
  ngayTraDuKien: string;
  tenKhach: string;
  sdtKhach: string;
  soThietBi: number;
  chang: ChangDon;
  changLabel: string;
  capNhatLuc: string;
}

/**
 * Danh sách đơn thuê (trừ đơn đã huỷ) để build feed .ics — dùng admin client vì
 * route feed lịch không đi qua session đăng nhập (Google fetch không kèm cookie).
 */
export async function layDanhSachSuKienLich(): Promise<SuKienLich[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("don_thue")
    .select("id, chang, ngay_bat_dau, ngay_tra_du_kien, updated_at, khach_hang(ten, so_dien_thoai), don_thue_chi_tiet(id)")
    .neq("chang", "huy")
    .order("ngay_bat_dau");
  if (error) throw new Error(error.message);

  type Row = {
    id: string;
    chang: ChangDon;
    ngay_bat_dau: string;
    ngay_tra_du_kien: string;
    updated_at: string;
    khach_hang: { ten: string; so_dien_thoai: string } | null;
    don_thue_chi_tiet: { id: string }[];
  };

  return ((data ?? []) as unknown as Row[]).map((d) => ({
    id: d.id,
    ngayBatDau: d.ngay_bat_dau,
    ngayTraDuKien: d.ngay_tra_du_kien,
    tenKhach: d.khach_hang?.ten ?? "Khách chưa rõ",
    sdtKhach: d.khach_hang?.so_dien_thoai ?? "",
    soThietBi: d.don_thue_chi_tiet?.length ?? 0,
    chang: d.chang,
    changLabel: CHANG_LABEL[d.chang] ?? d.chang,
    capNhatLuc: d.updated_at,
  }));
}
