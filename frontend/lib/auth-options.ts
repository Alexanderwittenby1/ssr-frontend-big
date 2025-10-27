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
  trustHost: true,
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
        token.sub = profile?.id?.toString() ?? null;

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

        // ✅ email fallback om privat GitHub email
        token.email =
          email ??
          `${(profile as any)?.login}@users.noreply.github.com`;
      }

      // ✅ GENERATE A SIGNED JWT STRING FOR BACKEND
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
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.picture;
      session.user.id = token.sub;
      (session as any).jwt = token.signedJwt;

      return session;
    },
  },
};
