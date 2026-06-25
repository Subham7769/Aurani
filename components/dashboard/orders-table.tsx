"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";
import type { ColumnDef } from "@/components/dashboard/data-table";

export interface OrderRow {
  id: string;
  product: string;
  customer: string;
  amount: string;
  status: string;
  paymentLink: string;
  date: string;
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PAID: "default",
  PENDING: "secondary",
  CANCELLED: "destructive",
};

const columns: ColumnDef<OrderRow>[] = [
  { key: "product", header: "Product", sortable: true },
  { key: "customer", header: "Customer", sortable: true },
  {
    key: "amount",
    header: "Amount",
    render: (v) => <span className="font-sans text-sm">₹{String(v)}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (v) => (
      <Badge variant={STATUS_VARIANTS[String(v)] ?? "outline"}>{String(v)}</Badge>
    ),
  },
  {
    key: "paymentLink",
    header: "Payment Link",
    render: (v) =>
      String(v) !== "—" ? (
        <a href={String(v)} target="_blank" rel="noopener noreferrer" className="font-sans text-xs text-primary underline">
          Open link
        </a>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  { key: "date", header: "Date", sortable: true },
];

export function OrdersTable({ rows }: { rows: OrderRow[] }) {
  return <DataTable columns={columns} data={rows} searchPlaceholder="Search orders..." />;
}
