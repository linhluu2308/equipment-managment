"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/admin";
import { boDau } from "@/lib/text";

/**
 * Tìm nhà cung cấp có tên khớp (không phân biệt hoa/thường, có/không dấu) —
 * nếu chưa có thì tạo mới. Dùng cho Import Excel và ô "+ Thêm nhà cung cấp mới"
 * trong form thiết bị, để không sinh ra nhiều dòng trùng chỉ khác cách gõ.
 */
export async function timHoacTaoNhaCungCap(ten: string): Promise<string> {
  const tenChuan = ten.trim();
  if (!tenChuan) throw new Error("Cần nhập tên nhà cung cấp.");

  const supabase = createClient();
  const { data: dsNcc, error: eList } = await supabase.from("nha_cung_cap").select("id, ten");
  if (eList) throw new Error(eList.message);

  const khop = (dsNcc ?? []).find((n) => boDau(n.ten) === boDau(tenChuan));
  if (khop) return khop.id;

  const { data: moi, error } = await supabase.from("nha_cung_cap").insert({ ten: tenChuan }).select("id").single();
  if (error) {
    if (error.code === "23505") {
      // Trùng ten y hệt do 2 request chạy gần như đồng thời — lấy lại id vừa được tạo bởi request kia.
      const { data: laiNcc } = await supabase.from("nha_cung_cap").select("id").eq("ten", tenChuan).single();
      if (laiNcc) return laiNcc.id;
    }
    throw new Error(error.message);
  }
  revalidatePath("/suppliers");
  return moi.id;
}

export interface DauVaoNhaCungCap {
  ten: string;
  so_dien_thoai?: string;
  ghi_chu?: string;
}

export async function themNhaCungCap(input: DauVaoNhaCungCap) {
  if (!input.ten.trim()) throw new Error("Cần nhập tên nhà cung cấp.");
  const supabase = createClient();
  const { error } = await supabase.from("nha_cung_cap").insert({
    ten: input.ten.trim(),
    so_dien_thoai: input.so_dien_thoai || null,
    ghi_chu: input.ghi_chu || null,
  });
  if (error) {
    if (error.code === "23505") throw new Error("Tên nhà cung cấp này đã tồn tại.");
    throw new Error(error.message);
  }
  revalidatePath("/suppliers");
}

export async function suaNhaCungCap(id: string, input: DauVaoNhaCungCap) {
  if (!input.ten.trim()) throw new Error("Cần nhập tên nhà cung cấp.");
  const supabase = createClient();
  const { error } = await supabase
    .from("nha_cung_cap")
    .update({
      ten: input.ten.trim(),
      so_dien_thoai: input.so_dien_thoai || null,
      ghi_chu: input.ghi_chu || null,
    })
    .eq("id", id);
  if (error) {
    if (error.code === "23505") throw new Error("Tên nhà cung cấp này đã tồn tại.");
    throw new Error(error.message);
  }
  revalidatePath("/suppliers");
  revalidatePath(`/suppliers/${id}`);
}

export async function xoaNhaCungCap(id: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("nha_cung_cap").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      return {
        error: "Không thể xoá — nhà cung cấp này đang gắn với thiết bị hoặc có lịch sử công nợ.",
      };
    }
    return { error: error.message };
  }
  revalidatePath("/suppliers");
  return {};
}

export interface DauVaoThanhToanNcc {
  so_tien: number;
  ngay?: string;
  ghi_chu?: string;
}

export async function ghiNhanThanhToanNcc(nhaCungCapId: string, input: DauVaoThanhToanNcc) {
  if (!input.so_tien || input.so_tien <= 0) throw new Error("Số tiền thanh toán phải lớn hơn 0.");
  const supabase = createClient();
  const { error } = await supabase.from("giao_dich_cong_no_ncc").insert({
    nha_cung_cap_id: nhaCungCapId,
    loai: "thanh_toan",
    so_tien: input.so_tien,
    ngay: input.ngay || undefined,
    ghi_chu: input.ghi_chu || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/suppliers/${nhaCungCapId}`);
  revalidatePath("/suppliers");
}
