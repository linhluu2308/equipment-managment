"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type Vai = "chu" | "kho";

export interface NguoiDungHienTai {
  email: string;
  ten: string;
  vai: Vai;
  anhUrl: string | null;
}

const AuthContext = createContext<NguoiDungHienTai | null>(null);

export function AuthProvider({
  user,
  children,
}: {
  user: NguoiDungHienTai;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() phải dùng bên trong AuthProvider");
  return ctx;
}

export function useVai() {
  return { vai: useAuth().vai };
}

export function useDangXuat() {
  const router = useRouter();
  return async function dangXuat() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };
}
