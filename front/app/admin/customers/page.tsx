import CustomersTable from "./components/customers-table";

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
      </div>
      <CustomersTable />
    </div>
  );
}
