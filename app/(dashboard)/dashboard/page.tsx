import { Package, ShoppingBag, MessageCircle, TrendingUp } from "lucide-react";
import { requireResellerId } from "@/lib/auth";
import { db } from "@/lib/db";
import { StatsCard } from "@/components/dashboard/stats-card";

export const metadata = { title: "Dashboard — Aurani" };

export default async function DashboardPage() {
  const resellerId = await requireResellerId();

  const [productCount, orderCount, activeGroups, recentJob] = await Promise.all([
    db.product.count({ where: { resellerId, status: "ACTIVE" } }),
    db.order.count({ where: { resellerId, status: "PENDING" } }),
    db.whatsAppGroup.count({ where: { resellerId, isSelected: true } }),
    db.postJob.findFirst({
      where: { product: { resellerId } },
      orderBy: { createdAt: "desc" },
      select: { status: true, platform: true, createdAt: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl text-foreground">Overview</h2>
        <p className="mt-1 font-sans text-sm text-muted-foreground">
          Your store at a glance
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Active Products"
          value={productCount}
          icon={Package}
        />
        <StatsCard
          label="Pending Orders"
          value={orderCount}
          icon={ShoppingBag}
        />
        <StatsCard
          label="Active WA Groups"
          value={activeGroups}
          icon={MessageCircle}
        />
        <StatsCard
          label="Last Post Status"
          value={recentJob ? recentJob.status : "—"}
          icon={TrendingUp}
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-serif text-lg text-foreground">Quick Actions</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/dashboard/products/new"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 font-sans text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Add Product
          </a>
          <a
            href="/dashboard/whatsapp"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 font-sans text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            WhatsApp Setup
          </a>
          <a
            href="/dashboard/orders"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 font-sans text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            View Orders
          </a>
        </div>
      </div>
    </div>
  );
}
