"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export interface ColumnDef<T> {
  key: keyof T & string;
  header: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T extends object> {
  columns: ColumnDef<T>[];
  data: T[];
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
}

type SortDir = "asc" | "desc";

export function DataTable<T extends object>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = "Search...",
  className,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      Object.values(row as Record<string, unknown>).some((v) =>
        String(v ?? "").toLowerCase().includes(q),
      ),
    );
  }, [data, search]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey] ?? "";
      const bv = (b as Record<string, unknown>)[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv), "en", { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {searchable && (
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9 font-sans text-sm"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "font-sans text-xs uppercase tracking-wider text-muted-foreground",
                    col.sortable && "cursor-pointer select-none hover:text-foreground",
                    col.className,
                  )}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      sortDir === "asc"
                        ? <ChevronUp className="h-3 w-3" />
                        : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-12 text-center font-sans text-sm text-muted-foreground"
                >
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((row, i) => (
                <TableRow key={i} className="hover:bg-muted/30">
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn("font-sans text-sm", col.className)}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] ?? "—")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="font-sans text-xs text-muted-foreground">
        {sorted.length} of {data.length} result{data.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
