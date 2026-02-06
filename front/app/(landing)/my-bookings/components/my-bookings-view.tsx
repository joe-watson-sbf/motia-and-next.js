"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Booking } from "@/lib/types";
import { useUser } from "@/lib/user-context";
import { useCancelBooking, useCustomerBookings } from "@/query/hooks";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  confirmed: "default",
  pending: "secondary",
  validating: "secondary",
  processing: "secondary",
  failed: "destructive",
  cancelled: "outline",
  refunded: "outline",
};

function BookingRow({ booking }: { booking: Booking }) {
  const cancelMutation = useCancelBooking();
  const canCancel = booking.status === "confirmed";

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0 flex-1">
        <Link href={`/bookings/${booking.id}`} className="font-medium hover:underline">
          {booking.eventTitle || booking.eventId}
        </Link>
        <p className="text-sm text-muted-foreground">
          {new Date(booking.createdAt).toLocaleDateString()}
          {booking.seatId && ` • Seat ${booking.seatId}`}
        </p>
      </div>
      <Badge variant={statusVariant[booking.status] || "secondary"}>
        {booking.status}
      </Badge>
      {canCancel && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => cancelMutation.mutate(booking.id)}
          disabled={cancelMutation.isPending}
        >
          {cancelMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel"}
        </Button>
      )}
    </div>
  );
}

BookingRow.displayName = "BookingRow";

export default function MyBookingsView() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const email = searchParams.get("email") || user?.email || "";

  const { data, isLoading, error } = useCustomerBookings(email);

  if (!email) {
    return (
      <p className="text-muted-foreground">
        Please <Link href="/login" className="underline">sign in</Link> to view your bookings.
      </p>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        Failed to load bookings.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (data?.bookings.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        No bookings found.{" "}
        <Link href="/" className="underline">
          Browse events
        </Link>
      </p>
    );
  }

  return (
    <div className="divide-y">
      {data?.bookings.map((booking) => (
        <BookingRow key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
