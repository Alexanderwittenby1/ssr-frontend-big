import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const cookie = req.headers.get("cookie") || "";
  
  const envMode = process.env.NODE_ENV;
  const isProd = envMode === "production";

  const backend_url = isProd
    ? `${process.env.BACKEND_URL_LIVE}` 
    : "http://localhost:5025";

  
  const res = await fetch(`${backend_url}/auth/session`, {
    headers: { cookie },
    credentials: "include", 
  });

  console.log("Jag blev körd:")

  const data = await res.json();

  console.log("Efter jag blev körd: ",  data)
  
  return NextResponse.json(data, { status: res.status });
}




// 1. jag försöker 