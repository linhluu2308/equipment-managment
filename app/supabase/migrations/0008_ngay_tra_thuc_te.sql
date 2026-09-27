-- Thêm ngày trả thực tế cho đơn thuê — khách có thể trả sớm/trễ hơn ngày trả dự kiến
-- lúc báo giá. Giữ nguyên ngay_tra_du_kien để đối chiếu, dùng ngay_tra_thuc_te (nếu có)
-- để tính doanh thu/giá vốn/công nợ khi đơn đã hoàn tất.
-- Chạy trong Supabase SQL Editor.

alter table don_thue add column if not exists ngay_tra_thuc_te date;

alter table don_thue add constraint don_thue_ngay_thuc_te_hop_le
  check (ngay_tra_thuc_te is null or ngay_tra_thuc_te >= ngay_bat_dau);
