import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function IntakeSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">✓</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Request Submitted Successfully!
          </h1>

          {/* Message */}
          <div className="space-y-3 text-gray-600 mb-8">
            <p>
              Thank you for submitting your service request. We've received all the details
              and will review them shortly.
            </p>
            <p className="font-medium text-gray-900">
              You'll receive a quote via WhatsApp or phone call within 24 hours.
            </p>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
            <h2 className="font-semibold text-gray-900 mb-2">What happens next?</h2>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>We review your request and photos</li>
              <li>We prepare a detailed quote</li>
              <li>You receive the quote via WhatsApp</li>
              <li>You can approve or discuss the quote</li>
              <li>We schedule the service at your convenience</li>
            </ol>
          </div>

          {/* Close Button */}
          <Button
            asChild
            variant="outline"
            className="w-full"
          >
            <Link href="/">Close</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
