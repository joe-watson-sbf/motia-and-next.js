"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Seat } from "@/lib/types";
import React from "react";

interface SeatMapProps {
  seatMap: Seat[];
  selectedSeat: string | null;
  isSoldOut: boolean;
  onSeatSelect: (seatId: string) => void;
  onBookClick: () => void;
  isPending: boolean;
}

function SeatButton({
  seat,
  selected,
  onSelect,
}: {
  seat: Seat;
  selected: boolean;
  onSelect: () => void;
}) {
  const isUnavailable = seat.status === "held" || seat.status === "booked";

  // Determine variant based on state
  const variant = isUnavailable
    ? "destructive"
    : selected
      ? "default"
      : "outline"; // or secondary/ghost based on preference, outline fits "available" well

  return (
    <Button
      variant={variant}
      disabled={isUnavailable}
      onClick={onSelect}
      className={`
        h-10 w-10 p-0 rounded-lg text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5
        ${selected ? "scale-110" : ""}
      `}
    >
      {seat.number}
    </Button>
  );
}

const SeatMap: React.FC<SeatMapProps> & {
  Skeleton: React.FC;
} = ({ seatMap, selectedSeat, isSoldOut, onSeatSelect, onBookClick, isPending }) => {
  return (
    <Card className="w-fit gap-0 border-none shadow-none animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader className="text-center border border-b-0 rounded-t-xl">

        <CardDescription className="text-base hidden -mt-2 mb-2">
          Choose your preferred spot from the map below
        </CardDescription>
        <div className="flex w-full justify-center">
          <div className="w-2/3 max-w-lg rounded-b-[40%] border-b-4 border-primary/20 bg-linear-to-b from-primary/5 to-transparent py-4 text-center text-xs font-bold uppercase tracking-[0.2em] shadow-sm">
            <CardTitle className="text-xl font-bold tracking-tight">
              Select Your Seat
            </CardTitle>
            <span className='text-primary/40'>
              Stage / Screen
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        {/* Stage Indicator */}

        <div className="flex border-x border-b rounded-b-xl p-3 flex-col items-center gap-4 w-full overflow-x-auto py-4">
          {/* Group seats by row */}
          {Object.entries(
            seatMap.reduce((acc, seat) => {
              const row = seat.row || "General";
              if (!acc[row]) acc[row] = [];
              acc[row].push(seat);
              return acc;
            }, {} as Record<string, typeof seatMap>)
          ).sort().map(([row, seats]) => (
            <div key={row} className="flex items-center gap-6 min-w-fit">
              <span className="w-6 text-right font-mono text-sm font-bold text-muted-foreground/50">
                {row}
              </span>
              <div className="flex gap-3">
                {seats
                  .sort((a, b) => a.number - b.number)
                  .map((seat) => (
                    <SeatButton
                      key={seat.id}
                      seat={seat}
                      selected={selectedSeat === seat.id}
                      onSelect={() => onSeatSelect(seat.id)}
                    />
                  ))}
              </div>
              <span className="w-6 font-mono text-sm font-bold text-muted-foreground/50">
                {row}
              </span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-8 w-full">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-secondary border shadow-xs" />
            <span className="text-sm font-medium">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-primary shadow-md shadow-primary/20" />
            <span className="text-sm font-medium">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-destructive text-white shadow-sm" />
            <span className="text-sm font-medium text-destructive">
              Occupied
            </span>
          </div>
        </div>

        <div className="mt-10 flex justify-center w-full">
          <Button
            onClick={onBookClick}
            disabled={!selectedSeat || isSoldOut || isPending}
            className="w-full max-w-xs"
          >
            {isPending ? "Hold on..." : isSoldOut ? "Sold Out" : selectedSeat ? "Book Seat" : "Select a Seat"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

SeatMap.displayName = "SeatMap";

SeatMap.Skeleton = () => {
  return (
    <div className="rounded-2xl border bg-card/50 p-10 shadow-sm w-full">
      <div className="mx-auto mb-8 h-8 w-48 rounded bg-muted" />
      <div className="mx-auto mb-10 h-12 w-2/3 max-w-md rounded-b-3xl bg-muted/50" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-center gap-3">
            {Array.from({ length: 8 }).map((_, j) => (
              <Skeleton key={j} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

SeatMap.Skeleton.displayName = "SeatMap.Skeleton";

export default SeatMap;
