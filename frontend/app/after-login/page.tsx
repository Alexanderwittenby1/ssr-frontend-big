"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

function AfterLoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const { data: session, status } = useSession();
  const [linked, setLinked] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!session?.jwt) return;
    if (linked) return;

    setLinked(true);

    async function linkUser() {
      console.log("🔄 Linking user to backend...");

      const res = await fetch("/api/backend/auth/oauth-link", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.jwt}`,
          "Content-Type": "application/json",
        },
      });

      console.log("✅ OAuth link status:", res.status);

      router.replace(callbackUrl);
    }

    linkUser();
  }, [status, session, linked, callbackUrl, router]);

  return (
    <p className="flex justify-center items-center h-screen">
      Loggar in...
    </p>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="h-screen flex justify-center items-center">Laddar...</p>}>
      <AfterLoginInner />
    </Suspense>
  );
}
