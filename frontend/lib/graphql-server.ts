
import { cookies } from "next/headers";

export async function graphqlServer(query: string, variables?: any) {
  const cookieHeader = cookies().toString();

  // Försök hämta JWT från cookies (om du sparar den där)
  let jwt: string | undefined = undefined;
  try {
    const cookieStr = cookieHeader;
    // Exempel: hitta "jwt=..." i cookiesträng
    const match = cookieStr.match(/jwt=([^;]+)/);
    if (match) jwt = match[1];
  } catch {}

  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_BACKEND_URL_PROD!
      : process.env.NEXT_PUBLIC_BACKEND_URL_LOCAL!;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Cookie: cookieHeader,
  };
  if (jwt) {
    headers["Authorization"] = `Bearer ${jwt}`;
  }

  const res = await fetch(`${baseUrl}/graphql`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  // Logga status och body för felsökning
  const text = await res.text();
  console.log("📡 GraphQL status:", res.status);
  console.log("📄 GraphQL Response Body:", text);

  if (!text) {
    throw new Error("Empty GraphQL response from backend");
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    console.error("Backend returned non-JSON:", text);
    throw new Error(`Backend returned non-JSON response: HTTP ${res.status}`);
  }

  if (json.errors?.length) {
    console.error("GraphQL errors:", json.errors);
    throw new Error(json.errors[0]?.message || "GraphQL query failed");
  }

  return json.data;
}
