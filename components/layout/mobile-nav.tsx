"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AuraniLogo } from "@/components/brand/aurani-logo";

const navLinks = [
  { href: "/products?category=CLOTHING", label: "Clothing" },
  { href: "/products?category=JEWELLERY", label: "Jewellery" },
  { href: "/products?category=HOME_ESSENTIALS", label: "Home" },
  { href: "/sign-in", label: "Sign In" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-label="Open navigation menu"
        onClick={() => setOpen(true)}
        className="rounded-md p-2 text-foreground/70 transition-colors hover:text-foreground md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-72 bg-card px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <AuraniLogo size="md" />
          <button
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 font-sans text-base text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
      </Sheet>
    </>
  );
}
