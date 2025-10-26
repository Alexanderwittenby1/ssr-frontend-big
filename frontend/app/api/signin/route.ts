import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()

  const cookieName = process.env.NODE_ENV === "production"
  ? "__Host-authjs.session-token"
  : "authjs.session-token";
  console.log("Cookie från signin route:", cookieStore.get(cookieName)?.value);

  const token = cookieStore.get(cookieName)?.value || "";

  const envMode = process.env.NODE_ENV;
  const isProd = envMode === "production";

  const backend_url = isProd
    ? `${process.env.BACKEND_URL_LIVE}` 
    : "http://localhost:5025";

  
  const res = await fetch(`${backend_url}/auth/signin/github`, {
    headers: { Cookie: `${cookieName}=${token}`  },
    credentials: "include", 
  });

  console.log("Jag blev körd:")

  const data = await res.json();

  console.log("Efter jag blev körd: ",  data)
  
  return NextResponse.json(data, { status: res.status });
}




// 1. jag försöker 