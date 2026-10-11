import { layDanhSachKhachHang } from "@/lib/queries/khachHang";
import CustomerFilters from "@/components/customers/CustomerFilters";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const khachHangList = await layDanhSachKhachHang();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold">Khách hàng</h1>
      <CustomerFilters khachHangList={khachHangList} />
    </div>
  );
}
