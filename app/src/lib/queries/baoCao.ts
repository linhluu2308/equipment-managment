import { createClient } from "@/lib/supabase/admin";
import { soNgayLogisticsDong, soNgayVonDong, tienDong } from "@/lib/calculations";
import type { CoSoTinhGiaVon } from "@/lib/types";

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
  tongGiamGiaDon: number;
}> {
  const supabase = createClient();

  const { data: thietBiList, error: e1 } = await supabase
    .from("thiet_bi")
    .select("id, ma, ten, danh_muc, gia_von");
  if (e1) throw new Error(e1.message);

  const { data: chiTietList, error: e2 } = await supabase
    .from("don_thue_chi_tiet")
    .select(
      "thiet_bi_id, gia_thue_chot, phan_tram_chiet_khau, tien_chiet_khau_ngay, ngay_tra_thuc_te, tinh_gia_von_theo, ngay_xuat_kho, ngay_bat_dau_su_dung, ngay_ket_thuc_su_dung, don_thue!inner(id, chang, da_xoa, ngay_bat_dau, ngay_tra_du_kien, ngay_bat_dau_su_dung, ngay_ket_thuc_su_dung)"
    );
  if (e2) throw new Error(e2.message);

  // Giảm giá cả đơn không gắn với thiết bị nào → không trừ vào doanh thu từng thiết
  // bị, chỉ trừ ở tổng doanh thu (đơn đã xong, cùng bộ lọc ngày bắt đầu thuê).
  const { data: giamGiaList, error: e4 } = await supabase
    .from("don_thue")
    .select("giam_gia_don, ngay_bat_dau")
    .eq("chang", "xong")
    .eq("da_xoa", false)
    .gt("giam_gia_don", 0);
  if (e4) throw new Error(e4.message);
  const tongGiamGiaDon = (giamGiaList ?? [])
    .filter((d) => !tuNgay || !denNgay || (d.ngay_bat_dau >= tuNgay && d.ngay_bat_dau <= denNgay))
    .reduce((s, d) => s + Number(d.giam_gia_don), 0);

  const { data: chiPhiList, error: e3 } = await supabase
    .from("chi_phi")
    .select("so_tien, don_thue!inner(chang, da_xoa, ngay_bat_dau)");
  if (e3) throw new Error(e3.message);

  type Row = {
    thiet_bi_id: string;
    gia_thue_chot: number;
    phan_tram_chiet_khau: number;
    tien_chiet_khau_ngay: number;
    ngay_tra_thuc_te: string | null;
    tinh_gia_von_theo: CoSoTinhGiaVon;
    ngay_xuat_kho: string | null;
    ngay_bat_dau_su_dung: string | null;
    ngay_ket_thuc_su_dung: string | null;
    don_thue: {
      id: string;
      chang: string;
      da_xoa: boolean;
      ngay_bat_dau: string;
      ngay_tra_du_kien: string;
      ngay_bat_dau_su_dung: string;
      ngay_ket_thuc_su_dung: string;
    };
  };

  // Đơn đã xoá mềm (da_xoa) không tính vào báo cáo — dù trước đó đã ở chặng "Xong".
  const tatCaRows = ((chiTietList ?? []) as unknown as Row[]).filter((r) => !r.don_thue.da_xoa);
  const rows =
    tuNgay && denNgay
      ? tatCaRows.filter((r) => r.don_thue.ngay_bat_dau >= tuNgay && r.don_thue.ngay_bat_dau <= denNgay)
      : tatCaRows;
  const donHoanTatIds = new Set<string>();

  type ChiPhiRow = { so_tien: number; don_thue: { chang: string; da_xoa: boolean; ngay_bat_dau: string } };
  const tatCaChiPhi = ((chiPhiList ?? []) as unknown as ChiPhiRow[]).filter((c) => !c.don_thue.da_xoa);
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
    // Tần suất/số ngày thiết bị thực sự nằm ngoài kho (logistics) — dùng để đo hiệu
    // suất sử dụng tài sản, khác với doanh thu/giá vốn (tính theo ngày sử dụng).
    const tongNgayThue = cuaThietBi.reduce((sum, r) => sum + soNgayLogisticsDong(r.don_thue, r), 0);

    const daXong = cuaThietBi.filter((r) => r.don_thue.chang === "xong");
    const doanhThu = daXong.reduce((sum, r) => {
      donHoanTatIds.add(r.don_thue.id);
      return sum + tienDong(r.don_thue, r);
    }, 0);
    const giaVon = tb.gia_von
      ? daXong.reduce((sum, r) => sum + tb.gia_von! * soNgayVonDong(r.don_thue, r), 0)
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

  const tongDoanhThu = dong.reduce((s, d) => s + d.doanhThu, 0) - tongGiamGiaDon;
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
    tongGiamGiaDon,
  };
}
