import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { SignJWT } from "jose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BE =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_BACKEND_URL_PROD!
    : process.env.NEXT_PUBLIC_BACKEND_URL_LOCAL!;

export async function handler(req: NextRequest) {
  const payload = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  console.log("🔐 Proxy → user payload:", payload?.email ?? "NO USER");

  const url = new URL(req.url);
  const path = url.pathname.replace("/api/backend", "");
  const targetUrl = BE + path + url.search;

  // ✅ Läs body EN gång
  const contentType = req.headers.get("content-type");
  const body =
    req.method !== "GET" &&
    contentType &&
    contentType.includes("application/json")
      ? await req.text()
      : undefined;

  const headers = new Headers();

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

  // ✅ AUTH passthrough (ej GraphQL)
  if (path.startsWith("/auth/login") || path.startsWith("/auth/oauth-link")) {
    console.log("🔁 AUTH passthrough →", targetUrl);

    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    const data = await res.text();
    console.log("⬅️ Backend auth status:", res.status);
    return new NextResponse(data, { status: res.status });
  }

  // ✅ GraphQL / dokument → JSON
  headers.set("content-type", "application/json");

  console.log("➡️ Proxying request to:", targetUrl);

  const res = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
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
