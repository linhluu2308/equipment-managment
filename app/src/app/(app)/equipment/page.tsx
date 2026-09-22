import { listThietBi } from "@/lib/actions/thietBi";
import EquipmentFilters from "@/components/equipment/EquipmentFilters";

export const dynamic = "force-dynamic";

export default async function EquipmentPage() {
  const thietBiList = await listThietBi();

  return <EquipmentFilters thietBiList={thietBiList} />;
}
