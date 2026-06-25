"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";
import type { ColumnDef } from "@/components/dashboard/data-table";

export interface ShipmentRow {
  id: string;
  orderId: string;
  product: string;
  awb: string;
  status: string;
  label: string;
  tracking: string;
}

const columns: ColumnDef<ShipmentRow>[] = [
  { key: "product", header: "Product", sortable: true },
  { key: "awb", header: "AWB" },
  {
    key: "status",
    header: "Status",
    render: (v) => <Badge variant="secondary">{String(v)}</Badge>,
  },
  {
    key: "label",
    header: "Label",
    render: (v) =>
      String(v) !== "—" ? (
        <a href={String(v)} target="_blank" rel="noopener noreferrer" className="font-sans text-xs text-primary underline">
          Download
        </a>
      ) : <span className="text-muted-foreground">—</span>,
  },
  {
    key: "tracking",
    header: "Tracking",
    render: (v) =>
      String(v) !== "—" ? (
        <a href={String(v)} target="_blank" rel="noopener noreferrer" className="font-sans text-xs text-primary underline">
          Track
        </a>
      ) : <span className="text-muted-foreground">—</span>,
  },
];

export function ShippingTable({ rows }: { rows: ShipmentRow[] }) {
  return <DataTable columns={columns} data={rows} searchPlaceholder="Search shipments..." />;
}
