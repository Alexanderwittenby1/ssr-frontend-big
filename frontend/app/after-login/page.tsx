"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

function AfterLoginInner() {
  const router = useRouter();
  const { data: session } = useSession();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  useEffect(() => {
    if (!session?.jwt) return; // Vänta tills JWT finns

    async function linkUser() {
      const res = await fetch(`/api/backend/auth/oauth-link`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.jwt}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.error("Auth link error:", await res.text());
      }

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

export default function AfterLogin() {
  return (
    <Suspense fallback={<p className="h-screen flex justify-center items-center">Laddar...</p>}>
      <AfterLoginInner />
    </Suspense>
  );
}
