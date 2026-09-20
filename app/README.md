CineB — app quản lý cho thuê thiết bị. Next.js (App Router, TypeScript, Tailwind) + Supabase.

## Bước bắt buộc trước khi chạy: tạo schema database

1. Mở project Supabase (URL trong `.env.local`) → **SQL Editor** → **New query**.
2. Dán toàn bộ nội dung file [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) và bấm **Run**.
3. Tạo xong 9 bảng thì các trang trong app mới hoạt động được — trước đó mọi trang sẽ báo lỗi
   "Could not find the table" vì database còn trống.
4. Chạy tiếp [`supabase/migrations/0004_members.sql`](supabase/migrations/0004_members.sql) để tạo bảng
   `members` (đăng nhập bằng Google qua Supabase Auth), rồi `insert` sẵn email những người được phép vào app.

## Deploy trên Vercel

Repo này có `app/` là thư mục chứa project Next.js thật, các phần khác (`docs/`, `CLAUDE.md`...) chỉ là tài
liệu — khi tạo project trên Vercel phải đặt **Root Directory = `app`** (Settings → General → Root Directory),
và khai báo 3 biến môi trường trong `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY`) ở Settings → Environment Variables, vì file
`.env.local` không được commit lên Git.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
