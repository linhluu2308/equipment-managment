export type NguonGoc = "so_huu" | "thue_ngoai";
export type TrangThaiThietBi = "san_sang" | "dang_thue" | "bao_tri" | "hong" | "thanh_ly";
export type ChangDon = "yeu_cau" | "bao_gia" | "da_giao" | "cho_tra" | "xong" | "huy";
export type LoaiThanhToan = "coc" | "dot" | "tat_toan" | "hoan_coc";
export type TrangThaiGiayTo = "dang_giu" | "da_hoan_tra";
export type TinhTrangThietBi = "tot" | "tray_xuoc" | "hong";

export const CHANG_LABEL: Record<ChangDon, string> = {
  yeu_cau: "Yêu cầu",
  bao_gia: "Báo giá",
  da_giao: "Đã giao",
  cho_tra: "Chờ trả",
  xong: "Xong",
  huy: "Đã huỷ",
};

export const CHANG_BADGE: Record<ChangDon, string> = {
  yeu_cau: "badge-info",
  bao_gia: "badge-info",
  da_giao: "badge-warning",
  cho_tra: "badge-warning",
  xong: "badge-neutral",
  huy: "badge-danger",
};

export const TRANG_THAI_THIET_BI_LABEL: Record<TrangThaiThietBi, string> = {
  san_sang: "Sẵn sàng",
  dang_thue: "Đang thuê",
  bao_tri: "Bảo trì",
  hong: "Hỏng",
  thanh_ly: "Đã thanh lý",
};

export const TRANG_THAI_THIET_BI_BADGE: Record<TrangThaiThietBi, string> = {
  san_sang: "badge-success",
  dang_thue: "badge-danger",
  bao_tri: "badge-neutral",
  hong: "badge-danger",
  thanh_ly: "badge-neutral",
};

export interface ThietBi {
  id: string;
  ma: string | null;
  ten: string;
  danh_muc: string | null;
  nguon_goc: NguonGoc;
  nha_cung_cap: string | null;
  gia_von: number | null;
  mo_ta: string | null;
  anh_url: string | null;
  trang_thai: TrangThaiThietBi;
  created_at: string;
}

export interface LichSuGia {
  id: string;
  thiet_bi_id: string;
  gia_thue: number;
  ngay_ap_dung: string;
  created_at: string;
}

export interface KhachHang {
  id: string;
  ten: string;
  so_dien_thoai: string;
  nguoi_gioi_thieu: string | null;
  created_at: string;
}

export interface DonThue {
  id: string;
  ma_don: string | null;
  khach_hang_id: string;
  chang: ChangDon;
  ngay_bat_dau: string;
  ngay_tra_du_kien: string;
  ghi_chu: string | null;
  created_at: string;
  updated_at: string;
}

export interface DonThueChiTiet {
  id: string;
  don_thue_id: string;
  thiet_bi_id: string;
  gia_thue_chot: number;
  phan_tram_chiet_khau: number;
  created_at: string;
}

export interface CocGiayTo {
  id: string;
  don_thue_id: string;
  loai_giay_to: string;
  so_hieu: string | null;
  anh_url: string | null;
  trang_thai: TrangThaiGiayTo;
  created_at: string;
}

export interface ThanhToan {
  id: string;
  don_thue_id: string;
  so_tien: number;
  ngay_thu: string;
  hinh_thuc: string | null;
  loai: LoaiThanhToan;
  created_at: string;
}

export interface ChiPhi {
  id: string;
  don_thue_id: string;
  loai: string;
  mo_ta: string | null;
  so_tien: number;
  created_at: string;
}

export interface DonThueDetail extends DonThue {
  khach_hang: KhachHang;
  don_thue_chi_tiet: (DonThueChiTiet & {
    thiet_bi: { id: string; ten: string; ma: string | null; danh_muc: string | null } | null;
  })[];
  thanh_toan: ThanhToan[];
  chi_phi: ChiPhi[];
  coc_giay_to: CocGiayTo[];
  kiem_tra_tinh_trang: KiemTraTinhTrang[];
}

export interface KiemTraTinhTrang {
  id: string;
  thiet_bi_id: string;
  don_thue_id: string;
  ngay_tra: string;
  tinh_trang: TinhTrangThietBi;
  ghi_chu: string | null;
  nguoi_kiem: string | null;
  created_at: string;
}
