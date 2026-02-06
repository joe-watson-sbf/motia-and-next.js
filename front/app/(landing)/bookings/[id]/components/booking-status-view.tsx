"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBooking, useCancelBooking } from "@/query/hooks";
import { ArrowLeft, CheckCircle, Clock, Loader2, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  pending: { label: "Pending", variant: "secondary", icon: Clock },
  validating: { label: "Validating", variant: "secondary", icon: Clock },
  processing: { label: "Processing Payment", variant: "secondary", icon: Loader2 },
  confirmed: { label: "Confirmed", variant: "default", icon: CheckCircle },
  failed: { label: "Failed", variant: "destructive", icon: XCircle },
  cancelled: { label: "Cancelled", variant: "outline", icon: XCircle },
  refunded: { label: "Refunded", variant: "outline", icon: CheckCircle },
};

export default function BookingStatusView() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const { data: booking, isLoading, error } = useBooking(bookingId);
  const cancelMutation = useCancelBooking();

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    await cancelMutation.mutateAsync(bookingId);
  };

  if (isLoading) {
    return (
      <div className="">
        <Skeleton className="mb-4 h-8 w-32" />
        <Skeleton className="mb-2 h-10 w-2/3" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        Booking not found.
      </div>
    );
  }

  const config = statusConfig[booking.status] || statusConfig.pending;
  const StatusIcon = config.icon;
  const isProcessing = ["pending", "validating", "processing"].includes(booking.status);
  const canCancel = booking.status === "confirmed";

  return (
    <div>
      <Button
        onClick={() => router.back()}
        variant="link"
      >
        <ArrowLeft className="size-4" />
        Back to Events
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Booking Status</h1>
          <p className="text-sm text-muted-foreground">ID: {booking.id}</p>
        </div>

        <div className="flex items-center gap-3">
          <StatusIcon className={`h-6 w-6 ${isProcessing ? "animate-spin" : ""}`} />
          <Badge variant={config.variant} className="text-sm">
            {config.label}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Event</span>
            <span>{booking.eventTitle || booking.eventId}</span>
          </div>
          {booking.seatId && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Seat</span>
              <span>{booking.seatId}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer</span>
            <span>{booking.customerName}</span>
          </div>
          {booking.amount && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span>${(booking.amount / 100).toFixed(2)}</span>
            </div>
          )}
          {booking.confirmedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Confirmed</span>
              <span>{new Date(booking.confirmedAt).toLocaleString()}</span>
            </div>
          )}
        </div>

        {isProcessing && (
          <p className="text-sm text-muted-foreground">
            Please wait while we process your booking...
          </p>
        )}

        {canCancel && (
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cancel Booking
          </Button>
        )}
      </div>
    </div>
  );
}
