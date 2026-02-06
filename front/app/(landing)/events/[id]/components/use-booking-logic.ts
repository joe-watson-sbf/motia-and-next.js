"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useInitBooking } from "@/query/hooks";
import { UserContextType } from "@/lib/user-context";

interface UseBookingLogicProps {
  eventId: string;
  user: UserContextType["user"];
}

export function useBookingLogic({ eventId, user }: UseBookingLogicProps) {
  const router = useRouter();
  const bookingMutation = useInitBooking();

  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [bookingSuccess, setBookingSuccess] = useState<{
    bookingId: string;
    holdExpiresAt: string;
  } | null>(null);

  const isSubmittingRef = useRef(false);

  const handleBook = async () => {
    if (!customerName || !customerEmail) return;
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    try {
      const result = await bookingMutation.mutateAsync({
        eventId,
        seatId: selectedSeat || undefined,
        customerName,
        customerEmail,
      });

      // Instead of redirecting, show success state in dialog
      setBookingSuccess({
        bookingId: result.bookingId,
        holdExpiresAt: result.holdExpiresAt,
      });
      // Keep dialog open to show success message

    } catch (err) {
      console.error("Booking failed:", err);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const openBookingDialog = () => {
    setBookingSuccess(null); // Reset success state on new open
    setShowBookingDialog(true);
  };

  return {
    selectedSeat,
    setSelectedSeat,
    showBookingDialog,
    setShowBookingDialog,
    customerName,
    setCustomerName,
    customerEmail,
    setCustomerEmail,
    handleBook,
    openBookingDialog,
    isPending: bookingMutation.isPending,
    error: bookingMutation.error,
    bookingSuccess,
  };
}
