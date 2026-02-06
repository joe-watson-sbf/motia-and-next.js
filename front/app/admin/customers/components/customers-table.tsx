"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminCustomers } from "@/query/hooks";

const CustomersTable: React.FC & {
  Skeleton: React.FC;
} = () => {
  const { data, isLoading, error } = useAdminCustomers();

  if (isLoading) {
    return <CustomersTable.Skeleton />;
  }

  if (error) {
    return <div>Error loading customers</div>;
  }

  const customers = data?.customers || [];

  if (customers.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">No customers yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead className="text-right">Total Bookings</TableHead>
          <TableHead className="text-right">Confirmed</TableHead>
          <TableHead className="text-right">Total Spent</TableHead>
          <TableHead>Last Booking</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.email}>
            <TableCell>
              <div>
                <p className="font-medium">{customer.name}</p>
                <p className="text-xs text-muted-foreground">{customer.email}</p>
              </div>
            </TableCell>
            <TableCell className="text-right">{customer.totalBookings}</TableCell>
            <TableCell className="text-right">{customer.confirmedBookings}</TableCell>
            <TableCell className="text-right font-medium">
              ${(customer.totalSpent / 100).toFixed(2)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {customer.lastBookingAt
                ? new Date(customer.lastBookingAt).toLocaleDateString()
                : "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

CustomersTable.displayName = "CustomersTable";

CustomersTable.Skeleton = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
};

CustomersTable.Skeleton.displayName = "CustomersTable.Skeleton";

export default CustomersTable;
