import type { EventConfig, Handlers } from 'motia';
import { z } from 'zod';

const inputSchema = z.object({
  bookingId: z.string(),
  eventId: z.string(),
  seatId: z.string().nullable(),
  customerEmail: z.string(),
  hadPayment: z.boolean(),
  amount: z.number().optional()
});

export const config: EventConfig = {
  name: 'ProcessCancellation',
  type: 'event',
  description: 'Processes booking cancellation - releases seat and initiates refund',
  subscribes: ['process-cancellation'],
  emits: ['refund-initiated'],
  flows: ['ticket-booking-flow'],
  input: inputSchema
};

interface Booking {
  id: string;
  eventId: string;
  seatId?: string | null;
  customerName: string;
  customerEmail: string;
  status: string;
  amount?: number;
  cancelledAt?: string;
  updatedAt?: string;
}

export const handler: Handlers['ProcessCancellation'] = async (input, { state, emit, logger }) => {
  const { bookingId, eventId, seatId, customerEmail, hadPayment, amount } = input;

  logger.info('Processing cancellation', { bookingId, eventId, seatId });

  const booking = await state.get<Booking>('bookings', bookingId);
  if (!booking) {
    logger.error('Booking not found for cancellation', { bookingId });
    return;
  }

  const now = new Date().toISOString();

  // Release seat hold
  if (seatId) {
    await state.delete(`seat-holds:${eventId}`, seatId as string);
    logger.info('Seat released', { eventId, seatId });
  }

  // Update booking to cancelled
  booking.status = 'cancelled';
  booking.cancelledAt = now;
  booking.updatedAt = now;

  await state.set('bookings', bookingId, booking);
  await state.set(`bookings:${eventId}`, bookingId, booking);
  await state.set(`customer-bookings:${customerEmail}`, bookingId, booking);

  logger.info('Booking cancelled', { bookingId });

  // Initiate refund if payment was made
  if (hadPayment && amount) {
    await emit({
      topic: 'refund-initiated',
      data: { bookingId, eventId, customerEmail, amount }
    });
  }
};
