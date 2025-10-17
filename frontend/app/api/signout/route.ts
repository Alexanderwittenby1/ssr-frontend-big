// app/api/signout/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {


  const envMode = process.env.ENV_MODE;
  console.log("envMODE",envMode)
  const isProd = envMode === "prod";

  const backend_url = isProd
    ? `${process.env.BACKEND_URL_LIVE}`
    : "http://localhost:5025";
  
  
  const res = await fetch(`${backend_url}/auth/signout`, {
    method: "POST",
    headers: {
      cookie: req.headers.get("cookie") || "",
    },
    credentials: "include",
  });

  const data = await res.text(); // oftast bara "OK" eller liknande
  return NextResponse.json({ success: res.ok, data });
}
