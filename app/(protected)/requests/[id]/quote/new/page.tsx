import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { QuoteBuilder } from "@/components/quotes/QuoteBuilder";

export const runtime = "nodejs";

interface NewQuotePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NewQuotePage({ params }: NewQuotePageProps) {
  const session = await auth();
  const businessId = session!.user.id;
  const { id: requestId } = await params;

  // Fetch request details
  const request = await prisma.request.findFirst({
    where: {
      id: requestId,
      businessId,
    },
    select: {
      id: true,
      clientName: true,
      clientPhone: true,
      clientAddress: true,
      problemDesc: true,
      status: true,
    },
  });

  if (!request) {
    notFound();
  }

  // Prevent quote creation for certain statuses
  if (["APPROVED", "REJECTED", "SCHEDULED", "COMPLETED"].includes(request.status)) {
    redirect(`/requests/${requestId}`);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Quote</h1>
        <p className="text-gray-600">
          For: <span className="font-medium">{request.clientName}</span>
        </p>
      </div>

      {/* Quote Builder */}
      <QuoteBuilder
        requestId={request.id}
        businessId={businessId}
        clientName={request.clientName}
      />
    </div>
  );
}
