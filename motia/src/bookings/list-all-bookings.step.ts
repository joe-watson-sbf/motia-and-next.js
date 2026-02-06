import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';

// Response schema for booking list
const bookingSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  eventTitle: z.string().optional(),
  seatId: z.string().nullable().optional(),
  customerName: z.string(),
  customerEmail: z.string(),
  status: z.string(),
  amount: z.number().optional(),
  paymentId: z.string().optional(),
  createdAt: z.string(),
  confirmedAt: z.string().optional(),
  cancelledAt: z.string().optional(),
  refundedAt: z.string().optional()
});

export const config: ApiRouteConfig = {
  name: 'ListAllBookings',
  type: 'api',
  description: 'Lists all bookings (admin view)',
  path: '/admin/bookings',
  method: 'GET',
  emits: [],
  flows: ['ticket-booking-flow'],
  queryParams: [
    { name: 'status', description: 'Filter by booking status' },
    { name: 'eventId', description: 'Filter by event ID' }
  ],
  responseSchema: {
    200: z.object({
      bookings: z.array(bookingSchema),
      total: z.number()
    })
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
  createdAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
}

export const handler: Handlers['ListAllBookings'] = async (req, { state, logger }) => {
  const status = req.queryParams?.status as string | undefined;
  const eventId = req.queryParams?.eventId as string | undefined;

  logger.info('Fetching all bookings', { status, eventId });

  // Get all bookings
  const rawBookings = await state.getGroup<Booking>('bookings');

  // Deduplicate using Map to ensure unique IDs (handling potential storage duplication)
  const bookingsMap = new Map<string, Booking>();
  rawBookings.forEach(b => bookingsMap.set(b.id, b));
  const allBookings = Array.from(bookingsMap.values());

  // Filter by status and/or eventId if provided
  let filtered = allBookings;

  if (status) {
    filtered = filtered.filter(b => b.status === status);
  }

  // Sort by creation date (newest first)
  filtered.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    status: 200,
    body: {
      bookings: filtered,
      total: filtered.length
    }
  };
};
