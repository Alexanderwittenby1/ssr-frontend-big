import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import LoginButton from "@/components/LoginButton";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getServerSession(authOptions);
  console.log("Session på startsidan:", session);
  const user = session?.user;
  console.log("Användare på startsidan:", user);
  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-90px)] bg-[url(/back.jpg)] bg-cover text-slate-800 p-8">
      {user ? (
        <section
          id="dashboard"
          className="w-full max-w-5xl bg-white rounded-3xl shadow-lg border border-slate-200 p-10 text-center"
        >
          <h1 className="text-3xl font-semibold mb-4">
            Välkommen tillbaka, {user.name || "Användare"}
          </h1>
          <p className="text-slate-500 mb-10">
            Härifrån kan du snabbt komma åt dina dokument eller skapa nya.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/dokument-list"
              className="group flex flex-col justify-center items-center h-40 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-white hover:scale-105 hover:shadow-lg transition-all"
            >
              <h3 className="font-semibold text-lg group-hover:text-blue-300">
                Mina dokument
              </h3>
              <p className="text-sm text-slate-400 mt-1">Se alla filer</p>
            </Link>

            <Link
              href="/dokument"
              className="group flex flex-col justify-center items-center border-2 border-dashed border-slate-300 hover:border-blue-400 h-40 rounded-2xl text-blue-700 hover:scale-105 hover:shadow-lg transition-all"
            >
              <h3 className="font-semibold text-lg text-blue-700">
                Skapa nytt
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Starta ett nytt dokument
              </p>
            </Link>

            <Link
              href="/profil"
              className="group flex flex-col justify-center items-center h-40 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white hover:scale-105 hover:shadow-lg transition-all"
            >
              <h3 className="font-semibold text-lg group-hover:text-emerald-200">
                Profil
              </h3>
              <p className="text-sm text-emerald-100 mt-1">
                Hantera konto (Ej tillgängligt)
              </p>
            </Link>
          </div>
        </section>
      ) : (
        <section
          id="hero"
          className="flex flex-col items-center text-center max-w-3xl"
        >
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            SSR-EDITOR
          </h1>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            Skapa, redigera och hantera dina dokument direkt i webbläsaren.
            Snabbt, säkert och utan onödigt krångel.
          </p>

          <div className="flex gap-4">
            <LoginButton />
            <Link href="/auth/register">
              <Button className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-3 rounded-xl shadow-md hover:scale-105 transition hover:cursor-pointer">
                Skapa konto
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-slate-600">
            <Feature icon="📝" title="Redigera i realtid" desc="Skriv och formatera text med vår kraftfulla editor." />
            <Feature icon="☁️" title="Säker lagring" desc="Allt sparas tryggt i molnet, alltid tillgängligt." />
            <Feature icon="🚀" title="Snabbt & enkelt" desc="Inget krångel, bara fokusera på ditt innehåll." />
          </div>
        </section>
      )}
    </main>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
      <span className="text-3xl mb-2">{icon}</span>
      <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 text-center">{desc}</p>
    </div>
  );
}
