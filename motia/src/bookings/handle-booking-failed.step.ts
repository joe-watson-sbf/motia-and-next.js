import type { EventConfig, Handlers } from 'motia';
import { z } from 'zod';

const inputSchema = z.object({
  bookingId: z.string(),
  eventId: z.string(),
  seatId: z.string().nullable().optional(),
  reason: z.string()
});

export const config: EventConfig = {
  name: 'HandleBookingFailed',
  type: 'event',
  description: 'Handles booking failure - cleans up holds and updates status',
  subscribes: ['booking-failed'],
  emits: [],
  flows: ['ticket-booking-flow'],
  input: inputSchema
};

interface Booking {
  id: string;
  eventId: string;
  seatId?: string | null;
  customerEmail: string;
  status: string;
  failureReason?: string;
  updatedAt?: string;
}

export const handler: Handlers['HandleBookingFailed'] = async (input, { state, logger }) => {
  const { bookingId, eventId, seatId, reason } = input;

  logger.info('Handling booking failure', { bookingId, reason });

  // Get booking
  const booking = await state.get<Booking>('bookings', bookingId);
  if (!booking) {
    logger.error('Booking not found for failure handling', { bookingId });
    return;
  }

  const now = new Date().toISOString();

  // Release seat hold if exists
  if (seatId) {
    await state.delete(`seat-holds:${eventId}`, seatId as string);
    logger.info('Seat hold released due to failure', { eventId, seatId });
  }

  // Get latest booking state to ensure we don't overwrite with stale data
  const currentBooking = await state.get<Booking>('bookings', bookingId) || booking;

  // Clone and update booking (Immutable pattern)
  const updatedBooking: Booking = {
    ...currentBooking,
    status: 'failed',
    failureReason: reason,
    updatedAt: now
  };

  // Update in all storage locations
  await state.set('bookings', bookingId, updatedBooking);
  await state.set(`bookings:${eventId}`, bookingId, updatedBooking);
  await state.set(`customer-bookings:${booking.customerEmail}`, bookingId, updatedBooking);

  logger.info('Booking marked as failed', { bookingId, reason });
};
