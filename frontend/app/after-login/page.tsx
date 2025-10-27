"use client";

import { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

function AfterLoginInner() {
  const router = useRouter();
  const { data: session } = useSession();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!session?.jwt || processing) return;

    setProcessing(true);

    async function linkUser() {
      console.log("🔄 Linking user...");
      
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
  }, [session, processing, callbackUrl, router]);

  return (
    <p className="flex justify-center items-center h-screen">
      Loggar in...
    </p>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Laddar...</p>}>
      <AfterLoginInner />
    </Suspense>
  );
}
