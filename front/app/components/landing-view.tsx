"use client";
import { useEvents } from "@/query/hooks";
import EventCard from "./event-card";

export default function LandingView() {
  const { data, isLoading } = useEvents();

  if (isLoading) {
    return (
      <div className="grid grid-cols-responsive-lg gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <EventCard.Skeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-responsive-lg gap-6">
      {data?.events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
