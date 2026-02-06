"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/user-context";
import { Ticket, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useUser();

  const isAdminSection = pathname.startsWith("/admin");
  const isCustomerSection = pathname.startsWith("/my-bookings");

  return (
    <header className="max-w-6xl mx-auto w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Ticket className="h-5 w-5" />
            <span>Motia Tickets</span>
          </Link>

          <nav className="hidden items-center gap-4 text-sm md:flex">
            <Link
              href="/"
              className={`transition-colors hover:text-foreground ${pathname === "/" ? "text-foreground" : "text-muted-foreground"
                }`}
            >
              Events
            </Link>
            {user && (
              <Link
                href={`/my-bookings?email=${user.email}`}
                className={`transition-colors hover:text-foreground ${isCustomerSection ? "text-foreground" : "text-muted-foreground"
                  }`}
              >
                My Bookings
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className={`transition-colors hover:text-foreground ${isAdminSection ? "text-foreground" : "text-muted-foreground"
                  }`}
              >
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.name}
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

Header.displayName = "Header";
