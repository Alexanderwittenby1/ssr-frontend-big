"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface User {
  name: string;
  email?: string;
  image?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Välj rätt backend beroende på miljö
  const isDev = process.env.NODE_ENV === "development";
  console.log("Navbar idDev:",isDev)
  console.log("User",user)

  const BACKEND_URL = isDev
    ? process.env.NEXT_PUBLIC_BACKEND_URL_LOCAL
    : process.env.NEXT_PUBLIC_BACKEND_URL_PROD;

  useEffect(() => {
    fetch("/api/session", { credentials: "include" })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        console.log("session response:", res.status, data);
        setUser(data?.user || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("fetch /api/session failed:", err);
        setUser(null);
        setLoading(false);
      });
  }, []);



  if (loading)
    return (
      <div className="bg-blue-600 w-full h-[90px] flex items-center px-8">
        <span className="text-white font-bold">Laddar...</span>
      </div>
    );

  return (
    <div className="bg-blue-600 w-full h-[90px] flex justify-between items-center px-8">
      <Link className="flex flex-row items-center justify-center" href="/">
        <Image src="noetly.svg" width={80} height={80} alt="logga" className="pt-5" />
        <p className="text-[#E4960E] font-bold text-3xl -translate-x-4 translate-y-1 font-orbitron">
          otly
        </p>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="w-[24px] h-[24px] overflow-hidden rounded-full">
              <img
                src={user.image}
                alt={user.name || "User avatar"}
                className="w-full h-full object-cover"
              />
            </div>

            <span className="text-[#E4960E]">{user.name}</span>
            <a
              href={`${BACKEND_URL}/auth/signout`}
              className="bg-slate-950 text-white px-4 py-1 rounded-full flex flex-row justify-center items-center hover:bg-slate-800 transition font-bold inset-ring-1"
            >
              Logga ut
            </a>
          </>
        ) : <a
              href={`${BACKEND_URL}/auth/signin`}
              className="bg-slate-950 text-white px-4 py-1 rounded-full flex flex-row justify-center items-center hover:bg-slate-800 transition font-bold inset-ring-1"
            >
              Logga in
            </a>}
      </div>
    </div>
  );
}
