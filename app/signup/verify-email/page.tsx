"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <Mail className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription>
            We've sent you a verification link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 text-center">
              Please check your inbox and click the verification link to activate your account.
            </p>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-semibold">What's next?</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Open the email we sent you</li>
              <li>Click the verification link</li>
              <li>You'll be redirected to log in automatically</li>
            </ol>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 text-center">
              The verification link will expire in 24 hours.
            </p>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>
              Didn't receive the email? Check your spam folder or{" "}
              <Link href="/contact" className="text-blue-600 hover:underline">
                contact support
              </Link>
              .
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={() => window.location.href = "mailto:"}
            variant="outline"
            className="w-full"
          >
            Open Email App
          </Button>
          <Link href="/login" className="w-full">
            <Button variant="ghost" className="w-full">
              Back to Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
