-- Thêm "hãng" (subgroup trong mỗi danh mục thiết bị) — danh_muc giờ chọn từ 5
-- nhóm cố định (Camera/Lens/Lighting/Accessories/Crane & Grip) ở app, hang là
-- text tự do gợi ý lại theo lịch sử đã nhập (xem layGoiYHangTheoDanhMuc()).
-- Chạy trong Supabase SQL Editor.

alter table thiet_bi add column if not exists hang text;
