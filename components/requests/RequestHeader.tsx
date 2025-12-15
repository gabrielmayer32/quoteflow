import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Request {
  id: string;
  status: string;
  clientName: string;
  createdAt: Date;
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

interface RequestHeaderProps {
  request: Request;
}

export function RequestHeader({ request }: RequestHeaderProps) {
  const config = statusConfig[request.status as keyof typeof statusConfig];

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-start justify-between mb-4">
        <Link href="/requests">
          <Button variant="ghost" size="sm" className="mb-2">
            ← Back to Requests
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {request.clientName}
          </h1>
          <p className="text-sm text-gray-500">
            Submitted {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
          </p>
        </div>
        <Badge variant="outline" className={`${config.color} text-base px-4 py-2 w-fit`}>
          {config.label}
        </Badge>
      </div>
    </div>
  );
}
