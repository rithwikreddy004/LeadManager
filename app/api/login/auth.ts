// app/api/login/auth.ts

import { cookies } from "next/headers";
import { demoUsers } from "./demoUsers";

export async function getCurrentUser() {
  const cookieStore = await cookies(); 
  const userId = cookieStore.get("userId")?.value;

  if (!userId) return null;

  const user = demoUsers.find((u) => u.id === userId) ?? null;
  return user;
}
