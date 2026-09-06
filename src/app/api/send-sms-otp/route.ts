import { NextRequest } from "next/server";
import { sendOtpSchema } from "../../../../server/lib/validation.js";
import { sendRegistrationSmsOtp } from "../../../../server/services/registration.service.js";
import { jsonResponse, errorResponse, verifyCsrf } from "@/lib/api-handler";

export async function POST(req: NextRequest) {
  const csrfErr = verifyCsrf(req);
  if (csrfErr) return csrfErr;

  try {
    const body = await req.json();
    const data = sendOtpSchema.parse(body);
    const result = await sendRegistrationSmsOtp(data);
    return jsonResponse(result, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
