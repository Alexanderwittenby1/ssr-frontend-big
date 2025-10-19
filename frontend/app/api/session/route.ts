import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  
  const cookie = req.headers.get("cookie") || "";
  
  const envMode = process.env.NODE_ENV;
  
  const isProd = envMode === "production";

  const backend_url = isProd
    ? `${process.env.BACKEND_URL_LIVE}`
    : "http://localhost:5025";

  
  
  const resp = await fetch(`${backend_url}/auth/session`, {
    headers: { cookie },
    credentials: "include", 
  });

  

  const data = await resp.json();

  
  return NextResponse.json(data, { status: resp.status });
}




// 1. jag försöker 