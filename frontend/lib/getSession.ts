export async function getSession() {
  const res = await fetch("https://min-webb-app-ardhcjbkhgfkdzd2.northeurope-01.azurewebsites.net", { credentials: "include" });

  if (!res.ok) return null;

  const data = await res.json();
  console.log("data",data)

  // Om data är null eller inte har user
  if (!data || !data.user) return null;

  return data.user;
}
