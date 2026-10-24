import { differenceInCalendarDays, parseISO } from "date-fns";
import type { ChiPhi, DonThue, DonThueChiTiet, KiemTraTinhTrang, ThanhToan } from "./types";

export function soNgayThue(ngayBatDau: string, ngayKetThuc: string): number {
  return differenceInCalendarDays(parseISO(ngayKetThuc), parseISO(ngayBatDau)) + 1;
}

/**
 * Số ngày khách THỰC TẾ SỬ DỤNG theo ngày của CẢ ĐƠN — tách biệt với ngày xuất/nhập
 * kho (khách có thể lấy sớm/trả muộn hơn vì cần di chuyển đến nơi quay). Tiền từng
 * thiết bị tính theo soNgaySuDungDong() vì thiết bị có thể thuê thêm/trả sớm.
 */
export function soNgayThueSuDung(
  don: Pick<DonThue, "ngay_bat_dau_su_dung" | "ngay_ket_thuc_su_dung">
): number {
  return soNgayThue(don.ngay_bat_dau_su_dung, don.ngay_ket_thuc_su_dung);
}

/** Ngày riêng của dòng (migration 0017) — optional để các select cũ thiếu cột vẫn tính đúng theo đơn. */
type NgayRiengDong = Partial<
  Pick<DonThueChiTiet, "ngay_xuat_kho" | "ngay_bat_dau_su_dung" | "ngay_ket_thuc_su_dung">
>;

/** Khoảng ngày tính tiền của MỘT thiết bị: ngày riêng của dòng nếu có (thuê thêm/trả sớm), không thì theo đơn. */
export function khoangSuDungDong(
  don: Pick<DonThue, "ngay_bat_dau_su_dung" | "ngay_ket_thuc_su_dung">,
  line: NgayRiengDong
): { tu: string; den: string } {
  return {
    tu: line.ngay_bat_dau_su_dung || don.ngay_bat_dau_su_dung,
    den: line.ngay_ket_thuc_su_dung || don.ngay_ket_thuc_su_dung,
  };
}

/** Số ngày tính tiền khách cho MỘT thiết bị — cơ sở của thành tiền từng dòng. */
export function soNgaySuDungDong(
  don: Pick<DonThue, "ngay_bat_dau_su_dung" | "ngay_ket_thuc_su_dung">,
  line: NgayRiengDong
): number {
  const { tu, den } = khoangSuDungDong(don, line);
  return soNgayThue(tu, den);
}

/** Ngày xuất kho của MỘT thiết bị — thiết bị thuê thêm giữa chừng có ngày giao riêng. */
export function ngayXuatKhoDong(don: Pick<DonThue, "ngay_bat_dau">, line: NgayRiengDong): string {
  return line.ngay_xuat_kho || don.ngay_bat_dau;
}

/**
 * Ngày trả dùng để tính số ngày LOGISTICS (xuất/nhập kho) cho MỘT dòng thiết bị:
 * ưu tiên ngày trả thực tế riêng của thiết bị đó (một đơn có thể chỉ vài thiết bị
 * trả sớm/trễ, không phải cả đơn) nếu đã ghi nhận, chưa có thì tạm dùng ngày trả dự
 * kiến của đơn. CHỈ dùng cho giá vốn NCC tính theo "ngày di chuyển" — không dùng để
 * tính tiền khách (xem soNgaySuDungDong).
 */
export function ngayTraHieuLucDong(
  don: Pick<DonThue, "ngay_tra_du_kien">,
  line: Pick<DonThueChiTiet, "ngay_tra_thuc_te">
): string {
  return line.ngay_tra_thuc_te || don.ngay_tra_du_kien;
}

export function soNgayLogisticsDong(
  don: Pick<DonThue, "ngay_bat_dau" | "ngay_tra_du_kien">,
  line: Pick<DonThueChiTiet, "ngay_tra_thuc_te"> & NgayRiengDong
): number {
  return soNgayThue(ngayXuatKhoDong(don, line), ngayTraHieuLucDong(don, line));
}

/**
 * Số ngày dùng để tính GIÁ VỐN/công nợ NCC cho một dòng thiết bị thuê ngoài — tuỳ
 * quy ước của từng NCC (chọn lúc tạo đơn): có NCC tính theo ngày di chuyển (xuất/
 * nhập kho), có NCC chỉ tính theo đúng số ngày khách sử dụng thiết bị đó.
 */
