import type { EventConfig, Handlers } from 'motia';
import { z } from 'zod';

const inputSchema = z.object({
  bookingId: z.string(),
  eventId: z.string(),
  seatId: z.string().nullable(),
  customerName: z.string(),
  customerEmail: z.string(),
  amount: z.number()
});

export const config: EventConfig = {
  name: 'ProcessPayment',
  type: 'event',
  description: 'Simulates payment processing with 2s delay and 20% failure rate',
  subscribes: ['process-payment'],
  emits: ['booking-confirmed', 'booking-failed'],
  flows: ['ticket-booking-flow'],
  input: inputSchema
};

interface Booking {
  id: string;
  eventId: string;
  seatId?: string | null;
  status: string;
  updatedAt?: string;
  paymentId?: string;
  paidAt?: string;
}

interface Event {
  id: string;
  price: number;
}

const PAYMENT_DELAY_MS = 2000; // 2 seconds
const FAILURE_RATE = 0.2; // 20% failure rate

export const handler: Handlers['ProcessPayment'] = async (input, { state, emit, logger }) => {
  const { bookingId, eventId, seatId, customerName, customerEmail } = input;

  logger.info('Processing payment', { bookingId, eventId });

  // Get booking
  const booking = await state.get<Booking>('bookings', bookingId);
  if (!booking) {
    logger.error('Booking not found', { bookingId });
    return;
  }

  // Update status to processing (Immutable)
  const processingBooking: Booking = {
    ...booking,
    status: 'processing',
    updatedAt: new Date().toISOString()
  };
  await state.set('bookings', bookingId, processingBooking);
  await state.set(`bookings:${eventId}`, bookingId, processingBooking);
  await state.set(`customer-bookings:${customerEmail}`, bookingId, processingBooking);

  // Get event for price
  const event = await state.get<Event>('events', eventId);
  const amount = event?.price || 5000;

  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, PAYMENT_DELAY_MS));

  // Simulate random payment failure (20% chance)
  const paymentSucceeded = Math.random() > FAILURE_RATE;

  if (paymentSucceeded) {
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    logger.info('Payment successful', { bookingId, paymentId, amount });

    await emit({
      topic: 'booking-confirmed',
      data: {
        bookingId,
        eventId,
        seatId,
        customerName,
        customerEmail,
        paymentId,
        amount
      }
    });
  } else {
    const failureReasons = [
      'Card declined',
      'Insufficient funds',
      'Payment timeout',
      'Bank declined transaction'
    ];
    const reason = failureReasons[Math.floor(Math.random() * failureReasons.length)];

    logger.warn('Payment failed', { bookingId, reason });

    // Release seat hold on payment failure
    if (seatId) {
      await state.delete(`seat-holds:${eventId}`, seatId as string);
    }

    // Update booking status
    booking.status = 'failed';
    booking.updatedAt = new Date().toISOString();
    await state.set('bookings', bookingId, booking);
    await state.set(`bookings:${eventId}`, bookingId, booking);
    await state.set(`customer-bookings:${customerEmail}`, bookingId, booking);

    await emit({
      topic: 'booking-failed',
      data: {
        bookingId,
        eventId,
        seatId,
        reason: `Payment failed: ${reason}`
      }
    });
  }
};
