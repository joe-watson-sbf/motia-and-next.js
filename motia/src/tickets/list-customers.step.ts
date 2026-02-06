import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';

// Customer summary schema
const customerSchema = z.object({
  email: z.string(),
  name: z.string(),
  totalBookings: z.number(),
  confirmedBookings: z.number(),
  totalSpent: z.number(),
  lastBookingAt: z.string().optional()
});

export const config: ApiRouteConfig = {
  name: 'ListCustomers',
  type: 'api',
  description: 'Lists all customers with booking stats (admin view)',
  path: '/admin/customers',
  method: 'GET',
  emits: [],
  flows: ['ticket-booking-flow'],
  responseSchema: {
    200: z.object({
      customers: z.array(customerSchema),
      total: z.number()
    })
  }
};

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  status: string;
  amount?: number;
  createdAt: string;
}

interface CustomerStats {
  email: string;
  name: string;
  totalBookings: number;
  confirmedBookings: number;
  totalSpent: number;
  lastBookingAt?: string;
}

export const handler: Handlers['ListCustomers'] = async (_req, { state, logger }) => {
  logger.info('Fetching all customers');

  // Get all bookings
  const allBookings = await state.getGroup<Booking>('bookings');

  // Aggregate by customer email
  const customerMap = new Map<string, CustomerStats>();

  for (const booking of allBookings) {
    const existing = customerMap.get(booking.customerEmail);

    if (existing) {
      existing.totalBookings++;
      if (booking.status === 'confirmed' || booking.status === 'refunded') {
        existing.confirmedBookings++;
        existing.totalSpent += booking.amount || 0;
      }
      // Update last booking date if newer
      if (!existing.lastBookingAt || booking.createdAt > existing.lastBookingAt) {
        existing.lastBookingAt = booking.createdAt;
        existing.name = booking.customerName; // Use most recent name
      }
    } else {
      customerMap.set(booking.customerEmail, {
        email: booking.customerEmail,
        name: booking.customerName,
        totalBookings: 1,
        confirmedBookings: (booking.status === 'confirmed' || booking.status === 'refunded') ? 1 : 0,
        totalSpent: (booking.status === 'confirmed' || booking.status === 'refunded') ? (booking.amount || 0) : 0,
        lastBookingAt: booking.createdAt
      });
    }
  }

  const customers = Array.from(customerMap.values());

  // Sort by total spent (highest first)
  customers.sort((a, b) => b.totalSpent - a.totalSpent);

  return {
    status: 200,
    body: {
      customers,
      total: customers.length
    }
  };
};
