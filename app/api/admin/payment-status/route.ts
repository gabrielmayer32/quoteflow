import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Force Node.js runtime for Prisma compatibility
export const runtime = "nodejs";

const updatePaymentSchema = z.object({
  businessId: z.string(),
  paymentStatus: z.enum(["PAID", "UNPAID"]),
});

// PATCH - Update payment status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = updatePaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { businessId, paymentStatus } = validation.data;

    const business = await prisma.business.update({
      where: { id: businessId },
      data: { paymentStatus },
      select: {
        id: true,
        email: true,
        name: true,
        paymentStatus: true,
      },
    });

    return NextResponse.json({
      success: true,
      business,
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    return NextResponse.json(
      { error: "Failed to update payment status" },
      { status: 500 }
    );
  }
}

// GET - List all businesses with their payment status
export async function GET() {
  try {
    const businesses = await prisma.business.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        paymentStatus: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      businesses,
    });
  } catch (error) {
    console.error("Get businesses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch businesses" },
      { status: 500 }
    );
  }
}
