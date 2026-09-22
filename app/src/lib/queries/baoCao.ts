import { createClient } from "@/lib/supabase/admin";
import { soNgayThue, thanhTienDong } from "@/lib/calculations";

export interface DongBaoCaoThietBi {
  id: string;
  ma: string | null;
  ten: string;
  danhMuc: string | null;
  luotThue: number;
  tongNgayThue: number;
  doanhThu: number;
  giaVon: number;
  loiNhuan: number;
}

/**
 * @param tuNgay/@param denNgay (YYYY-MM-DD, bao gồm 2 đầu mút) — lọc theo ngày bắt đầu
 * thuê của đơn. Bỏ trống thì lấy toàn bộ thời gian (không lọc).
 */
export async function layBaoCaoThietBi(
  tuNgay?: string,
  denNgay?: string
): Promise<{
  dong: DongBaoCaoThietBi[];
  tongDoanhThu: number;
  tongLoiNhuan: number;
  soDonHoanTat: number;
}> {
  const supabase = createClient();

  const { data: thietBiList, error: e1 } = await supabase
    .from("thiet_bi")
    .select("id, ma, ten, danh_muc, gia_von");
  if (e1) throw new Error(e1.message);

  const { data: chiTietList, error: e2 } = await supabase
    .from("don_thue_chi_tiet")
    .select("thiet_bi_id, gia_thue_chot, phan_tram_chiet_khau, don_thue!inner(id, chang, ngay_bat_dau, ngay_tra_du_kien)");
  if (e2) throw new Error(e2.message);

  type Row = {
    thiet_bi_id: string;
    gia_thue_chot: number;
    phan_tram_chiet_khau: number;
    don_thue: { id: string; chang: string; ngay_bat_dau: string; ngay_tra_du_kien: string };
  };

  const tatCaRows = (chiTietList ?? []) as unknown as Row[];
  const rows =
    tuNgay && denNgay
      ? tatCaRows.filter((r) => r.don_thue.ngay_bat_dau >= tuNgay && r.don_thue.ngay_bat_dau <= denNgay)
      : tatCaRows;
  const donHoanTatIds = new Set<string>();

  const dong: DongBaoCaoThietBi[] = (thietBiList ?? []).map((tb) => {
    const cuaThietBi = rows.filter((r) => r.thiet_bi_id === tb.id && r.don_thue.chang !== "huy");
    const luotThue = cuaThietBi.length;
    const tongNgayThue = cuaThietBi.reduce(
      (sum, r) => sum + soNgayThue(r.don_thue.ngay_bat_dau, r.don_thue.ngay_tra_du_kien),
      0
    );

    const daXong = cuaThietBi.filter((r) => r.don_thue.chang === "xong");
    const doanhThu = daXong.reduce((sum, r) => {
      donHoanTatIds.add(r.don_thue.id);
      const soNgay = soNgayThue(r.don_thue.ngay_bat_dau, r.don_thue.ngay_tra_du_kien);
      return sum + thanhTienDong(r, soNgay);
    }, 0);
    const giaVon = tb.gia_von ? tb.gia_von * daXong.length : 0;
    const loiNhuan = doanhThu - giaVon;

    return {
      id: tb.id,
      ma: tb.ma,
      ten: tb.ten,
      danhMuc: tb.danh_muc,
      luotThue,
      tongNgayThue,
      doanhThu,
      giaVon,
      loiNhuan,
    };
  });

  dong.sort((a, b) => b.loiNhuan - a.loiNhuan);

  return {
    dong,
    tongDoanhThu: dong.reduce((s, d) => s + d.doanhThu, 0),
    tongLoiNhuan: dong.reduce((s, d) => s + d.loiNhuan, 0),
    soDonHoanTat: donHoanTatIds.size,
  };
}
