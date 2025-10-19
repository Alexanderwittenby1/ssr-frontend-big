export async function graphqlRequest(query: string, variables?: any) {
  const res = await fetch('https://min-webb-app-ardhcjbkhgfkdzd2.northeurope-01.azurewebsites.net/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ query, variables }),
  });
  const data = await res.json();
  if (data.errors) throw new Error(data.errors[0]?.message);
  return data.data;
}
