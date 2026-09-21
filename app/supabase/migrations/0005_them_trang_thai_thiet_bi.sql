-- Thêm 2 trạng thái thiết bị mới: "hong" (hỏng) và "thanh_ly" (đã thanh lý)
-- để đánh dấu thiết bị không còn cho thuê được mà không cần xoá lịch sử.
-- Chạy trong Supabase SQL Editor.

alter table thiet_bi drop constraint if exists thiet_bi_trang_thai_check;
alter table thiet_bi add constraint thiet_bi_trang_thai_check
  check (trang_thai in ('san_sang', 'dang_thue', 'bao_tri', 'hong', 'thanh_ly'));
