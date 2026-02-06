
import LandingView from "../components/landing-view";

export default function LandingPage() {
  return (
    <main className="py-8 space-y-8">
      <div className="space-y-2 ">
        <h1 className="text-4xl font-bold tracking-tight">Upcoming Events</h1>
        <p className="text-lg text-muted-foreground">
          Book your tickets for the best events in town.
        </p>
      </div>
      <LandingView />
    </main>
  );
}
