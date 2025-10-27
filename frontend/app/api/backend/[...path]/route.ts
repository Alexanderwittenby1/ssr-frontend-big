import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { SignJWT } from "jose";

const BE =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_BACKEND_URL_PROD!
    : process.env.NEXT_PUBLIC_BACKEND_URL_LOCAL!;

export async function handler(req: NextRequest) {
  // 1) Läs NextAuth-JWT (dekoderat payload) från cookies
  const payload = await getToken({ req }); // null om utloggad

  // 2) Förbered headers till backend
  const headers = new Headers({ "content-type": "application/json" });

  // 3) Om inloggad → minta en HS256-JWT till backend
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

  // 4) Proxy:a vidare
  const url = new URL(req.url);
  const path = url.pathname.replace("/api/backend", "");
  const res = await fetch(BE + path, {
    method: req.method,
    body: req.method !== "GET" ? await req.text() : undefined,
    headers,
  });

  const data = await res.text();
  return new NextResponse(data, { status: res.status });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
