import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPaymentNotification } from "@/lib/email";

// Force Node.js runtime for Prisma compatibility
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const businessId = session.user.id;

    // Update business with payment submission timestamp
    const business = await prisma.business.update({
      where: { id: businessId },
      data: { paymentSubmittedAt: new Date() },
      select: {
        id: true,
        email: true,
        name: true,
        paymentSubmittedAt: true,
      },
    });

    // Send email notification to admin
    try {
      await sendPaymentNotification({
        businessName: business.name,
        businessEmail: business.email,
        submittedAt: business.paymentSubmittedAt!,
      });
    } catch (emailError) {
      console.error("Failed to send payment notification email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      submittedAt: business.paymentSubmittedAt,
    });
  } catch (error) {
    console.error("Payment submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit payment confirmation" },
      { status: 500 }
    );
  }
}
