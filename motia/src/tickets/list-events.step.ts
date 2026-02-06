import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';

export const config: ApiRouteConfig = {
  name: 'ListEvents',
  type: 'api',
  path: '/events',
  method: 'GET',
  description: 'List all events with optional filtering by slug, id, or title',
  emits: [],
  flows: ['ticket-booking-flow'],
  queryParams: [
    { name: 'slug', description: 'Filter by event slug' },
    { name: 'id', description: 'Filter by event ID' },
    { name: 'title', description: 'Search by title (partial match)' }
  ],
  responseSchema: {
    200: z.object({
      events: z.array(z.object({
        id: z.string(),
        title: z.string(),
        slug: z.string(),
        price: z.number(),
        description: z.string(),
        thumbnail: z.string(),
        totalSeats: z.number(),
        availableSeats: z.number(),
        createdAt: z.string()
      })),
      total: z.number()
    })
  }
};

interface Event {
  id: string;
  title: string;
  slug: string;
  price: number;
  description: string;
  thumbnail: string;
  totalSeats: number;
  availableSeats: number;
  createdAt: string;
}

export const handler: Handlers['ListEvents'] = async (req, { state, logger }) => {
  const { slug, id, title } = req.queryParams as { slug?: string; id?: string; title?: string };

  logger.info('Listing events', { filters: { slug, id, title } });

  // If filtering by slug, get event ID from slug index
  if (slug) {
    const eventId = await state.get<string>('event-slugs', slug);
    if (eventId) {
      const event = await state.get<Event>('events', eventId);
      if (event) {
        return {
          status: 200,
          body: {
            events: [formatEvent(event)],
            total: 1
          }
        };
      }
    }
    return { status: 200, body: { events: [], total: 0 } };
  }

  // If filtering by ID, get single event
  if (id) {
    const event = await state.get<Event>('events', id);
    if (event) {
      return {
        status: 200,
        body: {
          events: [formatEvent(event)],
          total: 1
        }
      };
    }
    return { status: 200, body: { events: [], total: 0 } };
  }

  // Get all events
  const allEvents = await state.getGroup<Event>('events');

  // Filter by title if provided
  let filteredEvents = allEvents;
  if (title) {
    const searchTerm = title.toLowerCase();
    filteredEvents = allEvents.filter(e =>
      e.title.toLowerCase().includes(searchTerm)
    );
  }

  // Sort by creation date (newest first)
  filteredEvents.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  logger.info('Events retrieved', { count: filteredEvents.length });

  return {
    status: 200,
    body: {
      events: filteredEvents.map(formatEvent),
      total: filteredEvents.length
    }
  };
};

function formatEvent(event: Event) {
  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    price: event.price,
    description: event.description,
    thumbnail: event.thumbnail,
    totalSeats: event.totalSeats,
    availableSeats: event.availableSeats,
    createdAt: event.createdAt
  };
}
