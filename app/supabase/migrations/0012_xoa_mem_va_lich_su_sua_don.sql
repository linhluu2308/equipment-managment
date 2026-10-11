-- Xoá mềm đơn thuê (giữ lại để đối chiếu công nợ/thanh toán đã phát sinh) +
-- nhật ký thay đổi bắt buộc có lý do cho mọi lần Sửa/Xoá/Khôi phục đơn (vai "chu").
-- Chạy tay trong Supabase SQL Editor.

alter table don_thue add column if not exists da_xoa boolean not null default false;
alter table don_thue add column if not exists xoa_luc timestamptz;
alter table don_thue add column if not exists xoa_boi text;

create table if not exists nhat_ky_thay_doi_don (
  id uuid primary key default gen_random_uuid(),
  don_thue_id uuid not null references don_thue(id) on delete cascade,
  nguoi_sua text not null,
  nguoi_sua_email text not null,
  hanh_dong text not null check (hanh_dong in ('sua', 'xoa', 'khoi_phuc')),
  ly_do text not null check (length(trim(ly_do)) > 0),
  du_lieu_cu jsonb,
  du_lieu_moi jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_nkt_don on nhat_ky_thay_doi_don(don_thue_id, created_at desc);
create index if not exists idx_dt_da_xoa on don_thue(da_xoa);
