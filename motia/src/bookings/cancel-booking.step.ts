import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';

export const config: ApiRouteConfig = {
  name: 'CancelBooking',
  type: 'api',
  path: '/bookings/:id/cancel',
  method: 'POST',
  description: 'Cancel a booking and release the seat',
  emits: ['process-cancellation'],
  flows: ['ticket-booking-flow'],
  responseSchema: {
    200: z.object({
      bookingId: z.string(),
      status: z.string(),
      message: z.string()
    }),
    400: z.object({ error: z.string() }),
    404: z.object({ error: z.string() })
  }
};

interface Booking {
  id: string;
  eventId: string;
  seatId?: string | null;
  customerName: string;
  customerEmail: string;
  status: string;
  amount?: number;
  paymentId?: string;
}

export const handler: Handlers['CancelBooking'] = async (req, { state, emit, logger }) => {
  const { id } = req.pathParams;

  logger.info('Cancel booking requested', { bookingId: id });

  const booking = await state.get<Booking>('bookings', id);

  if (!booking) {
    return {
      status: 404,
      body: { error: 'Booking not found' }
    };
  }

  // Can only cancel pending, validating, processing, or confirmed bookings
  if (!['pending', 'validating', 'processing', 'confirmed'].includes(booking.status)) {
    return {
      status: 400,
      body: { error: `Cannot cancel booking with status: ${booking.status}` }
    };
  }

  // Update status to cancelling
  booking.status = 'cancelling';
  await state.set('bookings', id, booking);

  // Emit cancellation event for processing
  await emit({
    topic: 'process-cancellation',
    data: {
      bookingId: id,
      eventId: booking.eventId,
      seatId: booking.seatId,
      customerEmail: booking.customerEmail,
      hadPayment: !!booking.paymentId,
      amount: booking.amount
    }
  });

  logger.info('Cancellation initiated', { bookingId: id });

  return {
    status: 200,
    body: {
      bookingId: id,
      status: 'cancelling',
      message: 'Booking cancellation in progress'
    }
  };
};
