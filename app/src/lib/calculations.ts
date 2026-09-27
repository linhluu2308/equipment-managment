import { differenceInCalendarDays, parseISO } from "date-fns";
import type { ChiPhi, DonThue, DonThueChiTiet, KiemTraTinhTrang, ThanhToan } from "./types";

export function soNgayThue(ngayBatDau: string, ngayTraDuKien: string): number {
  return differenceInCalendarDays(parseISO(ngayTraDuKien), parseISO(ngayBatDau)) + 1;
}

/**
 * Ngày trả dùng để tính tiền cho MỘT dòng thiết bị trong đơn: ưu tiên ngày trả
 * thực tế của riêng thiết bị đó (một đơn có thể chỉ vài thiết bị trả sớm/trễ,
 * không phải cả đơn) nếu đã ghi nhận, chưa có thì tạm dùng ngày trả dự kiến của đơn.
 */
export function ngayTraHieuLucDong(
  don: Pick<DonThue, "ngay_tra_du_kien">,
  line: Pick<DonThueChiTiet, "ngay_tra_thuc_te">
): string {
  return line.ngay_tra_thuc_te || don.ngay_tra_du_kien;
}

export function soNgayThueDong(
  don: Pick<DonThue, "ngay_bat_dau" | "ngay_tra_du_kien">,
  line: Pick<DonThueChiTiet, "ngay_tra_thuc_te">
): number {
  return soNgayThue(don.ngay_bat_dau, ngayTraHieuLucDong(don, line));
}

export function thanhTienDong(
  line: Pick<DonThueChiTiet, "gia_thue_chot" | "phan_tram_chiet_khau">,
  soNgay: number
): number {
  const goc = line.gia_thue_chot * soNgay;
  return goc - (goc * line.phan_tram_chiet_khau) / 100;
}

export function tongTienDon(
  lines: DonThueChiTiet[],
  don: Pick<DonThue, "ngay_bat_dau" | "ngay_tra_du_kien">,
  chiPhiList: ChiPhi[] = []
): number {
  const tienThietBi = lines.reduce((sum, l) => sum + thanhTienDong(l, soNgayThueDong(don, l)), 0);
  const tongChiPhi = chiPhiList.reduce((sum, c) => sum + c.so_tien, 0);
  return tienThietBi + tongChiPhi;
}

export function tongDaThu(thanhToanList: ThanhToan[]): number {
  return thanhToanList.reduce((sum, t) => {
    // Hoàn cọc là tiền trả lại khách, trừ khỏi tổng đã thu
    return t.loai === "hoan_coc" ? sum - t.so_tien : sum + t.so_tien;
  }, 0);
}

export function congNoConLai(
  lines: DonThueChiTiet[],
  don: Pick<DonThue, "ngay_bat_dau" | "ngay_tra_du_kien">,
  chiPhiList: ChiPhi[],
  thanhToanList: ThanhToan[]
): number {
  return tongTienDon(lines, don, chiPhiList) - tongDaThu(thanhToanList);
}

export function kiemTraDaDayDu(
  lines: DonThueChiTiet[],
  kiemTraList: KiemTraTinhTrang[]
): boolean {
  const daKiem = new Set(kiemTraList.map((k) => k.thiet_bi_id));
  return lines.every((l) => daKiem.has(l.thiet_bi_id));
}

export function khoangNgayGiao(
  aBatDau: string,
  aTra: string,
  bBatDau: string,
  bTra: string
): boolean {
  return parseISO(aBatDau) <= parseISO(bTra) && parseISO(bBatDau) <= parseISO(aTra);
}

export interface DoanhThuChiPhi {
  doanhThu: number;
  giaVon: number;
  chiPhiKhac: number;
}

export function loiNhuanThietBi({ doanhThu, giaVon, chiPhiKhac }: DoanhThuChiPhi): number {
  return doanhThu - giaVon - chiPhiKhac;
}
