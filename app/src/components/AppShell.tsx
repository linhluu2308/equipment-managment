"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [menuMoOMobile, setMenuMoOMobile] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar open={menuMoOMobile} onClose={() => setMenuMoOMobile(false)} />
      <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
        <Header onMoMenu={() => setMenuMoOMobile(true)} />
        <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-5">{children}</div>
      </main>
    </div>
  );
}
