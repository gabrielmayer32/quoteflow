import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Decimal } from "@prisma/client/runtime/library";

interface Quote {
  id: string;
  total: Decimal | number;
  status: string;
  createdAt: Date;
  lineItems: any;
  notes: string | null;
}

interface QuotesListProps {
  requestId: string;
  quotes: Quote[];
  status: string;
}

const quoteStatusConfig = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-800 border-green-200" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800 border-red-200" },
};

export function QuotesList({ requestId, quotes, status }: QuotesListProps) {
  const canCreateQuote = !["APPROVED", "REJECTED", "SCHEDULED", "COMPLETED"].includes(status);

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Quotes ({quotes.length})
        </h2>
        {canCreateQuote && (
          <Link href={`/requests/${requestId}/quote/new`}>
            <Button size="sm">
              + Create Quote
            </Button>
          </Link>
        )}
      </div>

      {quotes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">💰</div>
          <p>No quotes created yet</p>
          {canCreateQuote && (
            <p className="text-sm mt-1">Create a quote to send to the client</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((quote) => {
            const config = quoteStatusConfig[quote.status as keyof typeof quoteStatusConfig];
            const lineItems = Array.isArray(quote.lineItems) ? quote.lineItems : [];

            return (
              <Link
                key={quote.id}
                href={`/quotes/${quote.id}`}
                className="block border rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        Rs {parseFloat(quote.total.toString()).toLocaleString()}
                      </span>
                      <Badge variant="outline" className={config.color}>
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      Created {formatDistanceToNow(new Date(quote.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {lineItems.length > 0 && (
                  <div className="text-sm text-gray-600 mb-2">
                    {lineItems.length} line item{lineItems.length !== 1 ? "s" : ""}
                  </div>
                )}

                {quote.notes && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {quote.notes}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
