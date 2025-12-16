import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendClientStatusUpdateEmail } from "@/lib/email";

export const runtime = "nodejs";

const approvalSchema = z.object({
  token: z.string().cuid(),
  action: z.enum(["approve", "reject"]),
  rejectionNote: z.string().optional(),
});

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id: quoteId } = await params;
    const body = await request.json();
    const validation = approvalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, action, rejectionNote } = validation.data;

    // Find quote by ID and token
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        approvalToken: token,
      },
      include: {
        request: {
          select: {
            id: true,
            clientName: true,
            clientEmail: true,
            clientPhone: true,
            clientAddress: true,
            problemDesc: true,
          },
        },
        business: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: "Quote not found or invalid token" },
        { status: 404 }
      );
    }

    // Check if already processed
    if (quote.status !== "PENDING") {
      return NextResponse.json(
        { error: `Quote has already been ${quote.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

    let message: string;

    if (action === "approve") {
      // Approve quote
      await prisma.$transaction([
        // Update quote status
        prisma.quote.update({
          where: { id: quoteId },
          data: { status: "APPROVED" },
        }),
        // Update request status
        prisma.request.update({
          where: { id: quote.requestId },
          data: { status: "APPROVED" },
        }),
      ]);
      message = "Quote approved successfully";
    } else {
      // Reject quote
      if (!rejectionNote) {
        return NextResponse.json(
          { error: "Rejection note is required" },
          { status: 400 }
        );
      }

      await prisma.$transaction([
        // Update quote status with rejection note
        prisma.quote.update({
          where: { id: quoteId },
          data: {
            status: "REJECTED",
            rejectionNote,
          },
        }),
        // Update request status
        prisma.request.update({
          where: { id: quote.requestId },
          data: { status: "REJECTED" },
        }),
      ]);
      message = "Quote rejected successfully";
    }

    await sendClientStatusUpdateEmail({
      business: {
        name: quote.business.name,
        email: quote.business.email,
      },
      request: {
        id: quote.request.id,
        clientName: quote.request.clientName,
        clientEmail: quote.request.clientEmail,
        clientPhone: quote.request.clientPhone,
        clientAddress: quote.request.clientAddress,
        problemDesc: quote.request.problemDesc,
      },
      newStatus,
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Quote approval error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the quote" },
      { status: 500 }
    );
  }
}
