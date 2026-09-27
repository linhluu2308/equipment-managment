import { listThietBi, layGoiYHangTheoDanhMuc } from "@/lib/actions/thietBi";
import { layDanhSachNhaCungCap } from "@/lib/queries/nhaCungCap";
import EquipmentFilters from "@/components/equipment/EquipmentFilters";

export const dynamic = "force-dynamic";

export default async function EquipmentPage() {
  const [thietBiList, danhSachNhaCungCap, goiYHang] = await Promise.all([
    listThietBi(),
    layDanhSachNhaCungCap(),
    layGoiYHangTheoDanhMuc(),
  ]);

  return <EquipmentFilters thietBiList={thietBiList} danhSachNhaCungCap={danhSachNhaCungCap} goiYHang={goiYHang} />;
}
