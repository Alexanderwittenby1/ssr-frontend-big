"use client";

export async function graphqlClient(query: string, variables?: any) {
  const res = await fetch("/api/backend/graphql", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  // ✅ Logga status men krascha inte
  console.log("📡 GraphQL status:", res.status);

  // ✅ Försök alltid läsa text först (kan vara HTML)
  const text = await res.text();
  console.log("📄 GraphQL Response Body:", text);

  // ✅ Kasta snyggt fel om inte JSON
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    console.error("❌ GraphQL returned non-JSON:", text);
    throw new Error(`GraphQL returned invalid response: HTTP ${res.status}`);
  }

  // ✅ Om GraphQL svarar med errors[]
  if (json.errors) {
    console.error("❌ GraphQL errors:", json.errors);
    throw new Error(json.errors[0]?.message || "GraphQL query failed");
  }

  return json.data;
}
