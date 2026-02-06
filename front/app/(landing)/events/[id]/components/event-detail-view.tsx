"use client";

import { useUser } from "@/lib/user-context";
import { useEvent } from "@/query/hooks";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import BookingDialog from "./booking-dialog";
import EventHero from "./event-hero";
import SeatMap from "./seat-map";
import { useBookingLogic } from "./use-booking-logic";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function EventDetailView() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const { user } = useUser();
  const { data: event, isLoading, error } = useEvent(eventId);

  const {
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
    isPending,
    error: bookingError,
    bookingSuccess
  } = useBookingLogic({ eventId, user });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 w-full mt-6">
        <div className="mb-8 h-6 w-24 animate-pulse rounded bg-muted"></div>
        <EventHero.Skeleton />
        <SeatMap.Skeleton />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive mt-6">
        Event not found or API error.
      </div>
    );
  }

  const isSoldOut = event.availableSeats === 0;
  const hasSeatMap = !!event.seatMap && event.seatMap.length > 0;

  return (
    <div className="space-y-4 overflow-x-clip animate-in fade-in duration-500 w-full mt-3">

      <Button variant="link" onClick={() => router.back()}>
        <ArrowLeft className="size-4" />
        Back to Events
      </Button>
      <div className='bg-accent p-4 rounded-2xl'>
        <EventHero
          event={event}
          isSoldOut={isSoldOut}
          onBookClick={openBookingDialog}
          hasSeatMap={hasSeatMap}
          isPending={isPending}
        />
      </div>

      {event.description && (
        <div className="space-y-2">
          <h6 className="text-3xl font-bold tracking-tight text-foreground">
            Overview
          </h6>
          <pre
            dangerouslySetInnerHTML={{ __html: event.description }}
            className="text-base font-sans whitespace-pre-wrap text-muted-foreground"
          />
        </div>
      )}

      {hasSeatMap && (
        <SeatMap
          seatMap={event.seatMap!}
          selectedSeat={selectedSeat}
          isSoldOut={isSoldOut}
          onSeatSelect={setSelectedSeat}
          onBookClick={openBookingDialog}
          isPending={isPending}
        />
      )}


      <BookingDialog
        open={showBookingDialog}
        onOpenChange={setShowBookingDialog}
        selectedSeat={selectedSeat}
        event={event}
        customerName={customerName}
        customerEmail={customerEmail}
        onCustomerNameChange={setCustomerName}
        onCustomerEmailChange={setCustomerEmail}
        onConfirm={handleBook}
        isPending={isPending}
        error={bookingError}
        bookingSuccess={bookingSuccess}
      />
    </div>
  );
}

