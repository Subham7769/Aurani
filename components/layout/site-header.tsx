"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuraniLogo } from "@/components/brand/aurani-logo";
import { MobileNav } from "@/components/layout/mobile-nav";

const navLinks = [
  { href: "/products?category=CLOTHING", label: "Clothing" },
  { href: "/products?category=JEWELLERY", label: "Jewellery" },
  { href: "/products?category=HOME_ESSENTIALS", label: "Home" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn } = useUser();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-sm border-b border-border"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu trigger */}
        <MobileNav />

        {/* Logo — centered on mobile, left on desktop */}
        <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
          <Link href="/" aria-label="Aurani home">
            <AuraniLogo size="md" />
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-sans text-sm text-foreground/70 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <Link
              href="/sign-in"
              aria-label="Sign in"
              className="rounded-md p-2 text-foreground/70 transition-colors hover:text-foreground"
            >
              <User className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
