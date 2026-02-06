import { Separator } from '@/components/ui/separator';
import LandingView from "../components/landing-view";
import DashboardView from "./components/dashboard-view";

export default function AdminDashboard() {
  return <div className="space-y-6">
    <DashboardView />
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Your Events
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage your events.
        </p>
      </div>
      <LandingView />
    </div>
  </div>;
}
