import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ensureResellerInDb } from "@/lib/auth";

export default async function ResellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureResellerInDb();

  return (
    <DashboardLayout title="Reseller Dashboard">
      {children}
    </DashboardLayout>
  );
}
