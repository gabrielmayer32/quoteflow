"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentPendingPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const res = await fetch("/api/auth/session");
      const data = await res.json();

      if (!data || !data.user) {
        router.push("/login");
        return;
      }

      // Check fresh payment status from database
      const refreshRes = await fetch("/api/auth/refresh-session", { method: "POST" });
      const refreshData = await refreshRes.json();

      if (refreshData.paymentStatus === "PAID") {
        router.push("/dashboard");
        return;
      }

      setSession(data);
      await checkPaymentSubmission();
      setLoading(false);
    };

    checkSession();

    // Poll every 10 seconds to check if admin marked as paid
    const interval = setInterval(async () => {
      const refreshRes = await fetch("/api/auth/refresh-session", { method: "POST" });
      const refreshData = await refreshRes.json();

      if (refreshData.paymentStatus === "PAID") {
        router.push("/dashboard");
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [router]);

  const checkPaymentSubmission = async () => {
    try {
      const response = await fetch("/api/payment/check-submission");
      const data = await response.json();
      if (data.submitted) {
        setPaymentSubmitted(true);
      }
    } catch (error) {
      console.error("Failed to check payment submission:", error);
    }
  };

  const handlePaymentSubmitted = async () => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/payment/submit", {
        method: "POST",
      });

      if (response.ok) {
        setPaymentSubmitted(true);
      } else {
        alert("Failed to submit payment confirmation. Please try again.");
      }
    } catch (error) {
      console.error("Failed to submit payment:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
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
              <p><strong>Account Name:</strong> Flowquote.io </p>
              <p><strong>Account Number:</strong> 0004 4184 7048</p>
              <p><strong>Bank Name:</strong> The Mauritius Commercial Bank</p>
              <p><strong>Reference:</strong> {session.user.email}</p>
            </div>
            <p className="text-xs text-blue-700 mt-3">
              Please use your email address as the payment reference so we can identify your payment.
            </p>
          </div>

          {/* Payment Submitted Status or Button */}
          {paymentSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <svg className="h-5 w-5 text-green-600 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="font-semibold text-green-900">Payment Confirmation Received</h3>
              </div>
              <p className="text-sm text-green-800">
                Thank you! We've received your payment confirmation. Your account will be activated within 24 hours after we verify your payment.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Once you've completed the bank transfer, click the button below to notify us.
              </p>
              <button
                onClick={handlePaymentSubmitted}
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "I've Completed the Transfer"}
              </button>
            </>
          )}

          {/* Logout Button */}
          <button
            onClick={handleSignOut}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
