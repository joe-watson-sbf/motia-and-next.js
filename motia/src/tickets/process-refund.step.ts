import type { EventConfig, Handlers } from 'motia';
import { z } from 'zod';

const inputSchema = z.object({
  bookingId: z.string(),
  eventId: z.string(),
  customerEmail: z.string(),
  amount: z.number()
});

export const config: EventConfig = {
  name: 'ProcessRefund',
  type: 'event',
  description: 'Processes refund for cancelled booking (simulated)',
  subscribes: ['refund-initiated'],
  emits: [],
  flows: ['ticket-booking-flow'],
  input: inputSchema
};

interface Booking {
  id: string;
  status: string;
  refundId?: string;
  refundedAt?: string;
  refundAmount?: number;
  updatedAt?: string;
}

const REFUND_DELAY_MS = 1500; // 1.5 second simulated processing

export const handler: Handlers['ProcessRefund'] = async (input, { state, logger }) => {
  const { bookingId, eventId, customerEmail, amount } = input;

  logger.info('Processing refund', { bookingId, amount, customerEmail });

  // Simulate refund processing delay
  await new Promise(resolve => setTimeout(resolve, REFUND_DELAY_MS));

  const refundId = `ref_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const now = new Date().toISOString();

  // Update booking with refund info
  const booking = await state.get<Booking>('bookings', bookingId);
  if (booking) {
    booking.status = 'refunded';
    booking.refundId = refundId;
    booking.refundAmount = amount;
    booking.refundedAt = now;
    booking.updatedAt = now;

    await state.set('bookings', bookingId, booking);
    await state.set(`bookings:${eventId}`, bookingId, booking);
    await state.set(`customer-bookings:${customerEmail}`, bookingId, booking);
  }

  logger.info('Refund completed', { bookingId, refundId, amount });
};
