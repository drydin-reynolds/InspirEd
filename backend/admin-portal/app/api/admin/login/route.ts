import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: { email?: string; password?: string } = {};
  try {
    body = await req.json();
  } catch {
    // ignore; we'll handle missing fields below
  }

  const email = body.email ?? "";
  const password = body.password ?? "";

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Admin credentials not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local.",
      },
      { status: 500 }
    );
  }

  const isValid = email === adminEmail && password === adminPassword;

  if (!isValid) {
    return NextResponse.json(
      { ok: false, error: "Invalid email or password." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true } as const);
  res.cookies.set("admin_session", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}

