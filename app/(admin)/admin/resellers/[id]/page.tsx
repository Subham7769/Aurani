import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { CommissionForm } from "@/components/admin/commission-form";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@/components/dashboard/data-table";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const reseller = await db.reseller.findUnique({ where: { id }, include: { user: true } });
  return { title: `${reseller?.user.email ?? "Reseller"} — Aurani Admin` };
}

interface OrderRow {
  id: string;
  product: string;
  amount: string;
  status: string;
  date: string;
}

const orderColumns: ColumnDef<OrderRow>[] = [
  { key: "product", header: "Product", sortable: true },
  { key: "amount", header: "Amount" },
  {
    key: "status",
    header: "Status",
    render: (v) => (
      <Badge variant={String(v) === "PAID" ? "default" : "outline"}>{String(v)}</Badge>
    ),
  },
  { key: "date", header: "Date", sortable: true },
];

export default async function ResellerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const reseller = await db.reseller.findUnique({
    where: { id },
    include: {
      user: { select: { email: true } },
      orders: {
        include: { product: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      _count: { select: { products: true, orders: true } },
    },
  });

  if (!reseller) notFound();

  const orderRows: OrderRow[] = reseller.orders.map((o: typeof reseller.orders[number]) => ({
    id: o.id,
    product: o.product.title,
    amount: `₹${o.amount.toString()}`,
    status: o.status,
    date: new Date(o.createdAt).toLocaleDateString("en-IN"),
  }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-serif text-2xl text-foreground">{reseller.user.email}</h2>
        <p className="mt-1 font-sans text-sm text-muted-foreground">
          {reseller._count.products} products · {reseller._count.orders} orders ·{" "}
          <Badge variant={reseller.isActive ? "default" : "destructive"} className="text-xs">
            {reseller.isActive ? "ACTIVE" : "SUSPENDED"}
          </Badge>
        </p>
      </div>

      <CommissionForm
        resellerId={id}
        currentCommission={Number(reseller.commissionRate)}
        isActive={reseller.isActive}
      />

      <div>
        <h3 className="mb-4 font-serif text-xl text-foreground">Order History</h3>
        <DataTable columns={orderColumns} data={orderRows} searchPlaceholder="Search orders..." />
      </div>
    </div>
  );
}
