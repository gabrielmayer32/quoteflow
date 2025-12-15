"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ApprovalFormProps {
  quoteId: string;
  token: string;
}

export function ApprovalForm({ quoteId, token }: ApprovalFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectionNote, setRejectionNote] = useState("");

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/quotes/${quoteId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action: "approve" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to approve quote");
      }

      toast.success("Quote approved successfully!");
      router.refresh();
    } catch (error) {
      console.error("Approval error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to approve quote");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionNote.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/quotes/${quoteId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          action: "reject",
          rejectionNote: rejectionNote.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to reject quote");
      }

      toast.success("Quote rejected. The business will be notified.");
      router.refresh();
    } catch (error) {
      console.error("Rejection error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to reject quote");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-6 border-t space-y-4">
      {!showRejectReason ? (
        <>
          <h3 className="font-semibold text-gray-900 text-center mb-4">
            Do you approve this quote?
          </h3>

          <div className="grid sm:grid-cols-2 gap-3">
            <Button
              onClick={handleApprove}
              disabled={isSubmitting}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white h-12"
            >
              {isSubmitting ? "Processing..." : "✓ Approve Quote"}
            </Button>

            <Button
              onClick={() => setShowRejectReason(true)}
              disabled={isSubmitting}
              size="lg"
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 h-12"
            >
              ✗ Reject Quote
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500">
            By approving, you agree to the quoted amount and services
          </p>
        </>
      ) : (
        <>
          <h3 className="font-semibold text-gray-900 mb-2">Reason for Rejection</h3>

          <div className="space-y-3">
            <div>
              <Label htmlFor="rejectionNote">
                Please tell us why you're rejecting this quote
              </Label>
              <Textarea
                id="rejectionNote"
                placeholder="e.g., Price too high, looking for alternative options, need more time to decide..."
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowRejectReason(false);
                  setRejectionNote("");
                }}
                disabled={isSubmitting}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>

              <Button
                onClick={handleReject}
                disabled={isSubmitting || !rejectionNote.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? "Submitting..." : "Submit Rejection"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
