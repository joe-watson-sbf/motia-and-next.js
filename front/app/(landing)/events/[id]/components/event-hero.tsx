"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users } from "lucide-react";
import { Event } from "@/lib/types";
import Image from 'next/image';
import { getEventImage } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

interface EventHeroProps {
  event: Event;
  isSoldOut: boolean;
  onBookClick: () => void;
  hasSeatMap: boolean;
  isPending: boolean;
}

const EventHero: React.FC<EventHeroProps> & {
  Skeleton: React.FC;
} = ({ event, isSoldOut, onBookClick, hasSeatMap, isPending }) => {
  const imageUrl = getEventImage(event.thumbnail);
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10 w-full" >
      {/* Image */}
      <div className="relative aspect-video w-full md:w-1/3 shrink-0 overflow-hidden rounded-xl border bg-muted">
        <Image
          src={imageUrl}
          alt={event.title}
          fill
          loading='eager'
          priority
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <Badge
              variant="destructive"
              className="px-4 py-2 text-lg font-bold uppercase tracking-widest shadow-xl"
            >
              Sold Out
            </Badge>
          </div>
        )}
      </div>

      {/* Event Info */}
      <div className="flex flex-1 flex-col justify-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {event.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-x-16 gap-y-2 text-sm text-muted-foreground">
          <p className="text-3xl font-bold text-primary">
            {formatPrice(event.price)}
          </p>
          <div className="">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Date
            </p>
            <span className="font-medium text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(event.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Seats
            </p>
            <span className="font-medium text-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              {event.totalSeats} seats capacity
            </span>
          </div>
          {!hasSeatMap && (
            <Button
              size="lg"
              className="h-12 px-8 text-base shadow-lg shadow-primary/20 ring-offset-background transition-all hover:scale-105 hover:ring-2 hover:ring-primary hover:ring-offset-2"
              disabled={isSoldOut || isPending}
              onClick={onBookClick}
            >
              {isPending ? "Processing..." : isSoldOut ? "Sold Out" : "Book General Admission"}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
};

EventHero.displayName = "EventHero";

EventHero.Skeleton = () => {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
      <Skeleton className="aspect-4/3 w-full max-w-sm rounded-2xl" />
      <div className="flex flex-1 flex-col space-y-6 pt-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-10 w-3/4" />
        <div className="flex gap-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="flex items-end justify-between pt-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-12 w-48" />
        </div>
      </div>
    </div>
  );
};

EventHero.Skeleton.displayName = "EventHero.Skeleton";

export default EventHero;
