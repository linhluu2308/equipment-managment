import { createClient } from "@/lib/supabase/admin";
import { tongTienDon, tongDaThu } from "@/lib/calculations";
import type { ChangDon, ChiPhi, DonThueChiTiet, ThanhToan } from "@/lib/types";

export interface DonCuaKhachHang {
  id: string;
  ma_don: string | null;
  chang: ChangDon;
  ngay_bat_dau: string;
  ngay_tra_du_kien: string;
  tong: number;
  daThu: number;
  conNo: number;
}

export interface KhachHangDong {
  soDienThoai: string;
  ten: string;
  nguoiGioiThieu: string | null;
  soDon: number;
  tongChiTieu: number;
  daThu: number;
  conNo: number;
  donGanNhat: string | null;
}

type DonThueRaw = {
  id: string;
  ma_don: string | null;
  chang: ChangDon;
  da_xoa: boolean;
  ngay_bat_dau: string;
  ngay_tra_du_kien: string;
  ngay_bat_dau_su_dung: string;
  ngay_ket_thuc_su_dung: string;
  don_thue_chi_tiet: DonThueChiTiet[];
  chi_phi: ChiPhi[];
  thanh_toan: ThanhToan[];
};

type KhachHangRaw = {
  ten: string;
  so_dien_thoai: string;
  nguoi_gioi_thieu: string | null;
  created_at: string;
  don_thue: DonThueRaw[];
};

const QUAN_HE_DON =
  "ten, so_dien_thoai, nguoi_gioi_thieu, created_at, don_thue(id, ma_don, chang, da_xoa, ngay_bat_dau, ngay_tra_du_kien, ngay_bat_dau_su_dung, ngay_ket_thuc_su_dung, don_thue_chi_tiet(*), chi_phi(*), thanh_toan(*))";

/**
 * Gom các dòng khach_hang trùng số điện thoại thành 1 "khách hàng" — mỗi đơn hiện
 * tại có thể gắn 1 dòng khach_hang riêng (dữ liệu tạo trước khi tao_don_thue() biết
 * tái dùng theo SĐT, xem migration 0014), nên không thể nhóm theo khach_hang_id.
 * Tên/người giới thiệu hiển thị = của dòng khach_hang có created_at mới nhất.
 */
function gomTheoSdt(rows: KhachHangRaw[]): Map<string, { moiNhat: KhachHangRaw; donChuaXoa: DonThueRaw[] }> {
  const map = new Map<string, { moiNhat: KhachHangRaw; donChuaXoa: DonThueRaw[] }>();
  for (const kh of rows) {
    const hienTai = map.get(kh.so_dien_thoai);
    const donChuaXoaCuaDong = (kh.don_thue ?? []).filter((d) => !d.da_xoa);
    if (!hienTai) {
      map.set(kh.so_dien_thoai, { moiNhat: kh, donChuaXoa: donChuaXoaCuaDong });
    } else {
      hienTai.donChuaXoa.push(...donChuaXoaCuaDong);
      if (kh.created_at > hienTai.moiNhat.created_at) hienTai.moiNhat = kh;
    }
  }
  return map;
}

function tinhDon(d: DonThueRaw): DonCuaKhachHang {
  const tong = tongTienDon(d.don_thue_chi_tiet, d, d.chi_phi);
  const daThu = tongDaThu(d.thanh_toan);
  return {
    id: d.id,
    ma_don: d.ma_don,
    chang: d.chang,
    ngay_bat_dau: d.ngay_bat_dau,
    ngay_tra_du_kien: d.ngay_tra_du_kien,
    tong,
    daThu,
    conNo: tong - daThu,
  };
}

export async function layDanhSachKhachHang(): Promise<KhachHangDong[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("khach_hang").select(QUAN_HE_DON);
  if (error) throw new Error(error.message);

  const nhom = gomTheoSdt((data ?? []) as unknown as KhachHangRaw[]);

  return Array.from(nhom.entries())
    .map(([soDienThoai, { moiNhat, donChuaXoa }]) => {
      const donList = donChuaXoa.map(tinhDon);
      const tongChiTieu = donList.reduce((s, d) => s + d.tong, 0);
      const daThu = donList.reduce((s, d) => s + d.daThu, 0);
      const donGanNhat = donChuaXoa.reduce<string | null>(
        (max, d) => (!max || d.ngay_bat_dau > max ? d.ngay_bat_dau : max),
        null
      );
      return {
        soDienThoai,
        ten: moiNhat.ten,
        nguoiGioiThieu: moiNhat.nguoi_gioi_thieu,
        soDon: donList.length,
        tongChiTieu,
        daThu,
        conNo: tongChiTieu - daThu,
        donGanNhat,
      };
    })
    .sort((a, b) => a.ten.localeCompare(b.ten, "vi"));
}

export async function layKhachHangTheoSdt(sdt: string): Promise<{
  ten: string;
  soDienThoai: string;
  nguoiGioiThieu: string | null;
  soDon: number;
  tongChiTieu: number;
  daThu: number;
  conNo: number;
  donList: DonCuaKhachHang[];
} | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("khach_hang").select(QUAN_HE_DON).eq("so_dien_thoai", sdt);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return null;

  const nhom = gomTheoSdt(data as unknown as KhachHangRaw[]);
  const ketQua = nhom.get(sdt);
  if (!ketQua) return null;

  const donList = ketQua.donChuaXoa.map(tinhDon).sort((a, b) => (a.ngay_bat_dau < b.ngay_bat_dau ? 1 : -1));
  const tongChiTieu = donList.reduce((s, d) => s + d.tong, 0);
  const daThu = donList.reduce((s, d) => s + d.daThu, 0);

  return {
    ten: ketQua.moiNhat.ten,
    soDienThoai: sdt,
    nguoiGioiThieu: ketQua.moiNhat.nguoi_gioi_thieu,
    soDon: donList.length,
    tongChiTieu,
    daThu,
    conNo: tongChiTieu - daThu,
    donList,
  };
}