export function soNgayVonDong(
  don: Pick<DonThue, "ngay_bat_dau" | "ngay_tra_du_kien" | "ngay_bat_dau_su_dung" | "ngay_ket_thuc_su_dung">,
  line: Pick<DonThueChiTiet, "ngay_tra_thuc_te" | "tinh_gia_von_theo"> & NgayRiengDong
): number {
  return line.tinh_gia_von_theo === "ngay_su_dung" ? soNgaySuDungDong(don, line) : soNgayLogisticsDong(don, line);
}

/**
 * Chiết khấu của 1 dòng: % (cũ) HOẶC số tiền trừ vào giá mỗi ngày (migration 0018).
 * tien_chiet_khau_ngay optional để các select cũ thiếu cột vẫn tính như chiết khấu %.
 */
export type ChietKhauDong = Pick<DonThueChiTiet, "gia_thue_chot" | "phan_tram_chiet_khau"> &
  Partial<Pick<DonThueChiTiet, "tien_chiet_khau_ngay">>;

/** Giá mỗi ngày sau chiết khấu của 1 thiết bị. */
export function donGiaSauChietKhau(line: ChietKhauDong): number {
  const tien = line.tien_chiet_khau_ngay ?? 0;
  if (tien > 0) return Math.max(0, line.gia_thue_chot - tien);
  return line.gia_thue_chot - (line.gia_thue_chot * line.phan_tram_chiet_khau) / 100;
}

/** Hiển thị chiết khấu của dòng: "10%", "−100.000đ/ngày" hoặc "—". */
export function moTaChietKhau(line: ChietKhauDong): string {
  const tien = line.tien_chiet_khau_ngay ?? 0;
  if (tien > 0) return `−${tien.toLocaleString("vi-VN")}đ/ngày`;
  return line.phan_tram_chiet_khau > 0 ? `${line.phan_tram_chiet_khau}%` : "—";
}

/** Kiểm tra chiết khấu hợp lệ — dùng chung client/server. Trả về câu lỗi hoặc null. */
export function loiChietKhau(line: ChietKhauDong): string | null {
  const tien = line.tien_chiet_khau_ngay ?? 0;
  if (line.phan_tram_chiet_khau < 0 || line.phan_tram_chiet_khau > 100) return "Chiết khấu % phải nằm trong khoảng 0–100%.";
  if (tien < 0) return "Chiết khấu số tiền không được âm.";
  if (tien > line.gia_thue_chot) return "Chiết khấu số tiền không được lớn hơn giá thuê mỗi ngày.";
  if (tien > 0 && line.phan_tram_chiet_khau > 0) return "Mỗi thiết bị chỉ chọn một kiểu chiết khấu: % hoặc số tiền.";
  return null;
}

export function thanhTienDong(line: ChietKhauDong, soNgay: number): number {
  return donGiaSauChietKhau(line) * soNgay;
}

/** Thành tiền của MỘT thiết bị theo đúng số ngày riêng của nó. */
export function tienDong(
  don: Pick<DonThue, "ngay_bat_dau_su_dung" | "ngay_ket_thuc_su_dung">,
  line: ChietKhauDong & NgayRiengDong
): number {
  return thanhTienDong(line, soNgaySuDungDong(don, line));
}

/** Tổng tiền thiết bị của đơn, CHƯA trừ giảm giá cả đơn. */
export function tongTienThietBi(
  lines: (ChietKhauDong & NgayRiengDong)[],
  don: Pick<DonThue, "ngay_bat_dau_su_dung" | "ngay_ket_thuc_su_dung">
): number {
  return lines.reduce((sum, l) => sum + tienDong(don, l), 0);
}

/**
 * Tổng tiền khách phải trả = tiền thiết bị − giảm giá cả đơn + chi phí phát sinh.
 * Giảm giá đơn không làm tiền thiết bị âm (vd sau khi trả sớm làm tiền thiết bị nhỏ lại).
 */
export function tongTienDon(
  lines: (ChietKhauDong & NgayRiengDong)[],
  don: Pick<DonThue, "ngay_bat_dau_su_dung" | "ngay_ket_thuc_su_dung"> & Partial<Pick<DonThue, "giam_gia_don">>,
  chiPhiList: Pick<ChiPhi, "so_tien">[] = []
): number {
  const tienThietBi = Math.max(0, tongTienThietBi(lines, don) - (don.giam_gia_don ?? 0));
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
  don: Pick<DonThue, "ngay_bat_dau_su_dung" | "ngay_ket_thuc_su_dung"> & Partial<Pick<DonThue, "giam_gia_don">>,
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
