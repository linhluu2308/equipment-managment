"use client";

import { useState } from "react";
import { useVai } from "@/lib/auth-context";
import type { NhaCungCap } from "@/lib/types";
import NewEquipmentModal from "./NewEquipmentModal";
import ImportExcelModal from "./ImportExcelModal";

export default function EquipmentToolbar({
  danhSachNhaCungCap,
}: {
  danhSachNhaCungCap: Pick<NhaCungCap, "id" | "ten">[];
}) {
  const { vai } = useVai();
  const [openNew, setOpenNew] = useState(false);
  const [openImport, setOpenImport] = useState(false);

  if (vai === "kho") return null;

  return (
    <div className="flex gap-2.5">
      <button onClick={() => setOpenImport(true)} className="btn-secondary">
        📥 Import Excel
      </button>
      <button onClick={() => setOpenNew(true)} className="btn-primary">
        + Thêm thiết bị mới
      </button>
      {openNew && <NewEquipmentModal danhSachNhaCungCap={danhSachNhaCungCap} onClose={() => setOpenNew(false)} />}
      {openImport && <ImportExcelModal onClose={() => setOpenImport(false)} />}
    </div>
  );
}
