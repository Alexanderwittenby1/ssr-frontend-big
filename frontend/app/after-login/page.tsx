"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

declare module "next-auth" {
  interface Session {
    jwt?: string;
  }
}

function AfterLoginInner() {
  const router = useRouter();
  const { data: session } = useSession();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  useEffect(() => {
    if (!session?.jwt) return;

    async function linkUser() {
      const res = await fetch(`/api/backend/auth/oauth-link`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.jwt}`,
          "Content-Type": "application/json",
        },
      });

      console.log("OAuth link status:", res.status);

      router.push(callbackUrl);
    }

    linkUser();
  }, [session, callbackUrl, router]);

  return (
    <p className="flex justify-center items-center h-screen">
      Loggar in...
    </p>
  );
}

export default function AfterLoginClient() {
  return (
    <Suspense fallback={<p>Laddar...</p>}>
      <AfterLoginInner />
    </Suspense>
  );
}
