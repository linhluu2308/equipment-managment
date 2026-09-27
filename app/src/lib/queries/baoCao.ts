import { createClient } from "@/lib/supabase/admin";
import { soNgayThueDong, thanhTienDong } from "@/lib/calculations";

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
  tongGiaVon: number;
  tongChiPhi: number;
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
    .select(
      "thiet_bi_id, gia_thue_chot, phan_tram_chiet_khau, ngay_tra_thuc_te, don_thue!inner(id, chang, ngay_bat_dau, ngay_tra_du_kien)"
    );
  if (e2) throw new Error(e2.message);

  const { data: chiPhiList, error: e3 } = await supabase
    .from("chi_phi")
    .select("so_tien, don_thue!inner(chang, ngay_bat_dau)");
  if (e3) throw new Error(e3.message);

  type Row = {
    thiet_bi_id: string;
    gia_thue_chot: number;
    phan_tram_chiet_khau: number;
    ngay_tra_thuc_te: string | null;
    don_thue: { id: string; chang: string; ngay_bat_dau: string; ngay_tra_du_kien: string };
  };

  const tatCaRows = (chiTietList ?? []) as unknown as Row[];
  const rows =
    tuNgay && denNgay
      ? tatCaRows.filter((r) => r.don_thue.ngay_bat_dau >= tuNgay && r.don_thue.ngay_bat_dau <= denNgay)
      : tatCaRows;
  const donHoanTatIds = new Set<string>();

  type ChiPhiRow = { so_tien: number; don_thue: { chang: string; ngay_bat_dau: string } };
  const tatCaChiPhi = (chiPhiList ?? []) as unknown as ChiPhiRow[];
  const tongChiPhi = tatCaChiPhi
    .filter(
      (c) =>
        c.don_thue.chang === "xong" &&
        (!tuNgay || !denNgay || (c.don_thue.ngay_bat_dau >= tuNgay && c.don_thue.ngay_bat_dau <= denNgay))
    )
    .reduce((sum, c) => sum + c.so_tien, 0);

  const dong: DongBaoCaoThietBi[] = (thietBiList ?? []).map((tb) => {
    const cuaThietBi = rows.filter((r) => r.thiet_bi_id === tb.id && r.don_thue.chang !== "huy");
    const luotThue = cuaThietBi.length;
    const tongNgayThue = cuaThietBi.reduce((sum, r) => sum + soNgayThueDong(r.don_thue, r), 0);

    const daXong = cuaThietBi.filter((r) => r.don_thue.chang === "xong");
    const doanhThu = daXong.reduce((sum, r) => {
      donHoanTatIds.add(r.don_thue.id);
      return sum + thanhTienDong(r, soNgayThueDong(r.don_thue, r));
    }, 0);
    const giaVon = tb.gia_von
      ? daXong.reduce((sum, r) => sum + tb.gia_von! * soNgayThueDong(r.don_thue, r), 0)
      : 0;
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

  const tongDoanhThu = dong.reduce((s, d) => s + d.doanhThu, 0);
  const tongGiaVon = dong.reduce((s, d) => s + d.giaVon, 0);

  return {
    dong,
    tongDoanhThu,
    tongGiaVon,
    tongChiPhi,
    // Lợi nhuận ròng trừ thêm chi phí phát sinh theo đơn (vận chuyển, bồi thường...) —
    // khoản này không gắn với riêng thiết bị nào nên không trừ vào loiNhuan từng dòng.
    tongLoiNhuan: tongDoanhThu - tongGiaVon - tongChiPhi,
    soDonHoanTat: donHoanTatIds.size,
  };
}
