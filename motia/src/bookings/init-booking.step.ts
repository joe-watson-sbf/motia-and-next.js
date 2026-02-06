import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';

const bodySchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  seatId: z.string().optional(),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.email('Valid email is required')
});

export const config: ApiRouteConfig = {
  name: 'InitBooking',
  type: 'api',
  path: '/bookings/init',
  method: 'POST',
  description: 'Initialize a booking and hold seat for 60 seconds',
  emits: ['validate-booking'],
  flows: ['ticket-booking-flow'],
  bodySchema,
  responseSchema: {
    201: z.object({
      bookingId: z.string(),
      eventId: z.string(),
      seatId: z.string().optional(),
      status: z.string(),
      holdExpiresAt: z.string(),
      message: z.string()
    }),
    400: z.object({ error: z.string() }),
    404: z.object({ error: z.string() }),
    409: z.object({ error: z.string() })
  }
};

interface Event {
  id: string;
  title: string;
  totalSeats: number;
  availableSeats: number;
  seatMap: Array<{ id: string; row: string; number: number; category: string }>;
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

const HOLD_DURATION_SECONDS = 60; // 1 minute hold

export const handler: Handlers['InitBooking'] = async (req, { state, emit, logger }) => {
  try {
    const data = bodySchema.parse(req.body);
    const { eventId, seatId, customerName, customerEmail } = data;

    logger.info('Initializing booking', { eventId, seatId, customerEmail });

    // Check if event exists
    const event = await state.get<Event>('events', eventId);
    if (!event) {
      return {
        status: 404,
        body: { error: 'Event not found' }
      };
    }

    // Get current holds and bookings
    const seatHolds = await state.getGroup<SeatHold>(`seat-holds:${eventId}`);
    const bookings = await state.getGroup<Booking>(`bookings:${eventId}`);

    const now = new Date();
    const activeHolds = seatHolds.filter(h => new Date(h.expiresAt) > now);
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');

    // If specific seat requested, check availability
    if (seatId) {
      const seatExists = event.seatMap.some(s => s.id === seatId);
      if (!seatExists) {
        return {
          status: 400,
          body: { error: `Seat ${seatId} does not exist` }
        };
      }

      const isHeld = activeHolds.some(h => h.seatId === seatId);
      const isBooked = confirmedBookings.some(b => b.seatId === seatId);

      if (isHeld || isBooked) {
        return {
          status: 409,
          body: { error: `Seat ${seatId} is not available` }
        };
      }
    } else {
      // General admission - just check capacity
      const takenSeats = activeHolds.length + confirmedBookings.length;
      if (takenSeats >= event.totalSeats) {
        return {
          status: 409,
          body: { error: 'Event is sold out' }
        };
      }
    }

    // Create booking
    const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const holdExpiresAt = new Date(now.getTime() + HOLD_DURATION_SECONDS * 1000);

    const booking = {
      id: bookingId,
      eventId,
      eventTitle: event.title,
      seatId: seatId || null,
      customerName,
      customerEmail,
      status: 'pending',
      holdExpiresAt: holdExpiresAt.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    // Store booking
    await state.set('bookings', bookingId, booking);
    await state.set(`bookings:${eventId}`, bookingId, booking);
    await state.set(`customer-bookings:${customerEmail}`, bookingId, booking);

    // Create seat hold if specific seat
    if (seatId) {
      const hold: SeatHold = {
        eventId,
        seatId,
        bookingId,
        expiresAt: holdExpiresAt.toISOString()
      };
      await state.set(`seat-holds:${eventId}`, seatId, hold);
    }

    logger.info('Booking initialized, seat held', {
      bookingId,
      seatId,
      holdExpiresAt: holdExpiresAt.toISOString()
    });

    // Emit event for validation
    await emit({
      topic: 'validate-booking',
      data: {
        bookingId,
        eventId,
        seatId: seatId || null,
        customerName,
        customerEmail
      }
    });

    return {
      status: 201,
      body: {
        bookingId,
        eventId,
        seatId,
        status: 'pending',
        holdExpiresAt: holdExpiresAt.toISOString(),
        message: `Seat held for ${HOLD_DURATION_SECONDS} seconds. Processing payment...`
      }
    };
  } catch (e: unknown) {
    const errorMessage = e instanceof z.ZodError
      ? e.issues.map((issue) => issue.message).join(', ')
      : 'Failed to initialize booking';
    logger.error('Booking initialization failed', { error: String(e) });
    return {
      status: 400,
      body: { error: errorMessage }
    };
  }
};
