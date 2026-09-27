-- Quản lý công nợ nhà cung cấp (thiết bị thuê ngoài để cho khách thuê lại).
-- Chạy tay trong Supabase SQL Editor.

create extension if not exists unaccent;

-- 1. Chuẩn hoá "nhà cung cấp" từ text tự do trên thiet_bi thành bảng riêng.
create table if not exists nha_cung_cap (
  id uuid primary key default gen_random_uuid(),
  ten text not null unique,
  so_dien_thoai text,
  ghi_chu text,
  created_at timestamptz not null default now()
);

alter table nha_cung_cap enable row level security;

-- Gộp các giá trị nha_cung_cap hiện có (chuẩn hoá khoảng trắng, không phân biệt
-- hoa/thường và dấu) thành 1 dòng supplier duy nhất mỗi nhóm.
insert into nha_cung_cap (ten)
select distinct on (lower(unaccent(trim(nha_cung_cap)))) trim(nha_cung_cap)
from thiet_bi
where nguon_goc = 'thue_ngoai' and coalesce(trim(nha_cung_cap), '') <> ''
order by lower(unaccent(trim(nha_cung_cap))), trim(nha_cung_cap)
on conflict (ten) do nothing;

alter table thiet_bi add column if not exists nha_cung_cap_id uuid references nha_cung_cap(id);

update thiet_bi tb
set nha_cung_cap_id = ncc.id
from nha_cung_cap ncc
where tb.nguon_goc = 'thue_ngoai'
  and coalesce(trim(tb.nha_cung_cap), '') <> ''
  and lower(unaccent(trim(tb.nha_cung_cap))) = lower(unaccent(ncc.ten));

alter table thiet_bi drop column nha_cung_cap;

-- 2. Sổ công nợ: mỗi dòng là 1 khoản nợ phát sinh (khi đơn thuê thiết bị của
-- supplier này hoàn tất) hoặc 1 khoản mình đã thanh toán cho supplier.
create table if not exists giao_dich_cong_no_ncc (
  id uuid primary key default gen_random_uuid(),
  nha_cung_cap_id uuid not null references nha_cung_cap(id),
  loai text not null check (loai in ('no_phat_sinh', 'thanh_toan')),
  so_tien numeric not null check (so_tien > 0),
  ngay date not null default current_date,
  don_thue_id uuid references don_thue(id),
  thiet_bi_id uuid references thiet_bi(id),
  ghi_chu text,
  created_at timestamptz not null default now(),
  -- Với loai = 'no_phat_sinh', mỗi (đơn, thiết bị) chỉ được ghi nợ 1 lần — chặn
  -- trùng lặp nếu chuyenChangDon() lỡ chạy 2 lần cho cùng 1 đơn (upsert ignoreDuplicates
  -- dùng đúng constraint này). Dòng 'thanh_toan' luôn có 2 cột này = null, và NULL
  -- không đụng độ unique trong Postgres nên không bị chặn nhầm.
  unique (don_thue_id, thiet_bi_id)
);

alter table giao_dich_cong_no_ncc enable row level security;

create index if not exists idx_giao_dich_cong_no_ncc_ncc on giao_dich_cong_no_ncc(nha_cung_cap_id);
