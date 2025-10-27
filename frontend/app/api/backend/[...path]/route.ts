import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { SignJWT } from "jose";

export const runtime = "nodejs"; // ✅ Viktigt för Vercel/Azure
export const dynamic = "force-dynamic"; // ✅ Cookies ska alltid läsas

const BE =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_BACKEND_URL_PROD!
    : process.env.NEXT_PUBLIC_BACKEND_URL_LOCAL!;

export async function handler(req: NextRequest) {
  // ✅ Läs JWT från cookies med secret
  const payload = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  console.log("🔐 Proxy → user payload:", payload?.email ?? "NO USER");

  const headers = new Headers({ "content-type": "application/json" });

  if (payload) {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);

    const backendJWT = await new SignJWT({
      sub: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: (payload as any).picture,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(secret);

    headers.set("Authorization", `Bearer ${backendJWT}`);
  }

  const url = new URL(req.url);
  const path = url.pathname.replace("/api/backend", "");
  const targetUrl = BE + path + url.search;

  console.log("➡️ Proxying request to:", targetUrl);

  const res = await fetch(targetUrl, {
    method: req.method,
    body: req.method !== "GET" ? await req.text() : undefined,
    headers,
  });

  const data = await res.text();

  console.log("⬅️ Backend status:", res.status);

  return new NextResponse(data, { status: res.status });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
