import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        
        return !!token;
      },
    },
  }
);

// ✅ Vilka routes kräver auth?
export const config = {
  matcher: ["/dokument/:path*", "/dokument"],
};
