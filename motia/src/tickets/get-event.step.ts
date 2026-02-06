import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';

export const config: ApiRouteConfig = {
  name: 'GetEvent',
  type: 'api',
  path: '/events/:id',
  method: 'GET',
  description: 'Get event details with seat availability',
  emits: [],
  flows: ['ticket-booking-flow'],
  responseSchema: {
    200: z.object({
      id: z.string(),
      title: z.string(),
      slug: z.string(),
      price: z.number(),
      description: z.string(),
      thumbnail: z.string(),
      totalSeats: z.number(),
      availableSeats: z.number(),
      seatMap: z.array(z.object({
        id: z.string(),
        row: z.string(),
        number: z.number(),
        category: z.string(),
        status: z.enum(['available', 'held', 'booked'])
      })),
      createdAt: z.string()
    }),
    404: z.object({ error: z.string() })
  }
};

interface Seat {
  id: string;
  row: string;
  number: number;
  category: string;
  price?: number;
}

interface Event {
  id: string;
  title: string;
  slug: string;
  price: number;
  description: string;
  thumbnail: string;
  totalSeats: number;
  availableSeats: number;
  seatMap: Seat[];
  createdAt: string;
}

interface SeatHold {
  eventId: string;
  seatId: string;
  bookingId: string;
  expiresAt: string;
}

interface Booking {
  seatId?: string;
  status: string;
}

export const handler: Handlers['GetEvent'] = async (req, { state, logger }) => {
  const { id } = req.pathParams;

  logger.info('Getting event details', { eventId: id });

  const event = await state.get<Event>('events', id);

  if (!event) {
    logger.warn('Event not found', { eventId: id });
    return {
      status: 404,
      body: { error: 'Event not found' }
    };
  }

  // Get seat statuses (held and booked)
  const seatHolds = await state.getGroup<SeatHold>(`seat-holds:${id}`);
  const bookings = await state.getGroup<Booking>(`bookings:${id}`);

  const now = new Date();
  const heldSeats = new Set(
    seatHolds
      .filter(h => new Date(h.expiresAt) > now)
      .map(h => h.seatId)
  );

  const bookedSeats = new Set(
    bookings
      .filter(b => b.status === 'confirmed')
      .map(b => b.seatId)
  );

  // Build seat map with statuses
  const seatMapWithStatus = event.seatMap.map(seat => ({
    id: seat.id,
    row: seat.row,
    number: seat.number,
    category: seat.category,
    status: bookedSeats.has(seat.id)
      ? 'booked' as const
      : heldSeats.has(seat.id)
        ? 'held' as const
        : 'available' as const
  }));

  // Calculate available seats
  const availableSeats = seatMapWithStatus.filter(s => s.status === 'available').length;

  logger.info('Event retrieved', {
    eventId: id,
    availableSeats,
    heldSeats: heldSeats.size,
    bookedSeats: bookedSeats.size
  });

  return {
    status: 200,
    body: {
      id: event.id,
      title: event.title,
      slug: event.slug,
      price: event.price,
      description: event.description,
      thumbnail: event.thumbnail,
      totalSeats: event.totalSeats,
      availableSeats,
      seatMap: seatMapWithStatus,
      createdAt: event.createdAt
    }
  };
};
