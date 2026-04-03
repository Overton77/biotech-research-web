"use client";

import { ApolloProvider } from "@apollo/client";
import { useState, type ReactNode } from "react";

import { createKgApolloClient } from "@/lib/kg-apollo-client";

export function KgApolloProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => createKgApolloClient());
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
