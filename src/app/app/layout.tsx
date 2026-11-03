import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth-service";
import { AppShell } from "@/components/layout/app-shell";

export default async function AuthenticatedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/app/dashboard");
  }

  return <AppShell initialUser={user}>{children}</AppShell>;
}
