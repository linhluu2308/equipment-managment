import { differenceInCalendarDays, parseISO } from "date-fns";
import type { ChiPhi, DonThue, DonThueChiTiet, KiemTraTinhTrang, ThanhToan } from "./types";

export function soNgayThue(ngayBatDau: string, ngayKetThuc: string): number {
  return differenceInCalendarDays(parseISO(ngayKetThuc), parseISO(ngayBatDau)) + 1;
}

/**
 * Số ngày khách THỰC TẾ SỬ DỤNG — cơ sở tính tiền thuê cho khách, tách biệt với
 * ngày xuất/nhập kho (khách có thể lấy sớm/trả muộn hơn vì cần di chuyển đến nơi
 * quay). Áp dụng chung cho cả đơn, không khác nhau theo từng thiết bị.
 */
export function soNgayThueSuDung(
  don: Pick<DonThue, "ngay_bat_dau_su_dung" | "ngay_ket_thuc_su_dung">
): number {
  return soNgayThue(don.ngay_bat_dau_su_dung, don.ngay_ket_thuc_su_dung);
}

/**
 * Ngày trả dùng để tính số ngày LOGISTICS (xuất/nhập kho) cho MỘT dòng thiết bị:
 * ưu tiên ngày trả thực tế riêng của thiết bị đó (một đơn có thể chỉ vài thiết bị
 * trả sớm/trễ, không phải cả đơn) nếu đã ghi nhận, chưa có thì tạm dùng ngày trả dự
 * kiến của đơn. CHỈ dùng cho giá vốn NCC tính theo "ngày di chuyển" — không dùng để
 * tính tiền khách (xem soNgayThueSuDung).
 */
export function ngayTraHieuLucDong(
  don: Pick<DonThue, "ngay_tra_du_kien">,
  line: Pick<DonThueChiTiet, "ngay_tra_thuc_te">
): string {
  return line.ngay_tra_thuc_te || don.ngay_tra_du_kien;
}

export function soNgayLogisticsDong(
  don: Pick<DonThue, "ngay_bat_dau" | "ngay_tra_du_kien">,
  line: Pick<DonThueChiTiet, "ngay_tra_thuc_te">
): number {
  return soNgayThue(don.ngay_bat_dau, ngayTraHieuLucDong(don, line));
}

/**
 * Số ngày dùng để tính GIÁ VỐN/công nợ NCC cho một dòng thiết bị thuê ngoài — tuỳ
 * quy ước của từng NCC (chọn lúc tạo đơn): có NCC tính theo ngày di chuyển (xuất/
 * nhập kho), có NCC chỉ tính theo đúng số ngày khách sử dụng.
 */
export function soNgayVonDong(
  don: Pick<DonThue, "ngay_bat_dau" | "ngay_tra_du_kien" | "ngay_bat_dau_su_dung" | "ngay_ket_thuc_su_dung">,
  line: Pick<DonThueChiTiet, "ngay_tra_thuc_te" | "tinh_gia_von_theo">
): number {
  return line.tinh_gia_von_theo === "ngay_su_dung" ? soNgayThueSuDung(don) : soNgayLogisticsDong(don, line);
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
  don: Pick<DonThue, "ngay_bat_dau_su_dung" | "ngay_ket_thuc_su_dung">,
  chiPhiList: ChiPhi[] = []
): number {
  const soNgay = soNgayThueSuDung(don);
  const tienThietBi = lines.reduce((sum, l) => sum + thanhTienDong(l, soNgay), 0);
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
  don: Pick<DonThue, "ngay_bat_dau_su_dung" | "ngay_ket_thuc_su_dung">,
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
