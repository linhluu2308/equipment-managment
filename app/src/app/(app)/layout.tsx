import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { layThanhVienTheoEmail } from "@/lib/queries/thanhVien";
import { AuthProvider } from "@/lib/auth-context";
import AppShell from "@/components/AppShell";

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
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
