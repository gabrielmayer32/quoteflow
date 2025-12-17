import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL(`/verify-email?status=error&message=${encodeURIComponent("Verification token is required")}`, request.url)
      );
    }

    const business = await prisma.business.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!business) {
      return NextResponse.redirect(
        new URL(`/verify-email?status=error&message=${encodeURIComponent("Invalid verification token")}`, request.url)
      );
    }

    if (business.emailVerified) {
      return NextResponse.redirect(
        new URL(`/verify-email?status=already-verified&email=${encodeURIComponent(business.email)}`, request.url)
      );
    }

    if (
      business.emailVerificationTokenExpiry &&
      business.emailVerificationTokenExpiry < new Date()
    ) {
      return NextResponse.redirect(
        new URL(`/verify-email?status=expired&email=${encodeURIComponent(business.email)}`, request.url)
      );
    }

    await prisma.business.update({
      where: { id: business.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpiry: null,
      },
    });

    // Redirect to verification page with auto-login flag
    return NextResponse.redirect(
      new URL(`/verify-email?status=success&email=${encodeURIComponent(business.email)}&autoLogin=true`, request.url)
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      new URL(`/verify-email?status=error&message=${encodeURIComponent("An error occurred during email verification")}`, request.url)
    );
  }
}
