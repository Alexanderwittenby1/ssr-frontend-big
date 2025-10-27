import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import SidebarItems from "@/components/sidebar-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import NewDocument from "@/components/new-document";
import { cookies } from "next/headers";

export default async function DokumentPage() {
  // ✅ Hämta cookies före await
  const cookieHeader = cookies().toString();
  console.log("📦 Cookie header i DokumentPage:", cookieHeader);

  const session = await getServerSession(authOptions);
  console.log("🧑 Server-session i DokumentPage:", session?.user);

  if (!session?.user) {
    return (
      <div className="h-screen flex items-center justify-center text-2xl text-red-600">
        Du måste vara inloggad för att se denna sidan.
      </div>
    );
  }

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

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/backend/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader, // ✅ viktig!
    },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });

  console.log("📡 DokumentPage GraphQL status:", res.status);

  const data = await res.json();
  console.log("📄 DokumentPage GraphQL svar:", data);

  const posts = data?.data?.documents || [];

  return (
    <div className="flex flex-1 min-h-0">
      {/* Sidebar */}
      <ScrollArea className="w-64 p-4 border-r">
        <SidebarItems posts={posts} />
      </ScrollArea>

      {/* Main content */}
      <div className="flex-1">
        <NewDocument />
      </div>
    </div>
  );
}
