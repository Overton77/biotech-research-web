import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const defaultUri = "http://localhost:4002/graphql";

export function createKgApolloClient() {
  const uri = process.env.NEXT_PUBLIC_NEO4J_GRAPHQL_URL ?? defaultUri;

  return new ApolloClient({
    link: new HttpLink({ uri, credentials: "omit" }),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { fetchPolicy: "cache-and-network" },
    },
  });
}
