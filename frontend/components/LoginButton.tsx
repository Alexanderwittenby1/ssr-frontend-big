"use client";
import Link from "next/link";

export default function LoginButton() {
  return (
    <Link
      href="/auth/signin"
      className="bg-blue-500 text-white px-4 py-2 rounded-2xl hover:bg-blue-600 transition"
    >
      Logga in
    </Link>
  );
}
