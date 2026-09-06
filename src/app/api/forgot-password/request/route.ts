import { NextRequest } from "next/server";
import { z } from "zod";
import * as forgotPasswordService from "../../../../../server/services/forgot-password.service.js";
import { jsonResponse, errorResponse, verifyCsrf } from "@/lib/api-handler";

const requestResetSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
});

export async function POST(req: NextRequest) {
  const csrfErr = verifyCsrf(req);
  if (csrfErr) return csrfErr;

  try {
    const body = await req.json();
    const data = requestResetSchema.parse(body);
    const result = await forgotPasswordService.requestPasswordReset(data.email);
    return jsonResponse(result, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
