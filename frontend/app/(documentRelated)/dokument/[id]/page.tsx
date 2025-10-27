import React from "react";
import DisplayDocument from "@/components/display-document";
import { ScrollArea } from "@/components/ui/scroll-area";
import SidebarItems from "@/components/sidebar-list";
import { GET_ALL_DOCUMENTS } from "@/Graphql/queries";
import { graphqlServer } from "@/lib/graphql-server"; // ✅ IMPORT

export default async function Dokument({ params }: { params: { id: string } }) {
  const { id } = params;

  try {
    // ✅ Replace fetch with graphqlServer
    const data = await graphqlServer(GET_ALL_DOCUMENTS, { id });

    const posts = data?.documents || [];
    const post = data?.document;
    const users = data?.users;

    if (!post) {
      return (
        <div className="w-full h-screen flex justify-center items-center text-slate-600">
          Dokumentet hittades inte eller du saknar behörighet.
        </div>
      );
    }

    return (
      <div className="flex min-h-[calc(100vh-90px)] bg-gradient-to-br from-slate-50 to-slate-100">
        <aside className="w-72 bg-white border-r border-slate-200 shadow-md flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800 text-lg">Dina dokument</h2>
          </div>
          <ScrollArea className="flex-1 p-4">
            <SidebarItems posts={posts} />
          </ScrollArea>
        </aside>

        <main className="flex-1 overflow-hidden p-8">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 h-full overflow-hidden">
            <DisplayDocument
              id={post.id}
              title={post.title}
              content={post.content}
              comments={post.comments}
              users={users}
            />
          </div>
        </main>
      </div>
    );
  } catch (err: any) {
    return (
      <div className="w-full h-screen flex justify-center items-center text-slate-600">
        Ett oväntat fel inträffade: {err.message}
      </div>
    );
  }
}
