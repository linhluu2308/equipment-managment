"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function KhoangThoiGianForm({
  tuNgay,
  denNgay,
  dangChon,
}: {
  tuNgay: string;
  denNgay: string;
  dangChon: boolean;
}) {
  const router = useRouter();
  const [mo, setMo] = useState(dangChon);
  const [tu, setTu] = useState(tuNgay);
  const [den, setDen] = useState(denNgay);

  function apDung(e: React.FormEvent) {
    e.preventDefault();
    if (!tu || !den) return;
    router.push(`/reports?from=${tu}&to=${den}`);
  }

  if (!mo) {
    return (
      <button type="button" onClick={() => setMo(true)} className="pill">
        Lựa chọn khoảng thời gian
      </button>
    );
  }

  return (
    <form onSubmit={apDung} className="flex items-center gap-1.5 flex-wrap">
      <input
        type="date"
        className="input !w-auto"
        value={tu}
        onChange={(e) => setTu(e.target.value)}
        max={den || undefined}
      />
      <span className="text-xs text-[var(--text-muted)]">→</span>
      <input
        type="date"
        className="input !w-auto"
        value={den}
        onChange={(e) => setDen(e.target.value)}
        min={tu || undefined}
      />
      <button type="submit" className="btn-primary !px-3 !py-1.5 text-xs">
        Xem
      </button>
      {!dangChon && (
        <button
          type="button"
          onClick={() => setMo(false)}
          className="text-xs text-[var(--text-muted)] hover:underline"
        >
          Huỷ
        </button>
      )}
    </form>
  );
}
