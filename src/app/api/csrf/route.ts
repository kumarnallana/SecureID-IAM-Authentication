import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { jsonResponse } from "@/lib/api-handler";

const CSRF_COOKIE = "secureid.csrf";

export async function GET(req: NextRequest) {
  const token = crypto.randomBytes(32).toString("base64url");
  const res = jsonResponse({ csrfToken: token });

  res.cookies.set({
    name: CSRF_COOKIE,
    value: token,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res;
}
