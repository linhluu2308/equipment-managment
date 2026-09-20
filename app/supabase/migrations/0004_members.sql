-- Bảng thành viên được phép đăng nhập (Supabase Auth + Google) — quản trị viên thêm sẵn,
-- không có trang tự đăng ký. App so email Google với cột email ở đây để cấp quyền + lấy vai.
-- Chạy trong Supabase SQL Editor sau khi đã bật Google provider ở Authentication > Providers.

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  ten text not null,
  vai text not null check (vai in ('chu', 'kho')),
  created_at timestamptz not null default now()
);

-- Chỉ đọc qua service role (server) — không expose qua publishable key cho trình duyệt.
alter table members enable row level security;
