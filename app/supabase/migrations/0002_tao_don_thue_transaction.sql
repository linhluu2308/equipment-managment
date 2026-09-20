-- Gộp 3 bước "tạo khách hàng + tạo đơn + gán thiết bị" thành 1 giao dịch nguyên tử.
-- Một lệnh gọi hàm trong Postgres tự chạy trong 1 transaction: nếu bất kỳ bước nào
-- bên trong lỗi, toàn bộ thay đổi của lần gọi đó tự động bị huỷ (rollback), không để
-- lại khách hàng/đơn "mồ côi" nếu request bị đứt giữa chừng (mất mạng, server đơ...).
-- Chạy file này 1 lần trong Supabase SQL Editor.

create or replace function tao_don_thue(
  p_khach_ten text,
  p_khach_sdt text,
  p_khach_nguoi_gioi_thieu text,
  p_ngay_bat_dau date,
  p_ngay_tra_du_kien date,
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

  insert into don_thue (khach_hang_id, ngay_bat_dau, ngay_tra_du_kien, ghi_chu, chang)
  values (v_khach_id, p_ngay_bat_dau, p_ngay_tra_du_kien, p_ghi_chu, 'yeu_cau')
  returning id into v_don_id;

  insert into don_thue_chi_tiet (don_thue_id, thiet_bi_id, gia_thue_chot, phan_tram_chiet_khau)
  select
    v_don_id,
    (item->>'thiet_bi_id')::uuid,
    (item->>'gia_thue_chot')::numeric,
    (item->>'phan_tram_chiet_khau')::numeric
  from jsonb_array_elements(p_thiet_bi) as item;

  return v_don_id;
end;
$$;
