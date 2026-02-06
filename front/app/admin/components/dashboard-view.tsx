"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useAdminBookings, useAdminCustomers, useEvents } from "@/query/hooks";
import StatCard from "./stat-card";

export default function DashboardView() {
  const { data: events, isLoading: loadingEvents } = useEvents();
  const { data: bookings, isLoading: loadingBookings } = useAdminBookings();
  const { data: customers, isLoading: loadingCustomers } = useAdminCustomers();

  const confirmedBookings = bookings?.bookings.filter((b) => b.status === "confirmed").length || 0;
  const totalRevenue = bookings?.bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + (b.amount || 0), 0) || 0;

  return (
    <div className="space-y-6 bg-muted p-6 rounded-lg">
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your ticketing system</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Events" value={events?.total || 0} isLoading={loadingEvents} />
        <StatCard label="Total Bookings" value={bookings?.total || 0} isLoading={loadingBookings} />
        <StatCard label="Confirmed" value={confirmedBookings} isLoading={loadingBookings} />
        <StatCard label="Customers" value={customers?.total || 0} isLoading={loadingCustomers} />
      </div>

      <div>
        <h2 className="mb-2 text-lg font-medium">Revenue</h2>
        {loadingBookings ? (
          <Skeleton className="h-10 w-32" />
        ) : (
          <p className="text-3xl font-bold">${(totalRevenue / 100).toFixed(2)}</p>
        )}
      </div>
    </div>
  );
}
