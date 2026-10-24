-- Nhả thiết bị ngay khi đã có biên bản kiểm tra khi trả, không đợi đơn chốt "Xong".
-- Trước đây: đơn ở Báo giá/Đã giao/Chờ trả (nay hiển thị là "Chờ thanh toán") giữ cứng
-- thiết bị suốt khoảng ngày thuê, kể cả khi thiết bị đã về kho và kiểm tra xong — khách
-- chưa thanh toán là thiết bị bị treo, không lên được đơn mới trùng ngày.
-- Nay: dòng thiết bị nào đã có kiem_tra_tinh_trang trong đơn đó thì không còn tính là
-- đang giữ. Logic giống hệt kiemTraTrungLich() trong lib/actions/donThue.ts.
--
-- Chạy tay trong Supabase SQL Editor.

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
    and dt.da_xoa = false
    and dt.ngay_bat_dau <= v_ngay_tra_du_kien
    and v_ngay_bat_dau <= dt.ngay_tra_du_kien
    and not exists (
      select 1 from kiem_tra_tinh_trang kt
      where kt.don_thue_id = dt.id and kt.thiet_bi_id = dtc.thiet_bi_id
    )
  limit 1;

  if v_don_trung_id is not null then
    raise exception 'Thiết bị không còn trống trong khoảng ngày này (đã bị giữ bởi đơn %)', v_don_trung_id
      using errcode = '23505';
  end if;

  return new;
end;
$$;
