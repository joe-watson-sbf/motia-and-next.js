"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Tag } from "lucide-react";
import { Event } from "@/lib/types";
import Image from 'next/image';
import { getEventImage } from '@/lib/utils';

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> & {
  Skeleton: React.FC;
} = ({ event }) => {

  const imgUrl = getEventImage(event.thumbnail);
  return (
    <Link href={`/events/${event.id}`} className="group block" passHref>
      <article className="space-y-2">
        <div className="relative aspect-video overflow-hidden rounded-xl border bg-card text-card-foreground">
          <Image
            src={imgUrl}
            alt={event.title}
            priority
            loading='eager'
            width={450}
            height={450}
            className="object-cover h-full w-full transition-transform duration-300 group-hover:scale-105"
          />
          {event.availableSeats === 0 && (
            <Badge variant="secondary"
              className="absolute left-2 top-2"
            >Sold Out</Badge>
          )}
        </div>

        <div className="">
          <h1 className="sm:text-lg text-base line-clamp-2 font-semibold leading-tight group-hover:underline">
            {event.title}
          </h1>
          <h2 className="text-sm font-medium text-primary">
            {formatPrice(event.price)}
          </h2>
        </div>

        {event.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {event.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(event.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            <span>{event.totalSeats} seats</span>
          </div>
        </div>
      </article>
    </Link>
  );
};

EventCard.displayName = "EventCard";

EventCard.Skeleton = () => {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-video w-full rounded-xl" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
};

EventCard.Skeleton.displayName = "EventCard.Skeleton";

export default EventCard;
