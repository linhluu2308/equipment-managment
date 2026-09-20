-- Chặn trùng lịch thiết bị ngay ở tầng cơ sở dữ liệu, không phụ thuộc vào code ứng dụng.
-- Trước đây app chỉ kiểm tra trùng lịch bằng 1 câu SELECT riêng trước khi INSERT — nếu 2
-- người cùng tạo đơn cho cùng 1 thiết bị gần như cùng lúc, cả 2 đều SELECT thấy "còn trống"
-- trước khi bên kia kịp INSERT, dẫn tới 2 đơn trùng lịch thật sự tồn tại.
--
-- Cách chặn: mỗi khi có dòng mới thêm vào don_thue_chi_tiet, trigger dưới đây tự khoá tạm
-- theo thiet_bi_id (pg_advisory_xact_lock — tự nhả khi transaction kết thúc) rồi mới kiểm
-- tra trùng lịch. Vì khoá này nằm trong Postgres và giữ trong suốt transaction, 2 giao dịch
-- cùng nhắm vào 1 thiết bị sẽ tự động phải chạy TUẦN TỰ thay vì cùng lúc — giao dịch thứ hai
-- luôn nhìn thấy dữ liệu do giao dịch thứ nhất vừa ghi.
--
-- Chạy file này 1 lần trong Supabase SQL Editor.

create or replace function chan_trung_lich_thiet_bi() returns trigger
language plpgsql
as $$
declare
  v_ngay_bat_dau date;
  v_ngay_tra_du_kien date;
  v_don_trung_id uuid;
begin
  -- Khoá theo thiết bị trong phạm vi transaction hiện tại, tự nhả khi commit/rollback.
  perform pg_advisory_xact_lock(hashtext(new.thiet_bi_id::text));

  select ngay_bat_dau, ngay_tra_du_kien
    into v_ngay_bat_dau, v_ngay_tra_du_kien
  from don_thue
  where id = new.don_thue_id;

  select dt.id
    into v_don_trung_id
  from don_thue_chi_tiet dtc
  join don_thue dt on dt.id = dtc.don_thue_id
  where dtc.thiet_bi_id = new.thiet_bi_id
    and dt.id <> new.don_thue_id
    and dt.chang in ('bao_gia', 'da_giao', 'cho_tra')
    and dt.ngay_bat_dau <= v_ngay_tra_du_kien
    and v_ngay_bat_dau <= dt.ngay_tra_du_kien
  limit 1;

  if v_don_trung_id is not null then
    raise exception 'Thiết bị không còn trống trong khoảng ngày này (đã bị giữ bởi đơn %)', v_don_trung_id
      using errcode = '23505';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_chan_trung_lich_thiet_bi on don_thue_chi_tiet;

create trigger trg_chan_trung_lich_thiet_bi
before insert on don_thue_chi_tiet
for each row execute function chan_trung_lich_thiet_bi();
