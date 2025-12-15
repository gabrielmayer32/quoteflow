import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareLinkButton } from "@/components/shared/ShareLinkButton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

// Force Node.js runtime for Prisma compatibility
export const runtime = "nodejs";

export default async function DashboardPage() {
  const session = await auth();
  const businessId = session!.user.id;

  // Get stats
  const [newCount, quotedCount, approvedCount, recentRequests] =
    await Promise.all([
      prisma.request.count({
        where: { businessId, status: "NEW" },
      }),
      prisma.request.count({
        where: { businessId, status: "QUOTED" },
      }),
      prisma.request.count({
        where: { businessId, status: "APPROVED" },
      }),
      prisma.request.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          clientName: true,
          problemDesc: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

  const intakeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/intake/${businessId}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's what's happening
        </p>
      </div>

      {/* Share Link Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Your Intake Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-700">
            Share this link with customers to receive quote requests
          </p>
          <ShareLinkButton url={intakeUrl} />
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              New Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{newCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Quotes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {quotedCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {approvedCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No requests yet</p>
              <p className="text-sm mt-2">
                Share your intake link to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <Link
                  key={request.id}
                  href={`/requests/${request.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {request.clientName}
                        </span>
                        <StatusBadge status={request.status} />
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {request.problemDesc}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(request.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-800",
    REVIEWING: "bg-yellow-100 text-yellow-800",
    QUOTED: "bg-purple-100 text-purple-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    SCHEDULED: "bg-orange-100 text-orange-800",
    COMPLETED: "bg-gray-100 text-gray-800",
  };

  return (
    <Badge
      variant="secondary"
      className={variants[status] || "bg-gray-100 text-gray-800"}
    >
      {status}
    </Badge>
  );
}
