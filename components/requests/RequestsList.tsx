import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Request {
  id: string;
  status: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  problemDesc: string;
  mediaUrls: string[];
  createdAt: Date;
  _count: {
    quotes: number;
  };
}

interface RequestsListProps {
  requests: Request[];
}

const statusConfig = {
  NEW: { label: "New", color: "bg-blue-100 text-blue-800 border-blue-200" },
  REVIEWING: { label: "Reviewing", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  QUOTED: { label: "Quoted", color: "bg-purple-100 text-purple-800 border-purple-200" },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-800 border-green-200" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800 border-red-200" },
  SCHEDULED: { label: "Scheduled", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  COMPLETED: { label: "Completed", color: "bg-gray-100 text-gray-800 border-gray-200" },
};

export function RequestsList({ requests }: RequestsListProps) {
  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No requests found
        </h3>
        <p className="text-gray-600">
          Service requests will appear here when clients submit through your intake form.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => {
        const config = statusConfig[request.status as keyof typeof statusConfig];

        return (
          <Link
            key={request.id}
            href={`/requests/${request.id}`}
            className="block bg-white rounded-lg border hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="p-4">
              {/* Header Row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {request.clientName}
                    </h3>
                    <Badge variant="outline" className={config.color}>
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    📞 {request.clientPhone}
                  </p>
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                  {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                </div>
              </div>

              {/* Location */}
              <div className="text-sm text-gray-600 mb-2">
                📍 {request.clientAddress}
              </div>

              {/* Problem Description */}
              <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                {request.problemDesc}
              </p>

              {/* Footer Row */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  {request.mediaUrls.length > 0 && (
                    <span className="flex items-center gap-1">
                      📎 {request.mediaUrls.length} file{request.mediaUrls.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {request._count.quotes > 0 && (
                    <span className="flex items-center gap-1">
                      💰 {request._count.quotes} quote{request._count.quotes !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <span className="text-blue-600 font-medium">
                  View Details →
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
