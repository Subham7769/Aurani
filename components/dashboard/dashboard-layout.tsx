"use client";

import { useState } from "react";
import { Menu, LayoutDashboard, Package, ShoppingBag, Truck, Settings, Users } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AuraniLogo } from "@/components/brand/aurani-logo";
import { SidebarNav } from "./sidebar-nav";
import type { NavItem } from "./sidebar-nav";

const RESELLER_NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/shipping", label: "Shipping", icon: Truck },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/resellers", label: "Resellers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  variant?: "reseller" | "admin";
}

export function DashboardLayout({ children, title, variant = "reseller" }: DashboardLayoutProps) {
  const navItems = variant === "admin" ? ADMIN_NAV : RESELLER_NAV;
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="flex h-full flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <AuraniLogo size="sm" />
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav items={navItems} />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 md:block">{sidebar}</aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0">
          {sidebar}
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
          <button
            aria-label="Open sidebar"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-muted-foreground hover:text-foreground md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          {title && (
            <h1 className="font-serif text-xl text-foreground">{title}</h1>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
