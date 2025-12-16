interface Request {
  clientName: string;
  clientEmail?: string | null;
  clientPhone: string;
  clientAddress: string;
  problemDesc: string;
}

interface RequestDetailsProps {
  request: Request;
}

export function RequestDetails({ request }: RequestDetailsProps) {
  return (
    <div className="bg-white rounded-lg border p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Request Details</h2>

      {/* Client Information */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Client Name</label>
          <p className="text-gray-900 mt-1">{request.clientName}</p>
        </div>
        {request.clientEmail && (
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-gray-900 mt-1">
              <a href={`mailto:${request.clientEmail}`} className="text-blue-600 hover:underline">
                {request.clientEmail}
              </a>
            </p>
          </div>
        )}
        <div>
          <label className="text-sm font-medium text-gray-500">Phone Number</label>
          <p className="text-gray-900 mt-1">
            <a href={`tel:${request.clientPhone}`} className="text-blue-600 hover:underline">
              {request.clientPhone}
            </a>
          </p>
        </div>
      </div>

      {/* Service Location */}
      <div>
        <label className="text-sm font-medium text-gray-500">Service Location</label>
        <p className="text-gray-900 mt-1">{request.clientAddress}</p>
      </div>

      {/* Problem Description */}
      <div>
        <label className="text-sm font-medium text-gray-500">Problem Description</label>
        <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
          <p className="text-gray-900 whitespace-pre-wrap">{request.problemDesc}</p>
        </div>
      </div>
    </div>
  );
}
