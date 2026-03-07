"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRef } from "react";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
      },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const client = useRef<QueryClient>(undefined);
  if (!client.current) {
    client.current = makeQueryClient();
  }
  return (
    <QueryClientProvider client={client.current}>
      {children}
    </QueryClientProvider>
  );
}
