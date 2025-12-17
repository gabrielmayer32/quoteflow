"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle, Mail } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const status = searchParams.get("status");
  const email = searchParams.get("email");
  const message = searchParams.get("message");

  const handleAutoLogin = async () => {
    if (!email) return;

    setIsLoggingIn(true);
    // Redirect to login page with email pre-filled
    router.push(`/login?email=${encodeURIComponent(email)}&verified=true`);
  };

  useEffect(() => {
    if (status === "success") {
      // Auto-redirect after 3 seconds
      const timer = setTimeout(() => {
        handleAutoLogin();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [status, email]);

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Welcome to QuoteFlow! You can now log in and start managing your quotes and requests.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Redirecting to login page in 3 seconds...
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleAutoLogin}
              className="w-full"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Redirecting..." : "Continue to Login"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (status === "already-verified") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-blue-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Already Verified</CardTitle>
            <CardDescription>
              This email address has already been verified.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600">
              You can log in to your account using your credentials.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/login")} className="w-full">
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-orange-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Link Expired</CardTitle>
            <CardDescription>
              This verification link has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Verification links expire after 24 hours for security reasons.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                Please contact support to request a new verification email.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/login")} className="w-full">
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Error status
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Verification Failed</CardTitle>
          <CardDescription>
            We couldn't verify your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              {message || "The verification link is invalid or has expired."}
            </p>
          </div>
          <p className="text-sm text-gray-600">
            Please check that you clicked the correct link from your email, or contact support for assistance.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={() => router.push("/login")} className="w-full">
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <Mail className="h-16 w-16 text-gray-400 animate-pulse" />
              </div>
              <CardTitle className="text-2xl font-bold">Verifying...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
