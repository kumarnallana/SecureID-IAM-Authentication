import { NextRequest } from "next/server";
import { validateBearerToken } from "../../../../server/services/auth.service.js";
import { jsonResponse, errorResponse } from "@/lib/api-handler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const match = authHeader.match(/^Bearer\s+([^\s]+)$/i);
    if (!match) {
      return jsonResponse({ code: "BEARER_TOKEN_REQUIRED", message: "A bearer token is required." }, 401);
    }

    const bearerAuth = await validateBearerToken(match[1]);

    return jsonResponse({
      message: "Protected SecureID API access granted.",
      user: bearerAuth.user,
      token: {
        issuer: bearerAuth.claims.iss,
        audience: bearerAuth.claims.aud,
        expiresAt: new Date(bearerAuth.claims.exp * 1000).toISOString(),
        jti: bearerAuth.claims.jti,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
