import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';

export const config: ApiRouteConfig = {
  name: 'GetBooking',
  type: 'api',
  path: '/bookings/:id',
  method: 'GET',
  description: 'Get booking details and status',
  emits: [],
  flows: ['ticket-booking-flow'],
  responseSchema: {
    200: z.object({
      id: z.string(),
      eventId: z.string(),
      eventTitle: z.string().optional(),
      seatId: z.string().nullable().optional(),
      customerName: z.string(),
      customerEmail: z.string(),
      status: z.enum(['pending', 'validating', 'processing', 'confirmed', 'failed', 'cancelled']),
      amount: z.number().optional(),
      paymentId: z.string().optional(),
      holdExpiresAt: z.string().optional(),
      confirmedAt: z.string().optional(),
      createdAt: z.string()
    }),
    404: z.object({ error: z.string() })
  }
};

interface Booking {
  id: string;
  eventId: string;
  eventTitle?: string;
  seatId?: string | null;
  customerName: string;
  customerEmail: string;
  status: string;
  amount?: number;
  paymentId?: string;
  holdExpiresAt?: string;
  confirmedAt?: string;
  createdAt: string;
}

export const handler: Handlers['GetBooking'] = async (req, { state, logger }) => {
  const { id } = req.pathParams;

  logger.info('Getting booking', { bookingId: id });

  const booking = await state.get<Booking>('bookings', id);

  if (!booking) {
    return {
      status: 404,
      body: { error: 'Booking not found' }
    };
  }

  logger.info('Booking retrieved', { bookingId: id, status: booking.status });

  return {
    status: 200,
    body: {
      id: booking.id,
      eventId: booking.eventId,
      eventTitle: booking.eventTitle,
      seatId: booking.seatId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      status: booking.status as any,
      amount: booking.amount,
      paymentId: booking.paymentId,
      holdExpiresAt: booking.holdExpiresAt,
      confirmedAt: booking.confirmedAt,
      createdAt: booking.createdAt
    }
  };
};
