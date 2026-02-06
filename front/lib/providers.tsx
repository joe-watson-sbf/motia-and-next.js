"use client";

import { QueryProvider } from "@/query/query-client-provider";
import { UserProvider } from "@/lib/user-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <UserProvider>{children}</UserProvider>
    </QueryProvider>
  );
}

Providers.displayName = "Providers";
