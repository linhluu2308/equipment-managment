-- Chặn ngày trả dự kiến sớm hơn ngày bắt đầu thuê (gây số ngày thuê/doanh thu âm).
-- Dùng NOT VALID vì có thể đã có vài đơn cũ (đã huỷ) mang dữ liệu ngày sai — chỉ chặn
-- đơn MỚI/SỬA từ giờ trở đi, không bắt phải dọn sạch dữ liệu cũ mới chạy được migration.
-- Chạy trong Supabase SQL Editor.

alter table don_thue
  add constraint don_thue_ngay_hop_le
  check (ngay_tra_du_kien >= ngay_bat_dau) not valid;
