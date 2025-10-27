import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import NavbarClient from "./navbar";

export default async function NavbarServer() {
  const session = await getServerSession(authOptions);
  return <NavbarClient user={session?.user} />;
}
