import { cookies } from "next/headers";

export async function graphqlServer(query: string, variables?: any) {
  const cookieHeader = cookies().toString();

  const url = "/api/backend/graphql";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json = await res.json();
  return json.data;
}
