import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";

// Query Keys
export const queryKeys = {
  events: ["events"] as const,
  event: (id: string) => ["events", id] as const,
  bookings: (email?: string) => ["bookings", email] as const,
  booking: (id: string) => ["booking", id] as const,
  adminBookings: (filters?: { status?: string; eventId?: string }) =>
    ["admin", "bookings", filters] as const,
  adminCustomers: ["admin", "customers"] as const,
};

// Events
export function useEvents(params?: { slug?: string; id?: string }) {
  return useQuery({
    queryKey: queryKeys.events,
    queryFn: () => api.getEvents(params)
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: queryKeys.event(id),
    queryFn: () => api.getEvent(id),
    enabled: !!id
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminBookings() });
    },
  });
}

// Bookings
export function useBooking(id: string) {
  return useQuery({
    queryKey: queryKeys.booking(id),
    queryFn: () => api.getBooking(id),
    enabled: !!id,
    refetchInterval: (query) => {
      // Poll while booking is in progress
      const status = query.state.data?.status;
      if (status === "pending" || status === "validating" || status === "processing") {
        return 1000;
      }
      return false;
    },
  });
}

export function useCustomerBookings(email: string) {
  return useQuery({
    queryKey: queryKeys.bookings(email),
    queryFn: () => api.getCustomerBookings(email),
    enabled: !!email
  });
}

export function useInitBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.initBooking,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminBookings() });
      queryClient.invalidateQueries({ queryKey: queryKeys.event(variables.eventId) });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminBookings() });
    },
  });
}

// Admin
export function useAdminBookings(filters?: { status?: string; eventId?: string }) {
  return useQuery({
    queryKey: queryKeys.adminBookings(filters),
    queryFn: () => api.getAllBookings(filters)
  });
}

export function useAdminCustomers() {
  return useQuery({
    queryKey: queryKeys.adminCustomers,
    queryFn: api.getAllCustomers,
  });
}
