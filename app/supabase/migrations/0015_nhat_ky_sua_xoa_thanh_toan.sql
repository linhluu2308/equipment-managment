-- Cho phép ghi nhật ký khi chủ sửa/xoá một giao dịch thanh toán của đơn (vd ghi trùng,
-- nhập sai số tiền). Mở rộng CHECK của nhat_ky_thay_doi_don.hanh_dong.
-- Chạy tay trong Supabase SQL Editor.

alter table nhat_ky_thay_doi_don drop constraint if exists nhat_ky_thay_doi_don_hanh_dong_check;
alter table nhat_ky_thay_doi_don
  add constraint nhat_ky_thay_doi_don_hanh_dong_check
  check (hanh_dong in ('sua', 'xoa', 'khoi_phuc', 'sua_thanh_toan', 'xoa_thanh_toan'));
