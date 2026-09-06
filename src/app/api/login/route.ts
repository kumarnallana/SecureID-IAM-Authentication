import { NextRequest } from "next/server";
import { loginSchema } from "../../../../server/lib/validation.js";
import { beginLogin } from "../../../../server/services/auth.service.js";
import { jsonResponse, errorResponse, verifyCsrf } from "@/lib/api-handler";

export async function POST(req: NextRequest) {
  const csrfErr = verifyCsrf(req);
  if (csrfErr) return csrfErr;

  try {
    const body = await req.json();
    const data = loginSchema.parse(body);
    const result = await beginLogin(data);
    return jsonResponse(result, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
