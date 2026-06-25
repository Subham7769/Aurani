"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreHorizontal, Pencil, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";
import type { ColumnDef } from "@/components/dashboard/data-table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export interface ProductRow {
  id: string;
  title: string;
  category: string;
  status: string;
  priceMin: string;
  priceMax: string;
  createdAt: string;
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  DRAFT: "secondary",
  ACTIVE: "default",
  ARCHIVED: "outline",
};

function ProductActions({ row, onRefresh }: { row: ProductRow; onRefresh: () => void }) {
  const isActive = row.status === "ACTIVE";

  async function toggleStatus() {
    await fetch(`/api/products/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: isActive ? "DRAFT" : "ACTIVE" }),
    });
    onRefresh();
  }

  async function deleteProduct() {
    if (!confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
    await fetch(`/api/products/${row.id}`, { method: "DELETE" });
    onRefresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Product actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Link
            href={`/dashboard/products/${row.id}`}
            className="flex w-full items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleStatus}>
          {isActive ? (
            <>
              <XCircle className="h-4 w-4" />
              Deactivate
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Activate
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={deleteProduct}>
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ProductsTable({ rows }: { rows: ProductRow[] }) {
  const router = useRouter();

  const columns: ColumnDef<ProductRow>[] = [
    {
      key: "title",
      header: "Product",
      sortable: true,
      render: (value, row) => (
        <Link
          href={`/dashboard/products/${row.id}`}
          className="font-sans text-sm font-medium text-foreground hover:text-primary hover:underline"
        >
          {String(value)}
        </Link>
      ),
    },
    { key: "category", header: "Category", sortable: true },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <Badge variant={STATUS_VARIANT[String(value)] ?? "outline"}>
          {String(value)}
        </Badge>
      ),
    },
    {
      key: "priceMin",
      header: "Price",
      render: (_, row) => (
        <span className="font-sans text-sm">
          ₹{row.priceMin}
          {row.priceMin !== row.priceMax ? ` – ₹${row.priceMax}` : ""}
        </span>
      ),
    },
    { key: "createdAt", header: "Created", sortable: true },
    {
      key: "id",
      header: "",
      render: (_, row) => (
        <ProductActions row={row} onRefresh={() => router.refresh()} />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      searchPlaceholder="Search products..."
    />
  );
}
