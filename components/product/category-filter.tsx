"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "ALL", label: "All" },
  { value: "CLOTHING", label: "Clothing" },
  { value: "JEWELLERY", label: "Jewellery" },
  { value: "HOME_ESSENTIALS", label: "Home" },
] as const;

type CategoryValue = (typeof CATEGORIES)[number]["value"];

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get("category")?.toUpperCase() ?? "ALL";
  const active: CategoryValue =
    raw === "CLOTHING" || raw === "JEWELLERY" || raw === "HOME_ESSENTIALS"
      ? raw
      : "ALL";

  function handleSelect(value: CategoryValue) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    router.push(`/products${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {CATEGORIES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => handleSelect(value)}
          className={cn(
            "shrink-0 rounded-full px-4 py-1.5 font-sans text-xs font-medium uppercase tracking-widest transition-colors",
            active === value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
