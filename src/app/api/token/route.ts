import { NextRequest } from "next/server";
import { sessionCookieName } from "../../../../server/lib/auth.js";
import { findActiveSession, issueAccessToken } from "../../../../server/services/auth.service.js";
import { jsonResponse, errorResponse, verifyCsrf } from "@/lib/api-handler";

export async function POST(req: NextRequest) {
  const csrfErr = verifyCsrf(req);
  if (csrfErr) return csrfErr;

  try {
    const token = req.cookies.get(sessionCookieName())?.value;
    if (!token) {
      return jsonResponse({ code: "SESSION_REQUIRED", message: "Authentication is required." }, 401);
    }

    const session = await findActiveSession(token);
    if (!session) {
      return jsonResponse({ code: "SESSION_REQUIRED", message: "Authentication is required." }, 401);
    }

    const result = await issueAccessToken(session);
    return jsonResponse(result, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
