import { db } from "@/lib/db";
import { ResellersTable } from "@/components/admin/resellers-table";
import type { ResellerRow } from "@/components/admin/resellers-table";

export const metadata = { title: "Resellers — Aurani Admin" };

export default async function ResellersPage() {
  const resellers = await db.reseller.findMany({
    include: {
      user: { select: { email: true } },
      _count: { select: { products: { where: { status: "ACTIVE" } }, orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows: ResellerRow[] = resellers.map((r: typeof resellers[number]) => ({
    id: r.id,
    email: r.user.email,
    commission: `${(Number(r.commissionRate) * 100).toFixed(0)}%`,
    products: r._count.products,
    orders: r._count.orders,
    status: r.isActive ? "ACTIVE" : "SUSPENDED",
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl text-foreground">Resellers</h2>
        <p className="mt-1 font-sans text-sm text-muted-foreground">
          {resellers.length} reseller{resellers.length !== 1 ? "s" : ""}
        </p>
      </div>
      <ResellersTable rows={rows} />
    </div>
  );
}
