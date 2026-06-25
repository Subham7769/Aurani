import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { requireRole } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("ADMIN");

  return (
    <DashboardLayout variant="admin" title="Admin Panel">
      {children}
    </DashboardLayout>
  );
}
