"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useVai } from "@/lib/auth-context";
import { capNhatTrangThaiThietBi, xoaThietBi } from "@/lib/actions/thietBi";
import { TRANG_THAI_THIET_BI_LABEL, type ThietBi, type TrangThaiThietBi } from "@/lib/types";
import EditEquipmentModal from "./EditEquipmentModal";

const TRANG_THAI_CO_THE_CHON: TrangThaiThietBi[] = ["san_sang", "bao_tri", "hong", "thanh_ly"];

export default function EquipmentActions({ thietBi, giaHienHanh }: { thietBi: ThietBi; giaHienHanh: number }) {
  const { vai } = useVai();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [openSua, setOpenSua] = useState(false);
  const [loi, setLoi] = useState("");

  if (vai !== "chu") return null;

  function doiTrangThai(trangThai: TrangThaiThietBi) {
    setLoi("");
    start(async () => {
      try {
        await capNhatTrangThaiThietBi(thietBi.id, trangThai);
        router.refresh();
      } catch (err) {
        setLoi((err as Error).message);
      }
    });
  }

  function xoa() {
    setLoi("");
    if (!confirm(`Xoá vĩnh viễn thiết bị "${thietBi.ten}"? Không thể hoàn tác.`)) return;
    start(async () => {
      try {
        await xoaThietBi(thietBi.id);
        router.push("/equipment");
        router.refresh();
      } catch (err) {
        setLoi((err as Error).message);
      }
    });
  }

  return (
    <section className="card space-y-3">
      <div className="card-title !mb-0">Quản lý thiết bị</div>
      {loi && <p className="badge badge-danger !inline-block">{loi}</p>}

      <div className="flex flex-wrap gap-2">
        <button className="btn-secondary" onClick={() => setOpenSua(true)}>
          ✏️ Sửa thông tin
        </button>
        {TRANG_THAI_CO_THE_CHON.filter((t) => t !== thietBi.trang_thai).map((t) => (
          <button key={t} disabled={pending} className="btn-secondary" onClick={() => doiTrangThai(t)}>
            {pending ? "Đang lưu..." : `→ ${TRANG_THAI_THIET_BI_LABEL[t]}`}
          </button>
        ))}
        <button disabled={pending} className="btn-danger-outline" onClick={xoa}>
          {pending ? "Đang xử lý..." : "🗑️ Xoá thiết bị"}
        </button>
      </div>
      <p className="text-xs text-[var(--text-muted)]">
        Không xoá được thiết bị đã có lịch sử cho thuê/kiểm tra — hãy đánh dấu &quot;Hỏng&quot; hoặc &quot;Đã thanh
        lý&quot; thay vì xoá trong trường hợp đó.
      </p>

      {openSua && <EditEquipmentModal thietBi={thietBi} giaHienHanh={giaHienHanh} onClose={() => setOpenSua(false)} />}
    </section>
  );
}
