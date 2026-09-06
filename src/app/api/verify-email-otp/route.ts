import { NextRequest } from "next/server";
import { otpSchema } from "../../../../server/lib/validation.js";
import { verifyRegistrationEmailOtp } from "../../../../server/services/registration.service.js";
import { jsonResponse, errorResponse, verifyCsrf } from "@/lib/api-handler";

export async function POST(req: NextRequest) {
  const csrfErr = verifyCsrf(req);
  if (csrfErr) return csrfErr;

  try {
    const body = await req.json();
    const data = otpSchema.parse(body);
    const result = await verifyRegistrationEmailOtp(data);
    return jsonResponse(result, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
