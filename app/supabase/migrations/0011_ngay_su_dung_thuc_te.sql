-- Khách thuê thiết bị có thể lấy sớm/trả muộn hơn ngày thực sự dùng (cần di chuyển
-- đến địa điểm quay) — tách "ngày xuất/nhập kho" (ngay_bat_dau/ngay_tra_du_kien, có
-- sẵn) khỏi "ngày khách thực tế sử dụng" (mới), và tiền thuê tính theo ngày sử dụng.
-- Chạy trong Supabase SQL Editor.

alter table don_thue add column if not exists ngay_bat_dau_su_dung date;
alter table don_thue add column if not exists ngay_ket_thuc_su_dung date;

-- Backfill đơn cũ: coi như ngày sử dụng = đúng dải ngày xuất/nhập kho hiện tại
-- (không có thông tin di chuyển cho dữ liệu lịch sử).
update don_thue
set ngay_bat_dau_su_dung = ngay_bat_dau,
    ngay_ket_thuc_su_dung = ngay_tra_du_kien
where ngay_bat_dau_su_dung is null or ngay_ket_thuc_su_dung is null;

alter table don_thue alter column ngay_bat_dau_su_dung set not null;
alter table don_thue alter column ngay_ket_thuc_su_dung set not null;

-- NOT VALID giống constraint ngày ở migration 0006 — chỉ chặn đơn mới/sửa từ giờ,
-- không bắt dọn sạch dữ liệu cũ mới chạy được migration.
alter table don_thue
  add constraint don_thue_ngay_su_dung_trong_khoang
  check (
    ngay_bat_dau_su_dung >= ngay_bat_dau
    and ngay_ket_thuc_su_dung >= ngay_bat_dau_su_dung
    and ngay_tra_du_kien >= ngay_ket_thuc_su_dung
  ) not valid;

-- Mỗi dòng thiết bị thuê ngoài trong đơn tự chọn quy ước tính giá vốn/công nợ NCC —
-- có NCC tính theo ngày di chuyển (CineB giữ hàng từ lúc xuất đến lúc nhập kho), có
-- NCC chỉ tính theo đúng số ngày khách sử dụng. Mặc định 'ngay_di_chuyen' để giữ
-- đúng hành vi tính giá vốn hiện tại cho các dòng đã có.
alter table don_thue_chi_tiet
  add column if not exists tinh_gia_von_theo text not null default 'ngay_di_chuyen'
  check (tinh_gia_von_theo in ('ngay_di_chuyen', 'ngay_su_dung'));

-- tao_don_thue(): thêm 2 tham số ngày sử dụng (đơn) + tinh_gia_von_theo theo từng
-- dòng thiết bị (đọc từ cùng jsonb p_thiet_bi, mặc định 'ngay_di_chuyen' nếu client
-- không gửi field này). Danh sách tham số đổi khác bản cũ nên "create or replace"
-- sẽ tạo thêm 1 overload mới thay vì thay thế — phải drop chữ ký cũ trước.
drop function if exists tao_don_thue(text, text, text, date, date, text, jsonb);

create or replace function tao_don_thue(
  p_khach_ten text,
  p_khach_sdt text,
  p_khach_nguoi_gioi_thieu text,
  p_ngay_bat_dau date,
  p_ngay_tra_du_kien date,
  p_ngay_bat_dau_su_dung date,
  p_ngay_ket_thuc_su_dung date,
  p_ghi_chu text,
  p_thiet_bi jsonb
) returns uuid
language plpgsql
as $$
declare
  v_khach_id uuid;
  v_don_id uuid;
begin
  insert into khach_hang (ten, so_dien_thoai, nguoi_gioi_thieu)
  values (p_khach_ten, p_khach_sdt, p_khach_nguoi_gioi_thieu)
  returning id into v_khach_id;

  insert into don_thue (khach_hang_id, ngay_bat_dau, ngay_tra_du_kien, ngay_bat_dau_su_dung, ngay_ket_thuc_su_dung, ghi_chu, chang)
  values (v_khach_id, p_ngay_bat_dau, p_ngay_tra_du_kien, p_ngay_bat_dau_su_dung, p_ngay_ket_thuc_su_dung, p_ghi_chu, 'yeu_cau')
  returning id into v_don_id;

  insert into don_thue_chi_tiet (don_thue_id, thiet_bi_id, gia_thue_chot, phan_tram_chiet_khau, tinh_gia_von_theo)
  select
    v_don_id,
    (item->>'thiet_bi_id')::uuid,
    (item->>'gia_thue_chot')::numeric,
    (item->>'phan_tram_chiet_khau')::numeric,
    coalesce(item->>'tinh_gia_von_theo', 'ngay_di_chuyen')
  from jsonb_array_elements(p_thiet_bi) as item;

  return v_don_id;
end;
$$;
