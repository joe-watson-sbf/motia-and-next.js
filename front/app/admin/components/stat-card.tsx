"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

type StatCardProps = {
  label: string;
  value: string | number;
  isLoading?: boolean;
};

const StatCard: React.FC<StatCardProps> & {
  Skeleton: React.FC;
} = ({ label, value, isLoading }) => {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      {isLoading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <p className="text-2xl font-semibold">{value}</p>
      )}
    </div>
  );
};

StatCard.displayName = "StatCard";

StatCard.Skeleton = () => {
  return (
    <div className="space-y-1">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-8 w-20" />
    </div>
  );
};

StatCard.Skeleton.displayName = "StatCard.Skeleton";

export default StatCard;
