
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";

export async function graphqlServer(query: string, variables?: any) {
  const session = await getServerSession(authOptions);
  console.log("🔐 Session in graphqlServer:", session);

  // ✅ Använd direkt backend URL istället för proxy för server-side requests
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_BACKEND_URL_PROD!
      : process.env.NEXT_PUBLIC_BACKEND_URL_LOCAL!;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // ✅ Skapa JWT från session (samma logik som proxy)
  if (session?.user) {
    try {
      const { SignJWT } = await import("jose");
      const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
      
      const backendJWT = await new SignJWT({
        sub: (session.user as any).id,
        name: session.user.name,
        email: session.user.email,
        picture: session.user.image,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(secret);

      headers["Authorization"] = `Bearer ${backendJWT}`;
      console.log("✅ Generated JWT for backend auth");
    } catch (error) {
      console.error("❌ Failed to generate JWT:", error);
    }
  } else {
    console.log("⚠️ No session found, proceeding without auth");
  }

  console.log("📡 Making GraphQL request to:", `${baseUrl}/graphql`);

  const res = await fetch(`${baseUrl}/graphql`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const text = await res.text();
  console.log("📡 GraphQL status:", res.status);
  console.log("📄 GraphQL Response Body:", text.substring(0, 500) + (text.length > 500 ? "..." : ""));

  if (!res.ok) {
    console.error(`❌ Backend returned HTTP ${res.status}`);
    throw new Error(`Backend returned HTTP ${res.status}: ${text}`);
  }

  if (!text) {
    throw new Error("Empty GraphQL response from backend");
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    console.error("❌ Backend returned non-JSON:", text);
    throw new Error(`Backend returned non-JSON response: HTTP ${res.status}`);
  }

  if (json.errors?.length) {
    console.error("❌ GraphQL errors:", json.errors);
    throw new Error(json.errors[0]?.message || "GraphQL query failed");
  }

  console.log("✅ GraphQL request successful");
  return json.data;
}
