// app/api/login/route.ts

import { NextResponse } from "next/server";
import { demoUsers } from "./demoUsers";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  const user = demoUsers.find((u) => u.email === email && u.password === password);
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }

  const res = NextResponse.json({ message: "Logged in successfully" });
  res.cookies.set("userId", user.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}

