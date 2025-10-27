import { cookies } from "next/headers";

export async function graphqlServer(query: string, variables?: any) {
  const cookieHeader = cookies().toString();

  // ✅ Hardcode för produktion
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://ssr-frontend-big.vercel.app"
      : "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/backend/graphql`, {
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
