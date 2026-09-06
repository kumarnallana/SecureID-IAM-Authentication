import { NextRequest } from "next/server";
import { loginOtpSchema } from "../../../../server/lib/validation.js";
import { completeLogin } from "../../../../server/services/auth.service.js";
import { sessionCookieName, sessionCookieOptions } from "../../../../server/lib/auth.js";
import { jsonResponse, errorResponse, verifyCsrf } from "@/lib/api-handler";

export async function POST(req: NextRequest) {
  const csrfErr = verifyCsrf(req);
  if (csrfErr) return csrfErr;

  try {
    const body = await req.json();
    const data = loginOtpSchema.parse(body);
    const result = await completeLogin(data);

    const res = jsonResponse({
      authenticated: true,
      user: result.user,
      redirectTo: "/dashboard",
    });

    const cookieOptions = sessionCookieOptions({
      rememberMe: result.session.rememberMe,
      expiresAt: result.session.expiresAt,
    } as any);

    res.cookies.set({
      name: sessionCookieName(),
      value: result.sessionToken,
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite as any,
      path: cookieOptions.path,
      ...(cookieOptions.expires ? { expires: cookieOptions.expires } : {}),
    });

    return res;
  } catch (error) {
    return errorResponse(error);
  }
}
