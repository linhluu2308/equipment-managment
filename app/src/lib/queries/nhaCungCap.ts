import { createClient } from "@/lib/supabase/admin";
import type { GiaoDichCongNoNcc, NhaCungCap } from "@/lib/types";

export interface NhaCungCapDong extends NhaCungCap {
  tongNo: number;
  tongDaTra: number;
  conNo: number;
  soThietBiDangDung: number;
}

function tinhSoDu(giaoDich: Pick<GiaoDichCongNoNcc, "loai" | "so_tien">[]) {
  const tongNo = giaoDich.filter((g) => g.loai === "no_phat_sinh").reduce((s, g) => s + g.so_tien, 0);
  const tongDaTra = giaoDich.filter((g) => g.loai === "thanh_toan").reduce((s, g) => s + g.so_tien, 0);
  return { tongNo, tongDaTra, conNo: tongNo - tongDaTra };
}

export async function layDanhSachNhaCungCap(): Promise<NhaCungCapDong[]> {
  const supabase = createClient();

  const [{ data: dsNcc, error: e1 }, { data: giaoDich, error: e2 }, { data: thietBi, error: e3 }] = await Promise.all([
    supabase.from("nha_cung_cap").select("*").order("ten"),
    supabase.from("giao_dich_cong_no_ncc").select("nha_cung_cap_id, loai, so_tien"),
    supabase.from("thiet_bi").select("nha_cung_cap_id").eq("nguon_goc", "thue_ngoai").not("nha_cung_cap_id", "is", null),
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);
  if (e3) throw new Error(e3.message);

  return (dsNcc ?? []).map((ncc) => {
    const giaoDichCuaNcc = (giaoDich ?? []).filter((g) => g.nha_cung_cap_id === ncc.id);
    const soThietBiDangDung = (thietBi ?? []).filter((t) => t.nha_cung_cap_id === ncc.id).length;
    return { ...ncc, ...tinhSoDu(giaoDichCuaNcc), soThietBiDangDung };
  });
}

export async function layNhaCungCap(id: string) {
  const supabase = createClient();

  const [{ data: ncc, error: e1 }, { data: giaoDich, error: e2 }, { data: thietBi, error: e3 }] = await Promise.all([
    supabase.from("nha_cung_cap").select("*").eq("id", id).single(),
    supabase
      .from("giao_dich_cong_no_ncc")
      .select("*, don_thue(id, ma_don), thiet_bi(id, ten, ma)")
      .eq("nha_cung_cap_id", id)
      .order("ngay", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("thiet_bi").select("id, ten, ma, gia_von, trang_thai").eq("nha_cung_cap_id", id),
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);
  if (e3) throw new Error(e3.message);

  return {
    nhaCungCap: ncc,
    giaoDich: giaoDich ?? [],
    thietBi: thietBi ?? [],
    ...tinhSoDu(giaoDich ?? []),
  };
}
