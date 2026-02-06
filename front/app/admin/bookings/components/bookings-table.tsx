"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminBookings, useCancelBooking } from "@/query/hooks";
import Link from "next/link";
import React from "react";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  confirmed: "default",
  pending: "secondary",
  validating: "secondary",
  processing: "secondary",
  failed: "destructive",
  cancelled: "outline",
  refunded: "outline",
};

const BookingsTable: React.FC & {
  Skeleton: React.FC;
} = () => {
  const { data, isLoading, error } = useAdminBookings();
  const cancelMutation = useCancelBooking();

  const bookings = React.useMemo(() => data?.bookings || [], [data]);

  if (isLoading) {
    return <BookingsTable.Skeleton />;
  }

  if (error) {
    return <p className="text-sm text-destructive">Failed to load bookings.</p>;
  }

  if (bookings.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">No bookings yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Event</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking, idx) => {
          const canCancel = booking.status === "confirmed";
          return (
            <TableRow key={idx}>
              <TableCell className="font-mono text-xs">
                <Link href={`/bookings/${booking.id}`} className="hover:underline">
                  {booking.id.slice(0, 12)}...
                </Link>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{booking.customerName}</p>
                  <p className="text-xs text-muted-foreground">{booking.customerEmail}</p>
                </div>
              </TableCell>
              <TableCell>{booking.eventTitle || booking.eventId}</TableCell>
              <TableCell>
                <Badge variant={statusVariant[booking.status] || "secondary"}>
                  {booking.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {booking.amount ? `$${(booking.amount / 100).toFixed(2)}` : "-"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(booking.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {canCancel && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => cancelMutation.mutate(booking.id)}
                    disabled={cancelMutation.isPending}
                  >
                    {cancelMutation.isPending ? <Spinner /> : "Cancel"}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

BookingsTable.displayName = "BookingsTable";

BookingsTable.Skeleton = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
};

BookingsTable.Skeleton.displayName = "BookingsTable.Skeleton";

export default BookingsTable;
