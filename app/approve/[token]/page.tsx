import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ApprovalForm } from "@/components/approval/ApprovalForm";
import { DownloadPDFButton } from "@/components/quotes/DownloadPDFButton";
import { format } from "date-fns";

export const runtime = "nodejs";

interface ApprovalPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function ApprovalPage({ params }: ApprovalPageProps) {
  const { token } = await params;

  // Fetch quote with related data
  const quote = await prisma.quote.findUnique({
    where: { approvalToken: token },
    include: {
      request: {
        select: {
          clientName: true,
          clientPhone: true,
          clientAddress: true,
          problemDesc: true,
        },
      },
      business: {
        select: {
          name: true,
          phone: true,
          logoUrl: true,
        },
      },
    },
  });

  if (!quote) {
    notFound();
  }

  // Check if already processed
  const isProcessed = quote.status !== "PENDING";

  const lineItems = Array.isArray(quote.lineItems) ? quote.lineItems : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            {quote.business.logoUrl ? (
              <img
                src={quote.business.logoUrl}
                alt={quote.business.name}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {quote.business.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{quote.business.name}</h1>
              <p className="text-sm text-gray-600">Service Quote</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Container */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm border p-6 md:p-8 space-y-6">
          {/* Status Badge */}
          {isProcessed && (
            <div
              className={`p-4 rounded-lg border-2 ${
                quote.status === "APPROVED"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <p
                className={`text-center font-semibold ${
                  quote.status === "APPROVED" ? "text-green-800" : "text-red-800"
                }`}
              >
                {quote.status === "APPROVED"
                  ? "✓ This quote has been approved"
                  : "✗ This quote has been rejected"}
              </p>
            </div>
          )}

          {/* Client Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quote for Service Request</h2>
            <div className="text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Client:</span> {quote.request.clientName}
              </p>
              <p>
                <span className="font-medium">Location:</span> {quote.request.clientAddress}
              </p>
              {quote.validUntil && (
                <p>
                  <span className="font-medium">Valid Until:</span>{" "}
                  {format(new Date(quote.validUntil), "MMMM d, yyyy")}
                </p>
              )}
            </div>
          </div>

          {/* Problem Description */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-2">Service Required:</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{quote.request.problemDesc}</p>
          </div>

          {/* Line Items */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Quote Breakdown:</h3>
            <div className="border rounded-lg overflow-hidden">
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
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Additional Notes:</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}

          {/* Download PDF Button */}
          <div className="flex justify-center pt-4 border-t">
            <DownloadPDFButton quoteId={quote.id} token={token} variant="outline" />
          </div>

          {/* Approval Form or Contact Info */}
          {!isProcessed ? (
            <ApprovalForm quoteId={quote.id} token={token} />
          ) : (
            <div className="text-center pt-4 border-t">
              <p className="text-gray-600 mb-2">Need to discuss this quote?</p>
              <a
                href={`tel:${quote.business.phone}`}
                className="text-blue-600 hover:underline font-medium"
              >
                Contact us: {quote.business.phone}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
