"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { LayoutDashboard, Ticket, Users, Plus } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: Ticket },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/events/new", label: "New Event", icon: Plus },
];

function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b max-w-6xl mx-auto w-full">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 text-sm transition-colors ${isActive
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

AdminNav.displayName = "AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>

      <AdminNav />
      <main className="max-w-6xl mx-auto w-full p-4">{children}</main>
    </>
  );
}
