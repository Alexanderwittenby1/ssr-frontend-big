import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { SignJWT } from "jose";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const BE =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_BACKEND_URL_PROD!
    : process.env.NEXT_PUBLIC_BACKEND_URL_LOCAL!;

export async function handler(req: NextRequest) {
  const secret = process.env.AUTH_SECRET!;
  
  // ✅ Hämta NextAuth-token från cookies på rätt sätt
  const payload = await getToken({
    req,
    secret,
    secureCookie: process.env.NODE_ENV === "production"
  });

  console.log("🔍 Proxy payload:", payload);
  console.log("🔍 Incoming cookies:", req.headers.get("cookie"));

  // ✅ Headers till backend
  const headers = new Headers({
    "content-type": "application/json",
    Cookie: req.headers.get("cookie") || ""
  });

  // ✅ Om vi har en användare → skapa JWT för backend
  if (payload) {
    const backendJWT = await new SignJWT({
      sub: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: (payload as any).picture,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(new TextEncoder().encode(secret));

    headers.set("Authorization", `Bearer ${backendJWT}`);
  }

  // ✅ Proxy vidare
  const url = new URL(req.url);
  const path = url.pathname.replace("/api/backend", "");

  const res = await fetch(BE + path, {
    method: req.method,
    body: req.method !== "GET" ? await req.text() : undefined,
    headers,
    credentials: "include"
  });

  const data = await res.text();
  return new NextResponse(data, { status: res.status });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
