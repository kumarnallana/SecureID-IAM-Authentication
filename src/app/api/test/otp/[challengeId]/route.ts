import { NextRequest } from "next/server";
import { prisma } from "../../../../../../server/lib/prisma.js";
import { env } from "../../../../../../server/lib/env.js";
import { revealTestOtp } from "../../../../../../server/lib/test-otp.js";
import { jsonResponse, errorResponse } from "@/lib/api-handler";

export async function GET(
  req: NextRequest,
  { params }: { params: { challengeId: string } }
) {
  try {
    if (!env.ENABLE_TEST_OTP) {
      return jsonResponse({ code: "NOT_FOUND", message: "Endpoint disabled." }, 404);
    }

    const { searchParams } = new URL(req.url);
    const accessKey = req.headers.get("x-test-key") || searchParams.get("key");

    if (accessKey !== env.TEST_OTP_ACCESS_KEY) {
      return jsonResponse({ code: "FORBIDDEN", message: "Invalid test access key." }, 403);
    }

    const challenge = await prisma.otpChallenge.findUnique({
      where: { id: params.challengeId },
      select: { testOtpEncrypted: true, expiresAt: true, consumedAt: true },
    });

    if (!challenge || !challenge.testOtpEncrypted) {
      return jsonResponse({ code: "NOT_FOUND", message: "Challenge not found." }, 404);
    }

    const otp = revealTestOtp(challenge.testOtpEncrypted);
    return jsonResponse({
      challengeId: params.challengeId,
      otp,
      expiresAt: challenge.expiresAt,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
