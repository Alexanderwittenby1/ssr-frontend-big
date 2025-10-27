"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AfterLoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  useEffect(() => {
    async function linkUser() {
      const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";

      const res = await fetch(`${origin}/api/backend/auth/oauth-link`, { method: "POST" });

      if (!res.ok) {
        console.error("Auth link error:", await res.text());
      }

      router.push(callbackUrl);
    }

    linkUser();
  }, [callbackUrl, router]);

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
