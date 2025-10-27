"use client";

import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar({ user }: { user: any }) {
  return (
    <div className="bg-blue-600 w-full h-[90px] flex justify-between items-center px-8">
      <Link className="flex flex-row items-center justify-center" href="/">
        <Image src="/noetly.svg" width={80} height={80} alt="logga" className="pt-5" />
        <p className="text-[#E4960E] font-bold text-3xl -translate-x-4 translate-y-1 font-orbitron">
          otly
        </p>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            {user.image && (
              <div className="w-[32px] h-[32px] overflow-hidden rounded-full">
                <Image
                  src={user.image}
                  width={32}
                  height={32}
                  alt="User avatar"
                  className="object-cover"
                />
              </div>
            )}

            <span className="text-[#E4960E]">{user.name}</span>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="bg-slate-950 text-white px-4 py-1 rounded-full hover:bg-slate-800 transition font-bold"
            >
              Logga ut
            </button>
          </>
        ) : (
          <Link
            href="/auth/signin"
            className="bg-slate-950 text-white px-4 py-1 rounded-full hover:bg-slate-800 transition font-bold"
          >
            Logga in
          </Link>
        )}
      </div>
    </div>
  );
}
