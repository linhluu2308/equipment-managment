"use client";

import { useState } from "react";
import NewOrderModal from "./NewOrderModal";

export default function NewOrderButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        + Tạo đơn mới
      </button>
      {open && <NewOrderModal onClose={() => setOpen(false)} />}
    </>
  );
}
