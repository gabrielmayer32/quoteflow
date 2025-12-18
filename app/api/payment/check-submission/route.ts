import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Force Node.js runtime for Prisma compatibility
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const businessId = session.user.id;

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { paymentSubmittedAt: true },
    });

    return NextResponse.json({
      submitted: !!business?.paymentSubmittedAt,
      submittedAt: business?.paymentSubmittedAt,
    });
  } catch (error) {
    console.error("Check payment submission error:", error);
    return NextResponse.json(
      { error: "Failed to check payment submission" },
      { status: 500 }
    );
  }
}
