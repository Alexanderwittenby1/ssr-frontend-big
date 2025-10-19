
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {


  const envMode = process.env.NODE_ENV;
  console.log("WTF envMODE",envMode)
  const isProd = envMode === "production";

  const backend_url = isProd
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL_PROD}`
    : "http://localhost:5025";

  const signoutUrl = backend_url;
  console.log("backendURL", signoutUrl)
  
  
  const res = await fetch(`${backend_url}/auth/signout`, {
    method: "POST",
    headers: {
      cookie: req.headers.get("cookie") || "",
    },
    credentials: "include",
  });

  const data = await res.text(); 
  return NextResponse.json({ success: res.ok, data });
}
