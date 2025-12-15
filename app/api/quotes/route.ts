import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";

export const runtime = "nodejs";

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive("Quantity must be positive"),
  unitPrice: z.number().nonnegative("Unit price must be non-negative"),
  total: z.number().nonnegative("Total must be non-negative"),
});

const quoteSchema = z.object({
  requestId: z.string().cuid(),
  businessId: z.string().cuid(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  notes: z.string().nullable().optional(),
  validUntil: z.string().nullable().optional(),
  total: z.number().positive("Total must be positive"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = quoteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { requestId, businessId, lineItems, notes, validUntil, total } = validation.data;

    // Verify business ownership
    if (businessId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Verify request exists and belongs to business
    const existingRequest = await prisma.request.findFirst({
      where: {
        id: requestId,
        businessId,
      },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // Create quote
    const quote = await prisma.quote.create({
      data: {
        requestId,
        businessId,
        lineItems,
        notes: notes || null,
        validUntil: validUntil ? new Date(validUntil) : null,
        total: new Decimal(total),
        status: "PENDING",
      },
    });

    // Update request status to QUOTED
    await prisma.request.update({
      where: { id: requestId },
      data: { status: "QUOTED" },
    });

    return NextResponse.json({
      success: true,
      quoteId: quote.id,
      approvalToken: quote.approvalToken,
    });
  } catch (error) {
    console.error("Quote creation error:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the quote" },
      { status: 500 }
    );
  }
}
