"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface QuoteActionsProps {
  quoteId: string;
  approvalToken: string;
  status: string;
  clientName: string;
  clientPhone: string;
}

export function QuoteActions({
  quoteId,
  approvalToken,
  status,
  clientName,
  clientPhone,
}: QuoteActionsProps) {
  const handleCopyLink = () => {
    const approvalUrl = `${window.location.origin}/approve/${approvalToken}`;
    navigator.clipboard.writeText(approvalUrl);
    toast.success("Approval link copied to clipboard!");
  };

  const handleWhatsAppShare = () => {
    const approvalUrl = `${window.location.origin}/approve/${approvalToken}`;
    const message = `Hello ${clientName}, your quote is ready! Please review and approve it here: ${approvalUrl}`;
    const whatsappUrl = `https://wa.me/${clientPhone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleShareLink = () => {
    const approvalUrl = `${window.location.origin}/approve/${approvalToken}`;
    const message = `Hello ${clientName}, your quote is ready! Please review and approve it here: ${approvalUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="flex flex-col gap-3">
        {/* Share Approval Link Section */}
        {status === "PENDING" && (
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="w-full text-sm whitespace-nowrap"
            >
              📋 Copy Link
            </Button>
            <Button
              variant="outline"
              onClick={handleShareLink}
              className="w-full text-sm whitespace-nowrap"
            >
              📱 Share on WhatsApp
            </Button>
          </div>
        )}

        {/* Contact Client Section */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={handleWhatsAppShare}
            className="w-full sm:w-auto text-sm whitespace-nowrap"
          >
            💬 Send to Client
          </Button>
          <a href={`tel:${clientPhone}`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full text-sm whitespace-nowrap">
              📞 Call
            </Button>
          </a>
          <a href={`sms:${clientPhone}`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full text-sm whitespace-nowrap">
              💬 SMS
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
