"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/lib/user-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ticket } from "lucide-react";

export default function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setIsAdmin } = useUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [adminMode, setAdminMode] = useState(false);

  const redirectTo = searchParams.get("redirect") || "/";

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setUser({ name, email });
    setIsAdmin(adminMode);
    router.push(adminMode ? "/admin" : redirectTo);
  };

  return (
    <div className="flex w-full h-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <Ticket className="h-10 w-10" />
          <h1 className="text-2xl font-semibold">Motia Tickets</h1>
          <p className="text-sm text-muted-foreground">
            Enter your info to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="admin"
              type="checkbox"
              checked={adminMode}
              onChange={(e) => setAdminMode(e.target.checked)}
              className="rounded border-input"
            />
            <Label htmlFor="admin" className="text-sm font-normal">
              Login as Admin
            </Label>
          </div>

          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
