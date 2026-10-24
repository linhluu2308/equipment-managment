-- Thêm/bớt thiết bị trong hành trình đơn: khách có thể thuê thêm thiết bị giữa chừng
-- hoặc trả sớm một vài thiết bị. Mỗi dòng thiết bị có thể có ngày riêng — để trống
-- (NULL) nghĩa là dùng theo ngày của cả đơn, nên toàn bộ dữ liệu cũ giữ nguyên.
--   ngay_xuat_kho            : ngày giao thiết bị này (thuê thêm giữa chừng)
--   ngay_bat_dau_su_dung     : ngày bắt đầu tính tiền của riêng thiết bị này
--   ngay_ket_thuc_su_dung    : ngày cuối tính tiền của riêng thiết bị này (trả sớm)
-- Chạy tay trong Supabase SQL Editor (sau 0016).

alter table don_thue_chi_tiet add column if not exists ngay_xuat_kho date;
alter table don_thue_chi_tiet add column if not exists ngay_bat_dau_su_dung date;
alter table don_thue_chi_tiet add column if not exists ngay_ket_thuc_su_dung date;

-- Nhật ký đơn: thêm 3 loại hành động thêm/xoá/trả sớm thiết bị.
alter table nhat_ky_thay_doi_don drop constraint if exists nhat_ky_thay_doi_don_hanh_dong_check;
alter table nhat_ky_thay_doi_don
  add constraint nhat_ky_thay_doi_don_hanh_dong_check
  check (hanh_dong in (
    'sua', 'xoa', 'khoi_phuc', 'sua_thanh_toan', 'xoa_thanh_toan',
    'them_thiet_bi', 'xoa_thiet_bi', 'tra_som_thiet_bi'
  ));

-- Chặn trùng lịch theo khoảng ngày RIÊNG của từng dòng thiết bị: bắt đầu từ
-- ngay_xuat_kho của dòng (nếu có) thay vì ngày xuất kho của cả đơn — thiết bị thuê
-- thêm từ ngày 21 không giữ lịch các ngày trước đó. Giữ nguyên quy tắc 0016: dòng đã
-- có biên bản kiểm tra khi trả / đơn đã xoá mềm thì không còn giữ thiết bị.
create or replace function chan_trung_lich_thiet_bi() returns trigger
language plpgsql
as $$
declare
  v_bat_dau date;
  v_tra_du_kien date;
  v_don_trung_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext(new.thiet_bi_id::text));

  select coalesce(new.ngay_xuat_kho, ngay_bat_dau), ngay_tra_du_kien
    into v_bat_dau, v_tra_du_kien
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
    and coalesce(dtc.ngay_xuat_kho, dt.ngay_bat_dau) <= v_tra_du_kien
    and v_bat_dau <= dt.ngay_tra_du_kien
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
