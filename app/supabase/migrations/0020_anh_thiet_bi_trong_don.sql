-- Ảnh thiết bị lúc xuất kho (giao cho khách) và lúc nhận về (kiểm tra khi trả).
-- File ảnh nằm trên Google Drive của tài khoản CineB (xem lib/googleDrive.ts) — bảng
-- này chỉ lưu id file Drive để app hiển thị lại qua route /anh-thiet-bi/[id].
-- Mỗi thiết bị trong đơn có thể có nhiều ảnh cho mỗi loại; không bắt buộc.
-- Chạy tay trong Supabase SQL Editor — PHẢI CHẠY TRƯỚC KHI DEPLOY.

create table if not exists anh_thiet_bi_trong_don (
  id uuid primary key default gen_random_uuid(),
  don_thue_id uuid not null references don_thue(id) on delete cascade,
  thiet_bi_id uuid not null references thiet_bi(id),
  loai text not null check (loai in ('xuat_kho', 'nhan_ve')),
  drive_file_id text not null,
  ten_file text not null,
  nguoi_tai text not null,
  nguoi_tai_email text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_anh_tb_don on anh_thiet_bi_trong_don(don_thue_id, thiet_bi_id, created_at);

-- Nhật ký đơn: thêm xoá ảnh thiết bị (chỉ chủ, bắt buộc lý do).
alter table nhat_ky_thay_doi_don drop constraint if exists nhat_ky_thay_doi_don_hanh_dong_check;
alter table nhat_ky_thay_doi_don
  add constraint nhat_ky_thay_doi_don_hanh_dong_check
  check (hanh_dong in (
    'sua', 'xoa', 'khoi_phuc', 'sua_thanh_toan', 'xoa_thanh_toan',
    'them_thiet_bi', 'xoa_thiet_bi', 'tra_som_thiet_bi',
    'sua_chi_phi', 'xoa_chi_phi',
    'xoa_anh_thiet_bi'
  ));
