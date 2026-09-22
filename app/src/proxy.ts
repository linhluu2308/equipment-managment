import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const DUONG_DAN_CONG_KHAI = ["/login", "/auth/callback"];

// Next.js 16 đổi quy ước "middleware.ts" -> "proxy.ts" (hàm export cũng đổi tên
// từ `middleware` sang `proxy`); dùng sai tên cũ khiến mọi trang trả về rỗng im lặng.
export async function proxy(request: NextRequest) {
  // Feed lịch Google Calendar tự tải định kỳ, không gửi cookie đăng nhập — route
  // này tự kiểm tra ?key= riêng, không đi qua kiểm tra session ở đây.
  if (request.nextUrl.pathname === "/calendar.ics") {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const laTrangCongKhai = DUONG_DAN_CONG_KHAI.some((p) => pathname.startsWith(p));

  if (!user && !laTrangCongKhai) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
