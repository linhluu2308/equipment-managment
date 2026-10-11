-- Khi tạo đơn mới, nếu SĐT đã từng đặt thì tái dùng chung 1 dòng khach_hang (cập
-- nhật tên/người giới thiệu mới nhất) thay vì luôn tạo dòng mới như trước — để màn
-- "Khách hàng" (nhóm theo SĐT) có lịch sử/công nợ đúng cho khách lặp lại, và dữ
-- liệu khach_hang sạch dần theo thời gian. Dữ liệu cũ (các dòng khach_hang trùng
-- SĐT đã tạo trước đây, mỗi đơn 1 dòng riêng) không tự gộp — màn Khách hàng vẫn
-- nhóm theo SĐT ở tầng ứng dụng nên không bị ảnh hưởng. Cùng chữ ký tham số với
-- bản ở 0011_ngay_su_dung_thuc_te.sql nên không cần drop function trước.
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
  select id into v_khach_id from khach_hang where so_dien_thoai = p_khach_sdt order by created_at desc limit 1;

  if v_khach_id is null then
    insert into khach_hang (ten, so_dien_thoai, nguoi_gioi_thieu)
    values (p_khach_ten, p_khach_sdt, p_khach_nguoi_gioi_thieu)
    returning id into v_khach_id;
  else
    update khach_hang
    set ten = p_khach_ten,
        nguoi_gioi_thieu = coalesce(p_khach_nguoi_gioi_thieu, nguoi_gioi_thieu)
    where id = v_khach_id;
  end if;

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
