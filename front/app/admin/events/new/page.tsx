import CreateEventForm from "./components/create-event-form";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-2xl w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Event</h1>
        <p className="text-muted-foreground">Add a new event for ticket sales</p>
      </div>

      <CreateEventForm />
    </div>
  );
}
