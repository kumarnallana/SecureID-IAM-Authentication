import { NextRequest } from "next/server";
import { loginChallengeSchema } from "../../../../../server/lib/validation.js";
import { startLoginChallenge } from "../../../../../server/services/auth.service.js";
import { jsonResponse, errorResponse, verifyCsrf } from "@/lib/api-handler";

export async function POST(req: NextRequest) {
  const csrfErr = verifyCsrf(req);
  if (csrfErr) return csrfErr;

  try {
    const body = await req.json();
    const data = loginChallengeSchema.parse(body);
    const result = await startLoginChallenge(data);
    return jsonResponse(result, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
