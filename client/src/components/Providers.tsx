"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  // useState so each browser session gets its own QueryClient
  // if we did const queryClient = new QueryClient() outside the component,
  // it would be shared across ALL users in SSR — a data leak bug
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,  // data stays fresh for 60 seconds
        retry: 1,               // retry failed requests once
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}