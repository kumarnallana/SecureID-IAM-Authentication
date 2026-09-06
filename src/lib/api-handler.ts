import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import crypto from "node:crypto";
import { env } from "../../server/lib/env.js";

const CSRF_COOKIE = "secureid.csrf";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function safeEqual(left: string | undefined | null, right: string | undefined | null): boolean {
  if (!left || !right) return false;
  const leftBuf = Buffer.from(left);
  const rightBuf = Buffer.from(right);
  return leftBuf.length === rightBuf.length && crypto.timingSafeEqual(leftBuf, rightBuf);
}

export function jsonResponse(data: any, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      ...headers,
    },
  });
}

export function errorResponse(error: any) {
  if (error instanceof ZodError) {
    const details: Record<string, string> = {};
    for (const issue of error.issues) {
      const field = (issue.path[0] as string) || "form";
      details[field] = issue.message;
    }
    return jsonResponse(
      {
        code: "VALIDATION_ERROR",
        message: error.issues[0]?.message || "Validation error.",
        details,
      },
      400
    );
  }

  const status = error.statusCode || error.status || 500;
  const message = status === 500 ? "Internal server error." : error.message;

  if (status === 500) {
    console.error("[API_ERROR]", error);
  }

  return jsonResponse(
    {
      code: error.code || (status === 500 ? "INTERNAL_ERROR" : "REQUEST_FAILED"),
      message,
      details: error.details,
    },
    status
  );
}

export function verifyCsrf(req: NextRequest): NextResponse | null {
  if (SAFE_METHODS.has(req.method)) return null;

  const cookieToken = req.cookies.get(CSRF_COOKIE)?.value;
  const headerToken = req.headers.get("x-csrf-token");

  // Optional: In dev/testing, allow requests if CSRF is disabled or matched
  if (!safeEqual(cookieToken, headerToken)) {
    return jsonResponse(
      {
        code: "CSRF_VALIDATION_FAILED",
        message: "CSRF validation failed. Refresh and try again.",
      },
      403
    );
  }

  return null;
}
