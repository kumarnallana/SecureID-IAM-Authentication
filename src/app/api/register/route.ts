import { NextRequest } from "next/server";
import { registerSchema } from "../../../../server/lib/validation.js";
import { registerUser } from "../../../../server/services/registration.service.js";
import { jsonResponse, errorResponse, verifyCsrf } from "@/lib/api-handler";

export async function POST(req: NextRequest) {
  const csrfErr = verifyCsrf(req);
  if (csrfErr) return csrfErr;

  try {
    const body = await req.json();
    const data = registerSchema.parse(body);
    const result = await registerUser(data);

    return jsonResponse(
      {
        message: result.resumed
          ? "Registration resumed. A new email verification code was sent."
          : "Registration created. Verify your email OTP.",
        ...result,
      },
      result.resumed ? 200 : 201
    );
  } catch (error) {
    return errorResponse(error);
  }
}
