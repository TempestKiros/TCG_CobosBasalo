// app/api/login/route.ts

import { NextResponse } from "next/server";
import { validateUser } from "@/lib/auth";

export async function POST(request: Request) {
  const { username, password } = await request.json();
  const user = validateUser(username, password);

  if (user) {
    const res = NextResponse.json({ success: true });
    res.cookies.set("session", username, {
      httpOnly: true,
      maxAge: 60 * 60,
    });
    return res;
  }

  return NextResponse.json(
    { success: false, message: "Credenciales inválidas" },
    { status: 401 }
  );
}
