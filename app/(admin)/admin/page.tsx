import { Users, ShoppingBag, TrendingUp, Package } from "lucide-react";
import { db } from "@/lib/db";
import { StatsCard } from "@/components/dashboard/stats-card";

export const metadata = { title: "Admin Overview — Aurani" };

export default async function AdminPage() {
  const [resellerCount, orderCount, productCount, commissionAgg] = await Promise.all([
    db.reseller.count({ where: { isActive: true } }),
    db.order.count({ where: { status: "PAID" } }),
    db.product.count({ where: { status: "ACTIVE" } }),
    db.payment.aggregate({ _sum: { commissionAmount: true } }),
  ]);

  const totalCommission = Number(commissionAgg._sum.commissionAmount ?? 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl text-foreground">Platform Overview</h2>
        <p className="mt-1 font-sans text-sm text-muted-foreground">All resellers · all time</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Active Resellers" value={resellerCount} icon={Users} />
        <StatsCard label="Paid Orders" value={orderCount} icon={ShoppingBag} />
        <StatsCard label="Active Products" value={productCount} icon={Package} />
        <StatsCard
          label="Total Commission"
          value={`₹${totalCommission.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          icon={TrendingUp}
        />
      </div>
    </div>
  );
}
