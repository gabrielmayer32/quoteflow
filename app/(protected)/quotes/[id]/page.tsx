import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DownloadPDFButton } from "@/components/quotes/DownloadPDFButton";
import { QuoteActions } from "@/components/quotes/QuoteActions";

export const runtime = "nodejs";

interface QuoteDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const quoteStatusConfig = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-800 border-green-200" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800 border-red-200" },
};

export default async function QuoteDetailPage({ params }: QuoteDetailPageProps) {
  const session = await auth();
  const businessId = session!.user.id;
  const { id } = await params;

  // Fetch quote with related data
  const quote = await prisma.quote.findFirst({
    where: {
      id,
      businessId, // Ensure user can only see their own quotes
    },
    include: {
      request: {
        select: {
          id: true,
          clientName: true,
          clientPhone: true,
          clientAddress: true,
          problemDesc: true,
          status: true,
        },
      },
    },
  });

  if (!quote) {
    notFound();
  }

  const config = quoteStatusConfig[quote.status as keyof typeof quoteStatusConfig];
  const lineItems = Array.isArray(quote.lineItems) ? quote.lineItems : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">Quote Details</h1>
              <Badge variant="outline" className={config.color}>
                {config.label}
              </Badge>
            </div>
            <p className="text-gray-600">
              Created {format(new Date(quote.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <Link href={`/requests/${quote.request.id}`}>
            <Button variant="outline" size="sm">
              ← Back to Request
            </Button>
          </Link>
        </div>

        {/* Status Messages */}
        {quote.status === "APPROVED" && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
            <p className="text-green-800 font-medium">✓ This quote has been approved by the client</p>
            <p className="text-green-700 text-sm mt-1">
              Updated {format(new Date(quote.updatedAt), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        )}

        {quote.status === "REJECTED" && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="text-red-800 font-medium">✗ This quote has been rejected by the client</p>
            {quote.rejectionNote && (
              <p className="text-red-700 text-sm mt-2">
                <span className="font-medium">Reason:</span> {quote.rejectionNote}
              </p>
            )}
            <p className="text-red-700 text-sm mt-1">
              Updated {format(new Date(quote.updatedAt), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        )}
      </div>

      {/* Client Information */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Name</p>
            <p className="text-gray-900 font-medium">{quote.request.clientName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Phone</p>
            <p className="text-gray-900 font-medium">{quote.request.clientPhone}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500 mb-1">Location</p>
            <p className="text-gray-900 font-medium">{quote.request.clientAddress}</p>
          </div>
        </div>
      </div>

      {/* Problem Description */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Service Required</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{quote.request.problemDesc}</p>
      </div>

      {/* Quote Details */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quote Breakdown</h2>

        {/* Line Items Table */}
        <div className="border rounded-lg overflow-hidden mb-4">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">
                  Description
                </th>
                <th className="text-right p-3 text-sm font-semibold text-gray-700 w-20">
                  Qty
                </th>
                <th className="text-right p-3 text-sm font-semibold text-gray-700 w-28">
                  Unit Price
                </th>
                <th className="text-right p-3 text-sm font-semibold text-gray-700 w-28">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {lineItems.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="p-3 text-gray-900">{item.description}</td>
                  <td className="p-3 text-right text-gray-700">{item.quantity}</td>
                  <td className="p-3 text-right text-gray-700">
                    Rs {item.unitPrice.toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-medium text-gray-900">
                    Rs {item.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2">
              <tr>
                <td colSpan={3} className="p-3 text-right font-semibold text-gray-900">
                  Grand Total:
                </td>
                <td className="p-3 text-right text-xl font-bold text-blue-600">
                  Rs {parseFloat(quote.total.toString()).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Validity Date */}
        {quote.validUntil && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Valid Until:</span>{" "}
              {format(new Date(quote.validUntil), "MMMM d, yyyy")}
            </p>
          </div>
        )}

        {/* Notes */}
        {quote.notes && (
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-2">Additional Notes</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg border p-4 sm:p-6 overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="space-y-4 w-full">
          {/* Download PDF */}
          <div className="w-full">
            <DownloadPDFButton quoteId={quote.id} variant="default" />
          </div>

          {/* Other Actions */}
          <QuoteActions
            quoteId={quote.id}
            approvalToken={quote.approvalToken}
            status={quote.status}
            clientName={quote.request.clientName}
            clientPhone={quote.request.clientPhone}
          />
        </div>
      </div>
    </div>
  );
}
