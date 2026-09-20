"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/admin";
import type { NguonGoc } from "@/lib/types";

export async function listThietBi() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("thiet_bi")
    .select("*, lich_su_gia(gia_thue, ngay_ap_dung)")
    .order("ten");
  if (error) throw new Error(error.message);
  return data.map((tb) => ({
    ...tb,
    gia_hien_hanh: giaMoiNhat(tb.lich_su_gia),
  }));
}

export async function getThietBi(id: string) {
  const supabase = await createClient();
  const [{ data: thietBi, error: e1 }, { data: lichSuGia, error: e2 }, { data: donHang, error: e3 }, { data: kiemTra, error: e4 }] =
    await Promise.all([
      supabase.from("thiet_bi").select("*").eq("id", id).single(),
      supabase
        .from("lich_su_gia")
        .select("*")
        .eq("thiet_bi_id", id)
        .order("ngay_ap_dung", { ascending: false }),
      supabase
        .from("don_thue_chi_tiet")
        .select("*, don_thue(id, ma_don, chang, ngay_bat_dau, ngay_tra_du_kien, khach_hang(ten))")
        .eq("thiet_bi_id", id),
      supabase
        .from("kiem_tra_tinh_trang")
        .select("*")
        .eq("thiet_bi_id", id)
        .order("ngay_tra", { ascending: false }),
    ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);
  if (e3) throw new Error(e3.message);
  if (e4) throw new Error(e4.message);
  return { thietBi, lichSuGia: lichSuGia ?? [], donHang: donHang ?? [], kiemTra: kiemTra ?? [] };
}

function giaMoiNhat(lichSuGia: { gia_thue: number; ngay_ap_dung: string }[] | null) {
  if (!lichSuGia || lichSuGia.length === 0) return 0;
  return [...lichSuGia].sort((a, b) => (a.ngay_ap_dung < b.ngay_ap_dung ? 1 : -1))[0].gia_thue;
}

export interface DauVaoThietBi {
  ma?: string;
  ten: string;
  danh_muc?: string;
  nguon_goc: NguonGoc;
  nha_cung_cap?: string;
  gia_von?: number;
  mo_ta?: string;
  anh_url?: string;
  gia_thue: number;
}

export async function createThietBi(input: DauVaoThietBi) {
  if (!input.ten?.trim()) throw new Error("Cần nhập tên thiết bị.");
  if (!input.gia_thue || input.gia_thue <= 0) throw new Error("Giá thuê/ngày phải là số lớn hơn 0.");

  const supabase = await createClient();
  const { data: thietBi, error } = await supabase
    .from("thiet_bi")
    .insert({
      ma: input.ma || null,
      ten: input.ten,
      danh_muc: input.danh_muc || null,
      nguon_goc: input.nguon_goc,
      nha_cung_cap: input.nguon_goc === "thue_ngoai" ? input.nha_cung_cap : null,
      gia_von: input.nguon_goc === "thue_ngoai" ? input.gia_von : null,
      mo_ta: input.mo_ta || null,
      anh_url: input.anh_url || null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  const { error: eGia } = await supabase
    .from("lich_su_gia")
    .insert({ thiet_bi_id: thietBi.id, gia_thue: input.gia_thue });
  if (eGia) throw new Error(eGia.message);

  revalidatePath("/equipment");
  return thietBi;
}

export interface DongImportThietBi {
  ma?: string;
  ten: string;
  danh_muc?: string;
  nguon_goc: NguonGoc;
  nha_cung_cap?: string;
  gia_von?: number;
  gia_thue: number;
}

export async function importThietBiHangLoat(rows: DongImportThietBi[]) {
  const supabase = await createClient();
  const results: { row: number; ok: boolean; loi?: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.ten?.trim()) {
      results.push({ row: i + 1, ok: false, loi: "Thiếu tên thiết bị" });
      continue;
    }
    if (!row.gia_thue || row.gia_thue <= 0) {
      results.push({ row: i + 1, ok: false, loi: "Thiếu/sai giá thuê" });
      continue;
    }
    try {
      const { data: thietBi, error } = await supabase
        .from("thiet_bi")
        .insert({
          ma: row.ma || null,
          ten: row.ten,
          danh_muc: row.danh_muc || null,
          nguon_goc: row.nguon_goc,
          nha_cung_cap: row.nguon_goc === "thue_ngoai" ? row.nha_cung_cap : null,
          gia_von: row.nguon_goc === "thue_ngoai" ? row.gia_von : null,
        })
        .select()
        .single();
      if (error) throw error;
      const { error: eGia } = await supabase
        .from("lich_su_gia")
        .insert({ thiet_bi_id: thietBi.id, gia_thue: row.gia_thue });
      if (eGia) throw eGia;
      results.push({ row: i + 1, ok: true });
    } catch (err) {
      results.push({ row: i + 1, ok: false, loi: (err as Error).message });
    }
  }

  revalidatePath("/equipment");
  return results;
}
