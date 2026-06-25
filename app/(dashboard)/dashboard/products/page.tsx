import Link from "next/link";
import { Plus } from "lucide-react";
import { requireResellerId } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProductsTable } from "@/components/dashboard/products-table";
import type { ProductRow } from "@/components/dashboard/products-table";

export const metadata = { title: "Products — Aurani Dashboard" };

export default async function ProductsPage() {
  const resellerId = await requireResellerId();

  const products = await db.product.findMany({
    where: { resellerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      priceMin: true,
      priceMax: true,
      createdAt: true,
    },
  });

  const rows: ProductRow[] = products.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    status: p.status,
    priceMin: p.priceMin.toString(),
    priceMax: p.priceMax.toString(),
    createdAt: new Date(p.createdAt).toLocaleDateString("en-IN"),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-foreground">Products</h2>
          <p className="mt-1 font-sans text-sm text-muted-foreground">
            {products.length} product{products.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-sans text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <ProductsTable rows={rows} />
    </div>
  );
}
