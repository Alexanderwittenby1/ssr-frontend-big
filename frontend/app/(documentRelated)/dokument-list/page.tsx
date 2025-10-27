import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import Link from "next/link";

interface Document {
  id: string;
  title: string;
}

export default async function DokumentList() {
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
      }
    }
  `;

  const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const res = await fetch(`/api/backend/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });

  console.log("📡 DokumentList → GraphQL status:", res.status);
  const json = await res.json();
  console.log("📄 DokumentList → GraphQL response:", json);

  const documents: Document[] = json?.data?.documents ?? [];

  return (
    <div className="min-h-[calc(100vh-90px)] w-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800">
      <h1 className="text-3xl font-semibold mb-8 text-slate-900 tracking-tight">
        Dina dokument
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-[90%] md:w-[80%] p-8 bg-white rounded-3xl shadow-md border border-slate-200">
        <Link
          href="/dokument"
          className="group flex flex-col justify-center items-center h-[200px] w-full rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          + Nytt Dokument
        </Link>

        {documents.length > 0 ? (
          documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/dokument/${doc.id}`}
              className="group flex flex-col justify-center items-center h-[200px] w-full rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white p-4 text-center shadow-lg hover:shadow-xl transition-transform duration-300 hover:scale-[1.03] "
            >
              <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-300 transition-colors">
                {doc.title}
              </h3>
            </Link>
          ))
        ) : (
          <p className="col-span-full text-center text-slate-400 py-12 italic">
            Inga dokument ännu
          </p>
        )}
      </div>
    </div>
  );
}
