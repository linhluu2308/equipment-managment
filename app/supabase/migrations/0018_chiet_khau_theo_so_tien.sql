-- Chiết khấu theo số tiền (đã chốt với user 2026-10-24, kết hợp 2 cách):
--  ① Từng thiết bị: chiết khấu % (như cũ) HOẶC số tiền trừ vào giá mỗi ngày
--     (vd 350.000đ/ngày − 100.000 = 250.000đ/ngày) — tự đúng khi thuê thêm/trả sớm.
--  ③ Cả đơn: một khoản giảm giá chung trừ vào tổng tiền thiết bị.
-- Dữ liệu cũ: cột mới mặc định 0 nên tiền các đơn đã có không đổi.
-- Chạy tay trong Supabase SQL Editor (sau 0017).

alter table don_thue_chi_tiet
  add column if not exists tien_chiet_khau_ngay numeric not null default 0;
alter table don_thue_chi_tiet drop constraint if exists don_thue_chi_tiet_chiet_khau_hop_le;
alter table don_thue_chi_tiet
  add constraint don_thue_chi_tiet_chiet_khau_hop_le
  check (
    tien_chiet_khau_ngay >= 0
    and tien_chiet_khau_ngay <= gia_thue_chot
    and not (tien_chiet_khau_ngay > 0 and phan_tram_chiet_khau > 0)
  );

alter table don_thue add column if not exists giam_gia_don numeric not null default 0;
alter table don_thue drop constraint if exists don_thue_giam_gia_don_hop_le;
alter table don_thue add constraint don_thue_giam_gia_don_hop_le check (giam_gia_don >= 0);

-- tao_don_thue(): thêm p_giam_gia_don + đọc tien_chiet_khau_ngay từ từng phần tử
-- p_thiet_bi. Đổi danh sách tham số nên phải drop chữ ký cũ (bản 0014) trước.
drop function if exists tao_don_thue(text, text, text, date, date, date, date, text, jsonb);

create or replace function tao_don_thue(
  p_khach_ten text,
  p_khach_sdt text,
  p_khach_nguoi_gioi_thieu text,
  p_ngay_bat_dau date,
  p_ngay_tra_du_kien date,
  p_ngay_bat_dau_su_dung date,
  p_ngay_ket_thuc_su_dung date,
  p_ghi_chu text,
  p_thiet_bi jsonb,
  p_giam_gia_don numeric default 0
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

  insert into don_thue (khach_hang_id, ngay_bat_dau, ngay_tra_du_kien, ngay_bat_dau_su_dung, ngay_ket_thuc_su_dung, ghi_chu, chang, giam_gia_don)
  values (v_khach_id, p_ngay_bat_dau, p_ngay_tra_du_kien, p_ngay_bat_dau_su_dung, p_ngay_ket_thuc_su_dung, p_ghi_chu, 'yeu_cau', coalesce(p_giam_gia_don, 0))
  returning id into v_don_id;

  insert into don_thue_chi_tiet (don_thue_id, thiet_bi_id, gia_thue_chot, phan_tram_chiet_khau, tien_chiet_khau_ngay, tinh_gia_von_theo)
  select
    v_don_id,
    (item->>'thiet_bi_id')::uuid,
    (item->>'gia_thue_chot')::numeric,
    coalesce((item->>'phan_tram_chiet_khau')::numeric, 0),
    coalesce((item->>'tien_chiet_khau_ngay')::numeric, 0),
    coalesce(item->>'tinh_gia_von_theo', 'ngay_di_chuyen')
  from jsonb_array_elements(p_thiet_bi) as item;

  return v_don_id;
end;
$$;
