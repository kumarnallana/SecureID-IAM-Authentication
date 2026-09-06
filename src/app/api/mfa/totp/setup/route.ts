import { NextRequest } from "next/server";
import { totpSetupSchema } from "../../../../../../server/lib/validation.js";
import { selectMfaMethod } from "../../../../../../server/services/mfa.service.js";
import { jsonResponse, errorResponse, verifyCsrf } from "@/lib/api-handler";

export async function POST(req: NextRequest) {
  const csrfErr = verifyCsrf(req);
  if (csrfErr) return csrfErr;

  try {
    const body = await req.json();
    const data = totpSetupSchema.parse(body);
    const result = await selectMfaMethod({ userId: data.userId, method: "AUTHENTICATOR" });
    return jsonResponse(result, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
