import type { EventConfig, Handlers } from 'motia';
import { z } from 'zod';

const inputSchema = z.object({
  bookingId: z.string(),
  eventId: z.string(),
  seatId: z.string().nullable(),
  customerName: z.string(),
  customerEmail: z.string()
});

export const config: EventConfig = {
  name: 'ValidateBooking',
  type: 'event',
  description: 'Validates booking - checks seat availability and event capacity',
  subscribes: ['validate-booking'],
  emits: ['process-payment', 'booking-failed'],
  flows: ['ticket-booking-flow'],
  input: inputSchema
};

interface Booking {
  id: string;
  eventId: string;
  seatId?: string | null;
  status: string;
  updatedAt?: string;
}

interface Event {
  id: string;
  totalSeats: number;
  seatMap: Array<{ id: string }>;
}

interface SeatHold {
  seatId: string;
  bookingId: string;
  expiresAt: string;
}

export const handler: Handlers['ValidateBooking'] = async (input, { state, emit, logger }) => {
  const { bookingId, eventId, seatId, customerName, customerEmail } = input;

  logger.info('Validating booking', { bookingId, eventId, seatId });

  // Get booking
  const booking = await state.get<Booking>('bookings', bookingId);
  if (!booking) {
    logger.error('Booking not found', { bookingId });
    return;
  }

  // Update status to validating (Immutable)
  const validatingBooking: Booking = {
    ...booking,
    status: 'validating',
    updatedAt: new Date().toISOString()
  };
  await state.set('bookings', bookingId, validatingBooking);
  await state.set(`bookings:${eventId}`, bookingId, validatingBooking);
  await state.set(`customer-bookings:${customerEmail}`, bookingId, validatingBooking);

  // Get event
  const event = await state.get<Event>('events', eventId);
  if (!event) {
    logger.error('Event not found', { eventId });
    await failBooking(state, emit, booking, 'Event no longer exists');
    return;
  }

  // Validate seat if specified
  if (seatId) {
    const seatExists = event.seatMap.some(s => s.id === seatId);
    if (!seatExists) {
      await failBooking(state, emit, booking, `Seat ${seatId} does not exist`);
      return;
    }

    // Check if hold is still valid
    const hold = await state.get<SeatHold>(`seat-holds:${eventId}`, seatId as string);
    if (!hold || hold.bookingId !== bookingId) {
      await failBooking(state, emit, booking, 'Seat hold expired');
      return;
    }

    if (new Date(hold.expiresAt) < new Date()) {
      await failBooking(state, emit, booking, 'Seat hold expired');
      return;
    }
  }

  logger.info('Booking validated successfully', { bookingId });

  // Emit payment processing event
  await emit({
    topic: 'process-payment',
    data: {
      bookingId,
      eventId,
      seatId,
      customerName,
      customerEmail,
      amount: 5000 // Will get actual price from event
    }
  });
};

async function failBooking(
  state: any,
  emit: any,
  booking: Booking,
  reason: string
) {
  // Update status to failed (Immutable)
  const failedBooking: Booking = {
    ...booking,
    status: 'failed',
    updatedAt: new Date().toISOString()
  };
  await state.set('bookings', booking.id, failedBooking);

  await emit({
    topic: 'booking-failed',
    data: {
      bookingId: booking.id,
      eventId: booking.eventId,
      seatId: booking.seatId,
      reason
    }
  });
}
