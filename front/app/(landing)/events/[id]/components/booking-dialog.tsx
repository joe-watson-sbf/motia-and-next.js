"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBooking } from "@/query/hooks";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType | null; color: string }> = {
  pending: { label: "Pending", variant: "secondary", icon: Clock, color: "text-muted-foreground" },
  validating: { label: "Validating", variant: "secondary", icon: null, color: "text-blue-500" },
  processing: { label: "Processing Payment", variant: "secondary", icon: null, color: "text-purple-500" },
  confirmed: { label: "Confirmed", variant: "default", icon: CheckCircle, color: "text-green-500" },
  failed: { label: "Failed", variant: "destructive", icon: XCircle, color: "text-destructive" },
};

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSeat: string | null;
  event: Event;
  customerName: string;
  customerEmail: string;
  onCustomerNameChange: (name: string) => void;
  onCustomerEmailChange: (email: string) => void;
  onConfirm: () => void;
  isPending: boolean;
  error?: Error | null;
  bookingSuccess?: {
    bookingId: string;
    holdExpiresAt: string;
  } | null;
}

const BookingDialog: React.FC<BookingDialogProps> = ({
  open,
  onOpenChange,
  selectedSeat,
  event,
  customerName,
  customerEmail,
  onCustomerNameChange,
  onCustomerEmailChange,
  onConfirm,
  isPending,
  error,
  bookingSuccess,
}) => {
  // Poll for booking status if we have a booking ID
  const { data: booking } = useBooking(bookingSuccess?.bookingId || "");

  // Determine status UI
  const status = booking?.status || "pending";
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;
  const isProcessing = ["pending", "validating", "processing"].includes(status);
  const isConfirmed = status === "confirmed";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {bookingSuccess ? (
              <div className="flex items-center gap-2">
                <span>Booking Status</span>
                <Badge variant={config.variant} className="ml-2">
                  {config.label}
                </Badge>
              </div>
            ) : (
              "Complete Booking"
            )}
          </DialogTitle>
          <DialogDescription>
            {bookingSuccess ? (
              <span>Booking ID: {bookingSuccess.bookingId}</span>
            ) : (
              `${selectedSeat ? `Seat: ${selectedSeat}` : "General Admission"} - ${formatPrice(event.price)}`
            )}
          </DialogDescription>
        </DialogHeader>

        {bookingSuccess ? (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <div className={`rounded-full p-4 bg-muted/30`}>
                {isProcessing ? (
                  <Spinner className={`h-12 w-12 ${config.color}`} />
                ) : (
                  StatusIcon && <StatusIcon className={`h-12 w-12 ${config.color}`} />
                )}
              </div>

              <div className="text-center space-y-1">
                <p className="font-medium text-lg">{isConfirmed ? "You're all set!" : config.label}</p>
                <p className="text-sm text-muted-foreground">
                  {isProcessing
                    ? "Please wait while we validate your booking..."
                    : isConfirmed
                      ? `Confirmation sent to ${customerEmail}`
                      : "Something went wrong."}
                </p>
              </div>
            </div>

            {isConfirmed && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex gap-2 justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Event:</span>
                  <span className="font-medium">{event.title}</span>
                </div>
                {selectedSeat && (
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Seat</span>
                    <span className="font-medium">{selectedSeat}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="font-medium">{formatPrice(event.price)}</span>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              onClick={() => onOpenChange(false)}
              variant={isConfirmed ? "default" : "secondary"}
              disabled={isProcessing}
            >
              {isConfirmed ? "Done" : "Close"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="book-name">Name</Label>
              <Input
                id="book-name"
                value={customerName}
                onChange={(e) => onCustomerNameChange(e.target.value)}
                placeholder="Your name"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="book-email">Email</Label>
              <Input
                id="book-email"
                type="email"
                value={customerEmail}
                onChange={(e) => onCustomerEmailChange(e.target.value)}
                placeholder="your@email.com"
                disabled={isPending}
              />
            </div>

            <Button
              className="w-full"
              onClick={onConfirm}
              disabled={!customerName || !customerEmail || isPending}
            >
              {isPending && <Spinner className="mr-2 h-4 w-4" />}
              {isPending ? "Hold on..." : "Confirm Booking"}
            </Button>

            {error && (
              <p className="text-sm text-destructive">{error.message}</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

BookingDialog.displayName = "BookingDialog";

export default BookingDialog;
