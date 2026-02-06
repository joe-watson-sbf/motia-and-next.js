import BookingsTable from "./components/bookings-table";

export default function AdminBookingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">All Bookings</h1>
      </div>
      <BookingsTable />
    </div>
  );
}
