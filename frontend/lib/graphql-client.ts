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

  console.log("Här är status i GraphQL:", res.status);
  const text = await res.text();
  console.log("Här är svaret från GraphQL:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON");
  }
  return data.data;
}
