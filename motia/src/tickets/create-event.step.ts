import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';

const bodySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  price: z.number().min(0, 'Price must be positive (in cents)'),
  description: z.string().optional(),
  thumbnail: z.url('Thumbnail must be a valid URL').optional(),
  totalSeats: z.number().min(1).optional().default(100),
  seatMap: z.array(z.object({
    id: z.string(),
    row: z.string(),
    number: z.number(),
    category: z.enum(['vip', 'regular']).default('regular'),
    price: z.number().optional()
  })).optional()
});

export const config: ApiRouteConfig = {
  name: 'CreateEvent',
  type: 'api',
  path: '/events',
  method: 'POST',
  description: 'Create a new event for ticket booking',
  emits: [],
  flows: ['ticket-booking-flow'],
  bodySchema,
  responseSchema: {
    201: z.object({
      id: z.string(),
      title: z.string(),
      slug: z.string(),
      price: z.number(),
      totalSeats: z.number(),
      availableSeats: z.number(),
      createdAt: z.string()
    }),
    400: z.object({ error: z.string() })
  }
};

export const handler: Handlers['CreateEvent'] = async (req, { state, logger }) => {
  try {
    const data = bodySchema.parse(req.body);

    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Generate seat map if not provided
    const seatMap = data.seatMap || generateDefaultSeatMap(data.totalSeats);

    const event = {
      id: eventId,
      title: data.title,
      slug: data.slug,
      price: data.price,
      description: data.description || '',
      thumbnail: data.thumbnail || '',
      totalSeats: data.totalSeats,
      availableSeats: data.totalSeats,
      seatMap,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store event in state
    await state.set('events', eventId, event);

    // Also index by slug for quick lookup
    await state.set('event-slugs', data.slug, eventId);

    logger.info('Event created successfully', { eventId, title: data.title, slug: data.slug });

    return {
      status: 201,
      body: {
        id: event.id,
        title: event.title,
        slug: event.slug,
        price: event.price,
        totalSeats: event.totalSeats,
        availableSeats: event.availableSeats,
        createdAt: event.createdAt
      }
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation failed', { errors: error.message });
      return {
        status: 400,
        body: { error: error.message }
      };
    }
    logger.error('Event creation failed', { error: String(error) });
    return {
      status: 400,
      body: { error: 'Failed to create event' }
    };
  }
};

// Generate default seat map (rows A-J, 10 seats each)
function generateDefaultSeatMap(totalSeats: number) {
  const seats = [];
  const rows = 'ABCDEFGHIJ'.split('');
  const seatsPerRow = Math.ceil(totalSeats / rows.length);

  let seatCount = 0;
  for (const row of rows) {
    for (let num = 1; num <= seatsPerRow && seatCount < totalSeats; num++) {
      seats.push({
        id: `${row}${num}`,
        row,
        number: num,
        category: row <= 'B' ? 'vip' : 'regular' as const,
        price: row <= 'B' ? undefined : undefined // Use event price by default
      });
      seatCount++;
    }
  }
  return seats;
}
