import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { QuotePDF } from "@/lib/pdf/quote-pdf";
import { getSignedR2Url } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id: quoteId } = await params;
    const { searchParams } = request.nextUrl;
    const token = searchParams.get("token");

    // Fetch quote with related data
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        request: {
          select: {
            clientName: true,
            clientPhone: true,
            clientAddress: true,
            problemDesc: true,
            businessId: true,
          },
        },
        business: {
          select: {
            name: true,
            phone: true,
            address: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: "Quote not found" },
        { status: 404 }
      );
    }

    // Verify token for public access
    if (token && token !== quote.approvalToken) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 403 }
      );
    }

    // Resolve logo URL if it's an R2 reference
    let resolvedLogoUrl = quote.business.logoUrl;
    if (resolvedLogoUrl?.startsWith("r2:")) {
      const key = resolvedLogoUrl.slice(3);
      resolvedLogoUrl = await getSignedR2Url(key, 60 * 30); // 30 minutes for PDF generation
    }

    // Parse line items
    const lineItems = Array.isArray(quote.lineItems)
      ? quote.lineItems
      : [];

    // Generate PDF
    const pdfDoc = QuotePDF({
      quote: {
        id: quote.id,
        total: parseFloat(quote.total.toString()),
        createdAt: quote.createdAt,
        validUntil: quote.validUntil,
        notes: quote.notes,
        lineItems: lineItems.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unitPrice),
          total: parseFloat(item.total),
        })),
      },
      business: {
        name: quote.business.name,
        phone: quote.business.phone,
        address: quote.business.address,
        logoUrl: resolvedLogoUrl,
      },
      request: {
        clientName: quote.request.clientName,
        clientPhone: quote.request.clientPhone,
        clientAddress: quote.request.clientAddress,
        problemDesc: quote.request.problemDesc,
      },
    });

    const pdfBuffer = await renderToBuffer(pdfDoc);

    // Return PDF
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="quote-${quote.id.slice(0, 8)}.pdf"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
