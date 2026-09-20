import { createClient as createAdminClient } from "@/lib/supabase/admin";
import type { Vai } from "@/lib/auth-context";

export interface ThanhVien {
  ten: string;
  vai: Vai;
}

export interface ThanhVienDong extends ThanhVien {
  id: string;
  email: string;
}

/**
 * Tra cứu thành viên theo email qua service role — bảng members có RLS bật,
 * publishable key không đọc được nên phải dùng admin client ở server.
 */
export async function layThanhVienTheoEmail(email: string): Promise<ThanhVien | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("members")
    .select("ten, vai")
    .eq("email", email)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ThanhVien | null;
}

export async function layDanhSachThanhVien(): Promise<ThanhVienDong[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("members").select("id, email, ten, vai").order("ten");
  if (error) throw new Error(error.message);
  return data as ThanhVienDong[];
}
