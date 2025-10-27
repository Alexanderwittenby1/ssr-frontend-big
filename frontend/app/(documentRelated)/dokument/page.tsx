import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import SidebarItems from "@/components/sidebar-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import NewDocument from "@/components/new-document";

export default async function DokumentPage() {
  // ✅ SSR-skydd: kräver inloggning
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <div className="h-screen flex items-center justify-center text-2xl text-red-600">
        Du måste vara inloggad för att se denna sidan.
      </div>
    );
  }

  // ✅ Backend-URL beroende på miljö (samma logik som proxyn)
  const backendUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_BACKEND_URL_PROD!
      : process.env.NEXT_PUBLIC_BACKEND_URL_LOCAL!;

  // ✅ Backend-JWT signerad i NextAuth callbacks
  const jwt = (session as any).jwt as string | null;

  const query = `
    query {
      documents {
        id
        title
        content
        comments {
          id
          text
          from
          to
        }
      }
    }
  `;

  let posts: Array<{
    id: string;
    title: string;
    content: string;
    comments: Array<{ id: string; text: string; from: number; to: number }>;
  }> = [];

  try {
    // ✅ Skicka Authorization: Bearer <jwt> till backend GraphQL
    const res = await fetch(`${backendUrl}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify({ query }),
      // Viktigt i SSR/Server Components så vi inte cache:ar authade svar
      cache: "no-store",
    });

    const json = await res.json();
    if (json?.errors?.length) {
      console.error("GraphQL errors:", json.errors);
      throw new Error(json.errors[0]?.message || "GraphQL query failed");
    }

    posts = json?.data?.documents || [];
  } catch (err: any) {
    console.error("[DokumentPage] GraphQL fetch error:", err?.message);
    return (
      <div className="h-screen flex items-center justify-center text-2xl text-red-600">
        Ett oväntat fel inträffade: {err?.message ?? "Okänt fel"}
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0">
      <ScrollArea className="w-64 p-4 border-r">
        <SidebarItems posts={posts} />
      </ScrollArea>

      <div className="flex-1">
        <NewDocument />
      </div>
    </div>
  );
}
