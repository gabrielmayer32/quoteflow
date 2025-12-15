"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareLinkButtonProps {
  url: string;
  label?: string;
}

export function ShareLinkButton({ url, label = "Share" }: ShareLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi! Please use this link to submit your service request: ${url}`
    );
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={url}
          className="flex-1 px-3 py-2 text-sm border rounded-md bg-white"
          onClick={(e) => e.currentTarget.select()}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={copyToClipboard}
          className="min-w-20"
        >
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <Button
        size="sm"
        variant="default"
        onClick={shareViaWhatsApp}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        📱 Share via WhatsApp
      </Button>
    </div>
  );
}
