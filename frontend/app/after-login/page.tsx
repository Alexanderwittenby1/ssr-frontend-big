"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AfterLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  useEffect(() => {
    async function linkUser() {
      const res = await fetch("/api/backend/auth/oauth-link", { method: "POST" });
      
      if (!res.ok) {
        console.error("Auth link error:", await res.text());
      }
      router.push(callbackUrl);
    }

    linkUser();
  }, [callbackUrl, router]);

  return <p className="flex justify-center items-center h-screen">Loggar in...</p>;
}
