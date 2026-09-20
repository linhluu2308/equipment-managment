"use client";

import { useTransition } from "react";
import { xoaThietBiKhoiDon } from "@/lib/actions/donThue";

export default function RemoveLineButton({ chiTietId, donId }: { chiTietId: string; donId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => start(() => xoaThietBiKhoiDon(chiTietId, donId))}
      className="text-xs text-red-600 hover:underline disabled:opacity-50"
    >
      Xoá
    </button>
  );
}
