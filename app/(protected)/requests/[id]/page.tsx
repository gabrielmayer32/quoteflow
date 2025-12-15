import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RequestHeader } from "@/components/requests/RequestHeader";
import { RequestDetails } from "@/components/requests/RequestDetails";
import { MediaGallery } from "@/components/requests/MediaGallery";
import { QuotesList } from "@/components/requests/QuotesList";
import { RequestActions } from "@/components/requests/RequestActions";

export const runtime = "nodejs";

interface RequestDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const session = await auth();
  const businessId = session!.user.id;
  const { id } = await params;

  // Fetch request with quotes
  const request = await prisma.request.findFirst({
    where: {
      id,
      businessId, // Ensure user can only see their own requests
    },
    include: {
      quotes: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
          lineItems: true,
          notes: true,
        },
      },
    },
  });

  if (!request) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header with Status */}
      <RequestHeader request={request} />

      {/* Client Details */}
      <RequestDetails request={request} />

      {/* Media Gallery */}
      {request.mediaUrls.length > 0 && (
        // <MediaGallery mediaUrls={request.mediaUrls} />
        <MediaGallery mediaRefs={request.mediaUrls} />

      )}

      {/* Quotes Section */}
      <QuotesList requestId={request.id} quotes={request.quotes} status={request.status} />

      {/* Action Buttons */}
      <RequestActions requestId={request.id} currentStatus={request.status} />
    </div>
  );
}
