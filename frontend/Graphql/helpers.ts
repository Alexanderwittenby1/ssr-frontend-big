export async function graphqlRequest(query: string, variables?: any) {
   const envMode = process.env.NODE_ENV;
  
  const isProd = envMode === "production";

  const backend_url = isProd
    ? `${process.env.BACKEND_URL_LIVE}/graphql`
    : "http://localhost:5025/graphql";

  const res = await fetch(backend_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ query, variables }),
  });
  const data = await res.json();
  console.log("Helpers log: " ,data)
  if (data.errors) throw new Error(data.errors[0]?.message);
  return data.data;
}
