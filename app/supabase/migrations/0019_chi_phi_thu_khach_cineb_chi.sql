-- Chi phí phát sinh tách 2 con số: thu_khach (cộng vào công nợ khách, tính doanh thu)
-- và cineb_chi (CineB thực chi, trừ lợi nhuận). Trước đây chỉ có so_tien nên app vừa
-- cộng vào công nợ khách vừa trừ lợi nhuận → sai số liệu cả 2 hướng.
-- Dữ liệu cũ chuyển thành "Khách chịu" (thu_khach = cineb_chi = so_tien) để công nợ
-- các đơn cũ giữ nguyên; khoản nào thực ra CineB chịu thì Chủ sửa lại trên app (✏️).
-- Chạy tay trong Supabase SQL Editor — PHẢI CHẠY TRƯỚC KHI DEPLOY.

alter table chi_phi add column if not exists thu_khach numeric not null default 0;
alter table chi_phi add column if not exists cineb_chi numeric not null default 0;

update chi_phi set thu_khach = so_tien, cineb_chi = so_tien where so_tien is not null;

alter table chi_phi drop column if exists so_tien;

alter table chi_phi drop constraint if exists chi_phi_so_tien_hop_le;
alter table chi_phi
  add constraint chi_phi_so_tien_hop_le
  check (thu_khach >= 0 and cineb_chi >= 0 and (thu_khach > 0 or cineb_chi > 0));

-- Nhật ký đơn: thêm sửa/xoá chi phí phát sinh.
alter table nhat_ky_thay_doi_don drop constraint if exists nhat_ky_thay_doi_don_hanh_dong_check;
alter table nhat_ky_thay_doi_don
  add constraint nhat_ky_thay_doi_don_hanh_dong_check
  check (hanh_dong in (
    'sua', 'xoa', 'khoi_phuc', 'sua_thanh_toan', 'xoa_thanh_toan',
    'them_thiet_bi', 'xoa_thiet_bi', 'tra_som_thiet_bi',
    'sua_chi_phi', 'xoa_chi_phi'
  ));
