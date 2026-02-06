const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return res.json();
}

// Events
export const getEvents = (params?: { slug?: string; id?: string }) => {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : "";
  return fetchApi<{ events: Event[]; total: number }>(`/events${query}`);
};

export const getEvent = (id: string) =>
  fetchApi<Event>(`/events/${id}`);

export const createEvent = (data: CreateEventInput) =>
  fetchApi<Event>("/events", { method: "POST", body: JSON.stringify(data) });

// Bookings
export const initBooking = (data: InitBookingInput) =>
  fetchApi<BookingInitResponse>("/bookings/init", { method: "POST", body: JSON.stringify(data) });

export const getBooking = (id: string) =>
  fetchApi<Booking>(`/bookings/${id}`);

export const getCustomerBookings = (email: string) =>
  fetchApi<{ bookings: Booking[]; total: number }>(`/bookings?email=${encodeURIComponent(email)}`);

export const cancelBooking = (id: string) =>
  fetchApi<{ message: string }>(`/bookings/${id}/cancel`, { method: "POST" });

// Admin
export const getAllBookings = (params?: { status?: string; eventId?: string }) => {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : "";
  return fetchApi<{ bookings: Booking[]; total: number }>(`/admin/bookings${query}`);
};

export const getAllCustomers = () =>
  fetchApi<{ customers: Customer[]; total: number }>("/admin/customers");

// Types
import type { Event, Booking, Customer, BookingInitResponse } from "./types";

interface CreateEventInput {
  title: string;
  slug: string;
  price: number;
  description?: string;
  thumbnail?: string;
  totalSeats: number;
}

interface InitBookingInput {
  eventId: string;
  seatId?: string;
  customerName: string;
  customerEmail: string;
}
