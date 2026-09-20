"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginNoiDung />
    </Suspense>
  );
}

function LoginNoiDung() {
  const params = useSearchParams();
  const loi = params.get("error");
  const [dangXuLy, setDangXuLy] = useState(false);

  async function dangNhapGoogle() {
    setDangXuLy(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-sidebar)] p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-10 w-full max-w-sm flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-[var(--text-main)]">
          CineB
          <span className="text-[11px] font-bold bg-[#0369a1] text-[#38bdf8] px-1.5 py-0.5 rounded tracking-wider">
            OPS
          </span>
        </div>
        <p className="text-sm text-[var(--text-muted)] text-center">
          Đăng nhập để quản lý cho thuê thiết bị
        </p>

        {loi === "unauthorized" && (
          <div className="w-full text-sm text-[var(--status-danger-text)] bg-[var(--status-danger-bg)] rounded-lg px-4 py-2.5 text-center font-medium">
            Bạn không có quyền truy cập.
          </div>
        )}

        <button
          onClick={dangNhapGoogle}
          disabled={dangXuLy}
          className="w-full flex items-center justify-center gap-3 border border-[var(--border-color)] rounded-lg px-4 py-3 font-semibold text-[var(--text-main)] hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GoogleIcon />
          {dangXuLy ? "Đang chuyển hướng..." : "Đăng nhập bằng Google"}
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.91c1.7-1.57 2.69-3.88 2.69-6.64z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.17l-2.91-2.27c-.81.54-1.84.86-3.05.86-2.35 0-4.34-1.58-5.05-3.71H.98v2.34C2.46 15.98 5.48 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.71c-.18-.54-.28-1.11-.28-1.71s.1-1.17.28-1.71V4.95H.98A8.996 8.996 0 000 9c0 1.45.35 2.83.98 4.05l2.97-2.34z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.46 2.02.98 4.95l2.97 2.34C4.66 5.16 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}
