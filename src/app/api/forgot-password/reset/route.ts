import { NextRequest } from "next/server";
import { z } from "zod";
import * as forgotPasswordService from "../../../../../server/services/forgot-password.service.js";
import { registerSchema } from "../../../../../server/lib/validation.js";
import { jsonResponse, errorResponse, verifyCsrf } from "@/lib/api-handler";

const passwordPolicy = registerSchema.shape.password;

const resetPasswordSchema = z.object({
  challengeId: z.string().cuid(),
  otp: z.string().length(6, "Code must be exactly 6 digits."),
  newPassword: passwordPolicy,
});

export async function POST(req: NextRequest) {
  const csrfErr = verifyCsrf(req);
  if (csrfErr) return csrfErr;

  try {
    const body = await req.json();
    const data = resetPasswordSchema.parse(body);
    const result = await forgotPasswordService.resetPassword(
      data.challengeId,
      data.otp,
      data.newPassword
    );
    return jsonResponse(result, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
