"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";
import type { ColumnDef } from "@/components/dashboard/data-table";

export interface ResellerRow {
  id: string;
  email: string;
  commission: string;
  products: number;
  orders: number;
  status: string;
}

const columns: ColumnDef<ResellerRow>[] = [
  {
    key: "email",
    header: "Email",
    sortable: true,
    render: (v, row) => (
      <Link href={`/admin/resellers/${row.id}`} className="font-sans text-sm text-primary hover:underline">
        {String(v)}
      </Link>
    ),
  },
  { key: "commission", header: "Commission %", sortable: true },
  { key: "products", header: "Products", sortable: true },
  { key: "orders", header: "Orders", sortable: true },
  {
    key: "status",
    header: "Status",
    render: (v) => (
      <Badge variant={String(v) === "ACTIVE" ? "default" : "destructive"}>{String(v)}</Badge>
    ),
  },
];

export function ResellersTable({ rows }: { rows: ResellerRow[] }) {
  return <DataTable columns={columns} data={rows} searchPlaceholder="Search resellers..." />;
}
