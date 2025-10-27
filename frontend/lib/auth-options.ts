import type { NextAuthOptions } from "next-auth";
import GitHub from "next-auth/providers/github";
import { SignJWT } from "jose";

console.log(
  "Auth options loaded, GitHub ID:",
  process.env.GITHUB_ID,
  "& GitHub Secret:",
  process.env.GITHUB_SECRET
);

export const authOptions: NextAuthOptions = {
 
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: { params: { scope: "read:user user:email" } },
    }),
  ],

  secret: process.env.AUTH_SECRET,
  
  session: {
    strategy: "jwt",
  },
  
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account && profile) {
        token.name = profile?.name ?? (profile as any).login ?? null;
        token.picture = (profile as any)?.avatar_url ?? null;
        token.sub = (profile as any).id?.toString() ?? null;

        let email = profile?.email ?? null;
        if (!email && account.provider === "github") {
          try {
            const res = await fetch("https://api.github.com/user/emails", {
              headers: {
                Authorization: `Bearer ${account.access_token}`,
                Accept: "application/vnd.github.v3+json",
              },
            });

            const emails = await res.json();
            const primary = emails.find((e: any) => e.primary) || emails[0];
            email = primary?.email || null;
          } catch (error) {
            console.error("⚠️ Could not fetch GitHub email:", error);
          }
        }

        
        token.email =
          email ??
          `${(profile as any)?.login}@users.noreply.github.com`;
      }

      token.signedJwt = await new SignJWT({
        sub: token.sub,
        name: token.name,
        picture: token.picture,
        email: token.email,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(new TextEncoder().encode(process.env.AUTH_SECRET!));

      return token;
    },

    async session({ session, token }) {
      if (!session.user) session.user = {} as any;

      (session.user as any).name = token?.name ?? null;
      (session.user as any).email = token?.email ?? null;
      (session.user as any).image = token?.picture ?? null;
      (session.user as any).id = token?.sub ?? null;

      (session as any).jwt = token?.signedJwt ?? null;

      return session;
    }
  },
};
