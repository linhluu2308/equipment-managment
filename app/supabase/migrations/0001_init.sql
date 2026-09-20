-- CineB Equipment Rental — schema khởi tạo (9 bảng theo docs/2-spec/design.md)
-- Chạy file này 1 lần trong Supabase SQL Editor (Project > SQL Editor > New query > Run).

create extension if not exists "pgcrypto";

create table if not exists khach_hang (
  id uuid primary key default gen_random_uuid(),
  ten text not null,
  so_dien_thoai text not null,
  nguoi_gioi_thieu text,
  created_at timestamptz not null default now()
);

create table if not exists thiet_bi (
  id uuid primary key default gen_random_uuid(),
  ma text unique,
  ten text not null,
  danh_muc text,
  nguon_goc text not null default 'so_huu' check (nguon_goc in ('so_huu', 'thue_ngoai')),
  nha_cung_cap text,
  gia_von numeric,
  mo_ta text,
  anh_url text,
  trang_thai text not null default 'san_sang' check (trang_thai in ('san_sang', 'dang_thue', 'bao_tri')),
  created_at timestamptz not null default now()
);

create table if not exists lich_su_gia (
  id uuid primary key default gen_random_uuid(),
  thiet_bi_id uuid not null references thiet_bi(id) on delete cascade,
  gia_thue numeric not null,
  ngay_ap_dung date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists don_thue (
  id uuid primary key default gen_random_uuid(),
  ma_don text unique,
  khach_hang_id uuid not null references khach_hang(id),
  chang text not null default 'yeu_cau' check (chang in ('yeu_cau', 'bao_gia', 'da_giao', 'cho_tra', 'xong', 'huy')),
  ngay_bat_dau date not null,
  ngay_tra_du_kien date not null,
  ghi_chu text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists don_thue_chi_tiet (
  id uuid primary key default gen_random_uuid(),
  don_thue_id uuid not null references don_thue(id) on delete cascade,
  thiet_bi_id uuid not null references thiet_bi(id),
  gia_thue_chot numeric not null,
  phan_tram_chiet_khau numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists coc_giay_to (
  id uuid primary key default gen_random_uuid(),
  don_thue_id uuid not null references don_thue(id) on delete cascade,
  loai_giay_to text not null,
  so_hieu text,
  anh_url text,
  trang_thai text not null default 'dang_giu' check (trang_thai in ('dang_giu', 'da_hoan_tra')),
  created_at timestamptz not null default now()
);

create table if not exists thanh_toan (
  id uuid primary key default gen_random_uuid(),
  don_thue_id uuid not null references don_thue(id) on delete cascade,
  so_tien numeric not null,
  ngay_thu date not null default current_date,
  hinh_thuc text,
  loai text not null check (loai in ('coc', 'dot', 'tat_toan', 'hoan_coc')),
  created_at timestamptz not null default now()
);

create table if not exists chi_phi (
  id uuid primary key default gen_random_uuid(),
  don_thue_id uuid not null references don_thue(id) on delete cascade,
  loai text not null,
  mo_ta text,
  so_tien numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists kiem_tra_tinh_trang (
  id uuid primary key default gen_random_uuid(),
  thiet_bi_id uuid not null references thiet_bi(id),
  don_thue_id uuid not null references don_thue(id) on delete cascade,
  ngay_tra date not null default current_date,
  tinh_trang text not null check (tinh_trang in ('tot', 'tray_xuoc', 'hong')),
  ghi_chu text,
  nguoi_kiem text,
  created_at timestamptz not null default now(),
  unique (don_thue_id, thiet_bi_id)
);

create index if not exists idx_dtct_thiet_bi on don_thue_chi_tiet(thiet_bi_id);
create index if not exists idx_dtct_don on don_thue_chi_tiet(don_thue_id);
create index if not exists idx_lsg_thiet_bi on lich_su_gia(thiet_bi_id, ngay_ap_dung desc);
create index if not exists idx_dt_chang on don_thue(chang);

-- MVP nội bộ (2 người dùng, chưa có đăng nhập) — RLS để mặc định tắt (Postgres/Supabase
-- mới tạo bảng thì RLS off) để publishable key đọc/ghi được thẳng qua PostgREST.
-- Khi có đăng nhập thật (đã hoãn trong design.md), bật RLS + viết policy theo vai trước khi go-live.
