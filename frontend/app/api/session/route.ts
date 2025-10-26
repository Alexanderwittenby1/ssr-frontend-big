import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const kaka = await cookies();
  const crf_cookie = kaka.get("__Host-csrf_access_token");
  

  console.log("CRF Cookie:", crf_cookie);
  console.log("Kaka:", kaka);

  const cookie = req.headers.get("cookie") || "";
  
  
  const envMode = process.env.NODE_ENV;
  
  const isProd = envMode === "production";

  const backend_url = isProd
    ? `${process.env.BACKEND_URL_LIVE}` 
    : "http://localhost:5025";

  
  const resp = await fetch(`${backend_url}/auth/session`, {
    headers: { Cookie: `${crf_cookie}` },
    credentials: "include", 
  });

  const data = await resp.json();

  console.log("Efter jag blev körd: ",  data)
  
  return NextResponse.json(data, { status: resp.status });
}




// 1. jag försöker 