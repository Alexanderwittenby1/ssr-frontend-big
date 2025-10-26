"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AfterLogin() {
  const router = useRouter();

  useEffect(() => {
    async function getSession() {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (data?.accessToken) {
       
        localStorage.setItem("accessToken", data.accessToken);
        
      }
      router.push("/dokument");
    }
    getSession();
  }, [router]);

  return <p>Loggar in...</p>;
}
