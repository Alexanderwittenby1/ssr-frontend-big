import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import SidebarItems from "@/components/sidebar-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import NewDocument from "@/components/new-document";
import { graphqlServer } from "@/lib/graphql-server"; // ✅ IMPORT

export default async function DokumentPage() {
  const session = await getServerSession(authOptions);

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

  // ✅ Replace fetch with graphqlServer
  const data = await graphqlServer(query);
  const posts = data?.documents || [];

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
