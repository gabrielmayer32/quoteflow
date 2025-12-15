import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RequestsList } from "@/components/requests/RequestsList";
import { RequestFilters } from "@/components/requests/RequestFilters";

export const runtime = "nodejs";

interface RequestsPageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

export default async function RequestsPage({ searchParams }: RequestsPageProps) {
  const session = await auth();
  const businessId = session!.user.id;
  const { status } = await searchParams;

  // Build where clause based on filters
  const where: any = { businessId };
  if (status && status !== "ALL") {
    where.status = status;
  }

  // Fetch requests
  const requests = await prisma.request.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      clientName: true,
      clientPhone: true,
      clientAddress: true,
      problemDesc: true,
      mediaUrls: true,
      createdAt: true,
      _count: {
        select: { quotes: true },
      },
    },
  });

  // Get stats for badges
  const [newCount, reviewingCount, quotedCount, approvedCount] = await Promise.all([
    prisma.request.count({ where: { businessId, status: "NEW" } }),
    prisma.request.count({ where: { businessId, status: "REVIEWING" } }),
    prisma.request.count({ where: { businessId, status: "QUOTED" } }),
    prisma.request.count({ where: { businessId, status: "APPROVED" } }),
  ]);

  const stats = {
    NEW: newCount,
    REVIEWING: reviewingCount,
    QUOTED: quotedCount,
    APPROVED: approvedCount,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
        <p className="text-gray-600 mt-1">
          View and manage all client service requests
        </p>
      </div>

      {/* Filters */}
      <RequestFilters currentStatus={status} stats={stats} />

      {/* Requests List */}
      <RequestsList requests={requests} />
    </div>
  );
}
