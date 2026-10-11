-- Giá vốn (chi phí mua vào) cho thiết bị tự sở hữu — khác với cột gia_von hiện có
-- (đó là giá vốn/NGÀY dùng để tính công nợ nhà cung cấp cho thiết bị thuê ngoài).
-- Chỉ chủ nhập/xem được (gate ở tầng ứng dụng, không phải RLS — xem 0001_init.sql).
alter table thiet_bi add column if not exists gia_mua numeric;
