"use client";

import MyBookingsView from "./components/my-bookings-view";
import { useUser } from "@/lib/user-context";

export default function MyBookingsPage() {
  const { user } = useUser();
  const email = user?.email || "";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        {email && <p className="text-sm text-muted-foreground">{email}</p>}
      </div>
      <MyBookingsView />
    </main>
  );
}
