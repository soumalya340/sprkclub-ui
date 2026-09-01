"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ConnectWallet } from "@/components/wallet/connect-wallet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const menus = [
  {
    label: "Explore",
    items: [
      { href: "/explore/ongoing-proposals", label: "Ongoing proposals" },
      { href: "/explore/campaigns", label: "Campaigns" },
    ],
  },
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const next = window.scrollY > 0;
      setHasScrolled((prev) => (prev === next ? prev : next));
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-200",
        hasScrolled
          ? "border-border-medium bg-background/70 backdrop-blur-sm"
          : "border-border-low bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/explore/ongoing-proposals"
            className="rounded-sm text-[15px] font-medium uppercase tracking-[0.04em] text-ink transition-opacity hover:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Proposals
          </Link>
          <Link
            href="/explore/campaigns"
            className="rounded-sm text-[15px] font-medium uppercase tracking-[0.04em] text-ink transition-opacity hover:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Campaigns
          </Link>
          <Link
            href="/join"
            className="rounded-sm text-[15px] font-medium uppercase tracking-[0.04em] text-ink transition-opacity hover:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Join
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:block">
            <ConnectWallet />
          </div>
          <Button
            asChild
            className="hidden rounded-full px-5 text-[15px] font-medium uppercase tracking-[0.04em] md:inline-flex"
          >
            <Link href="/launch">Create a proposal</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-6">
                <ConnectWallet />
                <SheetClose asChild>
                  <Link
                    href="/launch"
                    className="rounded-md text-base font-medium text-foreground"
                    onClick={() => setOpen(false)}
                  >
                    Launch
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/join"
                    className="rounded-md text-base font-medium text-foreground"
                    onClick={() => setOpen(false)}
                  >
                    Join The Movement
                  </Link>
                </SheetClose>
                {menus.map((menu) => (
                  <div key={menu.label} className="flex flex-col gap-1">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {menu.label}
                    </p>
                    {menu.items.map((item) => (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className="rounded-md py-2 text-base text-foreground"
                          onClick={() => setOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
