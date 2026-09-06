import { NextRequest } from "next/server";
import { mfaSelectSchema } from "../../../../../server/lib/validation.js";
import { selectMfaMethod } from "../../../../../server/services/mfa.service.js";
import { jsonResponse, errorResponse, verifyCsrf } from "@/lib/api-handler";

export async function POST(req: NextRequest) {
  const csrfErr = verifyCsrf(req);
  if (csrfErr) return csrfErr;

  try {
    const body = await req.json();
    const data = mfaSelectSchema.parse(body);
    const result = await selectMfaMethod(data);
    const statusCode = data.method === "AUTHENTICATOR" ? 200 : 201;
    return jsonResponse(result, statusCode);
  } catch (error) {
    return errorResponse(error);
  }
}
