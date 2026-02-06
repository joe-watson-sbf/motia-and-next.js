import type { EventConfig, Handlers } from 'motia';
import { z } from 'zod';

const inputSchema = z.object({
  bookingId: z.string(),
  eventId: z.string(),
  seatId: z.string().nullable(),
  customerName: z.string(),
  customerEmail: z.string(),
  paymentId: z.string(),
  amount: z.number()
});

export const config: EventConfig = {
  name: 'ConfirmBooking',
  type: 'event',
  description: 'Finalizes booking after successful payment',
  subscribes: ['booking-confirmed'],
  emits: [],
  flows: ['ticket-booking-flow'],
  input: inputSchema
};

interface Booking {
  id: string;
  eventId: string;
  eventTitle?: string;
  seatId?: string | null;
  customerName: string;
  customerEmail: string;
  status: string;
  paymentId?: string;
  amount?: number;
  paidAt?: string;
  confirmedAt?: string;
  updatedAt?: string;
}

export const handler: Handlers['ConfirmBooking'] = async (input, { state, logger }) => {
  const { bookingId, eventId, seatId, customerEmail, paymentId, amount } = input;

  logger.info('Confirming booking', { bookingId, paymentId });

  // Get booking
  const booking = await state.get<Booking>('bookings', bookingId);
  if (!booking) {
    logger.error('Booking not found for confirmation', { bookingId });
    return;
  }

  const now = new Date().toISOString();

  // Get latest booking state to ensure we don't overwrite with stale data
  const currentBooking = await state.get<Booking>('bookings', bookingId) || booking;

  // Clone and update booking (Immutable pattern)
  const updatedBooking: Booking = {
    ...currentBooking,
    status: 'confirmed',
    paymentId,
    amount,
    paidAt: now,
    confirmedAt: now,
    updatedAt: now
  };

  // Update in all storage locations
  await state.set('bookings', bookingId, updatedBooking);
  await state.set(`bookings:${eventId}`, bookingId, updatedBooking);
  await state.set(`customer-bookings:${customerEmail}`, bookingId, updatedBooking);

  // Remove seat hold (no longer needed, seat is now booked)
  if (seatId) {
    await state.delete(`seat-holds:${eventId}`, seatId as string);
  }

  logger.info('Booking confirmed successfully', {
    bookingId,
    eventId,
    seatId,
    paymentId,
    amount,
    customerEmail
  });
};
