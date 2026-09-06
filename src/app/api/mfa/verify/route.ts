import { NextRequest } from "next/server";
import { mfaVerifySchema } from "../../../../../server/lib/validation.js";
import { verifyMfa } from "../../../../../server/services/mfa.service.js";
import { jsonResponse, errorResponse, verifyCsrf } from "@/lib/api-handler";

export async function POST(req: NextRequest) {
  const csrfErr = verifyCsrf(req);
  if (csrfErr) return csrfErr;

  try {
    const body = await req.json();
    const data = mfaVerifySchema.parse(body);
    const result = await verifyMfa(data as any);
    return jsonResponse(
      { message: "MFA enabled. Registration complete.", ...result },
      200
    );
  } catch (error) {
    return errorResponse(error);
  }
}
