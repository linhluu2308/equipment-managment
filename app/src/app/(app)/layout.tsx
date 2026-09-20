import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { layThanhVienTheoEmail } from "@/lib/queries/thanhVien";
import { AuthProvider } from "@/lib/auth-context";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) redirect("/login");

  const thanhVien = await layThanhVienTheoEmail(user.email);
  if (!thanhVien) redirect("/login?error=unauthorized");

  return (
    <AuthProvider
      user={{
        email: user.email,
        ten: thanhVien.ten,
        vai: thanhVien.vai,
        anhUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
      }}
    >
      <div className="h-screen flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto">
          <Header />
          <div className="p-6 md:p-8 flex flex-col gap-5">{children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}
