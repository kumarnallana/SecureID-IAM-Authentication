import { NextRequest } from "next/server";
import { sessionCookieName } from "../../../../server/lib/auth.js";
import { findActiveSession, revokeSession } from "../../../../server/services/auth.service.js";
import { jsonResponse, errorResponse, verifyCsrf } from "@/lib/api-handler";

export async function POST(req: NextRequest) {
  const csrfErr = verifyCsrf(req);
  if (csrfErr) return csrfErr;

  try {
    const token = req.cookies.get(sessionCookieName())?.value;
    if (token) {
      const session = await findActiveSession(token);
      if (session) {
        await revokeSession(session.id);
      }
    }

    const res = jsonResponse({ loggedOut: true });
    res.cookies.delete(sessionCookieName());
    return res;
  } catch (error) {
    return errorResponse(error);
  }
}
