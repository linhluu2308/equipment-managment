import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only client dùng secret key — bỏ qua RLS. Không được import vào bất kỳ
 * Client Component nào (secret key không có tiền tố NEXT_PUBLIC_ nên sẽ lỗi nếu lọt vào bundle trình duyệt).
 */
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  );
}
