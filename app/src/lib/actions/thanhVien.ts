"use server";

import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Vai } from "@/lib/auth-context";

async function layEmailNguoiDangDangNhap(): Promise<string> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Chưa đăng nhập.");
  return user.email;
}

export interface DauVaoThanhVien {
  email: string;
  ten: string;
  vai: Vai;
}

export async function themThanhVien(input: DauVaoThanhVien) {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.ten.trim()) throw new Error("Cần nhập đủ email và tên.");

  const supabase = createAdminClient();
  const { error } = await supabase.from("members").insert({ email, ten: input.ten.trim(), vai: input.vai });
  if (error) {
    if (error.code === "23505") throw new Error("Email này đã có trong danh sách thành viên.");
    throw new Error(error.message);
  }
  revalidatePath("/members");
}

export async function suaThanhVien(id: string, input: { ten: string; vai: Vai }) {
  if (!input.ten.trim()) throw new Error("Cần nhập tên.");

  const emailHienTai = await layEmailNguoiDangDangNhap();
  const supabase = createAdminClient();

  const { data: dong, error: eDong } = await supabase.from("members").select("email").eq("id", id).single();
  if (eDong) throw new Error(eDong.message);
  if (dong.email === emailHienTai && input.vai !== "chu") {
    throw new Error("Không thể tự đổi vai của chính mình khỏi Chủ.");
  }

  const { error } = await supabase.from("members").update({ ten: input.ten.trim(), vai: input.vai }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/members");
}

export async function xoaThanhVien(id: string) {
  const emailHienTai = await layEmailNguoiDangDangNhap();
  const supabase = createAdminClient();

  const { data: dong, error: eDong } = await supabase.from("members").select("email").eq("id", id).single();
  if (eDong) throw new Error(eDong.message);
  if (dong.email === emailHienTai) {
    throw new Error("Không thể tự xoá chính mình.");
  }

  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/members");
}
