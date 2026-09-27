-- Thực tế có đơn chỉ VÀI thiết bị trả sớm/trễ hơn báo giá, không phải cả đơn —
-- chuyển ngày trả thực tế từ cấp đơn (migration 0008) xuống cấp từng dòng thiết
-- bị trong đơn (don_thue_chi_tiet), để ghi riêng cho từng thiết bị hoặc áp dụng
-- chung cho tất cả tuỳ trường hợp.
-- Chạy trong Supabase SQL Editor (sau 0008, hoặc thay thế 0008 nếu chưa chạy).

alter table don_thue drop column if exists ngay_tra_thuc_te;

alter table don_thue_chi_tiet add column if not exists ngay_tra_thuc_te date;
