import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PaymentPendingPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // If payment is already done, redirect to dashboard
  if ((session.user as any).paymentStatus === "PAID") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Required
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            Your account is currently inactive. Please complete the payment to access the application.
          </p>

          {/* Payment Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h2 className="font-semibold text-blue-900 mb-2">Payment Instructions</h2>
            <p className="text-sm text-blue-800 mb-3">
              Please make a bank transfer to activate your account:
            </p>
            <div className="text-sm text-blue-900 space-y-1">
              <p><strong>Account Name:</strong> Your Company Name</p>
              <p><strong>Account Number:</strong> 123456789</p>
              <p><strong>Bank:</strong> Example Bank</p>
              <p><strong>Reference:</strong> {session.user.email}</p>
            </div>
            <p className="text-xs text-blue-700 mt-3">
              Please use your email address as the payment reference so we can identify your payment.
            </p>
          </div>

          {/* Contact Info */}
          <p className="text-sm text-gray-600 mb-6">
            After making the payment, please contact us to verify your account.
            We will activate your account within 24 hours of receiving your payment.
          </p>

          {/* Logout Button */}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
