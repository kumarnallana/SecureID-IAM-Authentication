import { NextRequest } from "next/server";
import { sessionCookieName } from "../../../../server/lib/auth.js";
import { findActiveSession, touchSession, publicUser } from "../../../../server/services/auth.service.js";
import { jsonResponse, errorResponse } from "@/lib/api-handler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(sessionCookieName())?.value;
    if (!token) {
      return jsonResponse(
        { code: "SESSION_REQUIRED", message: "Authentication is required." },
        401
      );
    }

    const session = await findActiveSession(token);
    if (!session) {
      const res = jsonResponse(
        { code: "SESSION_REQUIRED", message: "Authentication is required." },
        401
      );
      res.cookies.delete(sessionCookieName());
      return res;
    }

    await touchSession(session.id);

    return jsonResponse({
      authenticated: true,
      user: publicUser(session.user),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
