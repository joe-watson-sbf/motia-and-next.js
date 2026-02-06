// API Types for Ticket Booking System

export interface Event {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  seatMap?: Seat[];
  createdAt: string;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  category: string;
  status?: 'available' | 'held' | 'booked';
}

export interface Booking {
  id: string;
  eventId: string;
  eventTitle?: string;
  seatId?: string | null;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'validating' | 'processing' | 'confirmed' | 'failed' | 'cancelled' | 'refunded';
  amount?: number;
  paymentId?: string;
  holdExpiresAt?: string;
  createdAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
}

export interface Customer {
  email: string;
  name: string;
  totalBookings: number;
  confirmedBookings: number;
  totalSpent: number;
  lastBookingAt?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface BookingInitResponse {
  bookingId: string;
  eventId: string;
  seatId?: string;
  status: string;
  holdExpiresAt: string;
  message: string;
}
