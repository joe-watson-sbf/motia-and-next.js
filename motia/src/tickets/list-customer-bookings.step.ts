import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';

export const config: ApiRouteConfig = {
  name: 'ListCustomerBookings',
  type: 'api',
  path: '/bookings',
  method: 'GET',
  description: 'List all bookings for a customer by email',
  emits: [],
  flows: ['ticket-booking-flow'],
  queryParams: [
    { name: 'email', description: 'Customer email to filter bookings' }
  ],
  responseSchema: {
    200: z.object({
      bookings: z.array(z.object({
        id: z.string(),
        eventId: z.string(),
        eventTitle: z.string().optional(),
        seatId: z.string().nullable().optional(),
        status: z.string(),
        amount: z.number().optional(),
        createdAt: z.string()
      })),
      total: z.number()
    }),
    400: z.object({ error: z.string() })
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
  createdAt: string;
}

export const handler: Handlers['ListCustomerBookings'] = async (req, { state, logger }) => {
  const { email } = req.queryParams as { email?: string };

  if (!email) {
    return {
      status: 400,
      body: { error: 'Email query parameter is required' }
    };
  }

  logger.info('Listing customer bookings', { email });

  // Get bookings for this customer
  const bookings = await state.getGroup<Booking>(`customer-bookings:${email}`);

  logger.info('Customer bookings retrieved', { email, count: bookings.length });

  return {
    status: 200,
    body: {
      bookings: bookings.map(b => ({
        id: b.id,
        eventId: b.eventId,
        eventTitle: b.eventTitle,
        seatId: b.seatId,
        status: b.status,
        amount: b.amount,
        createdAt: b.createdAt
      })),
      total: bookings.length
    }
  };
};
