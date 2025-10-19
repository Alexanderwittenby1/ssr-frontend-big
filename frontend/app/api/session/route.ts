import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Hämta bara cookie-headern
  const cookie = req.headers.get("cookie") || "";
  console.log("The cookie:", cookie)
  const envMode = process.env.ENV_MODE;
  console.log("envMODE",envMode)
  const isProd = envMode === "prod";

  const backend_url = isProd
    ? `${process.env.BACKEND_URL_LIVE}`
    : "http://localhost:5025";
  
  const resp = await fetch(`${backend_url}/auth/session`, {
    headers: { cookie },
    credentials: "include", 
  });

  console.log("FCKN RESP", resp)

  const data = await resp.json();

  console.log("EN TILL", data)
  return NextResponse.json(data, { status: resp.status });
}




// 1. jag försöker 