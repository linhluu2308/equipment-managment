import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { layThanhVienTheoEmail } from "@/lib/queries/thanhVien";

// Nhận code từ Google sau khi người dùng đồng ý đăng nhập, đổi lấy session Supabase,
// rồi so email với bảng members trước khi cho vào app.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        const thanhVien = await layThanhVienTheoEmail(user.email);
        if (thanhVien) {
          return NextResponse.redirect(`${origin}/`);
        }
      }

      await supabase.auth.signOut();
    }
  }

  return NextResponse.redirect(`${origin}/login?error=unauthorized`);
}
