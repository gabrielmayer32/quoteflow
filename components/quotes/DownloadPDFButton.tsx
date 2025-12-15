"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DownloadPDFButtonProps {
  quoteId: string;
  token?: string;
  variant?: "default" | "outline";
}

export function DownloadPDFButton({ quoteId, token, variant = "outline" }: DownloadPDFButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const url = token
        ? `/api/quotes/${quoteId}/pdf?token=${token}`
        : `/api/quotes/${quoteId}/pdf`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      // Create blob from response
      const blob = await response.blob();

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `quote-${quoteId.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF download error:", error);
      toast.error("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleDownload}
      disabled={isDownloading}
      className="w-full sm:w-auto"
    >
      {isDownloading ? (
        <>
          <span className="inline-block animate-spin mr-2">⏳</span>
          Generating PDF...
        </>
      ) : (
        <>
          📄 Download PDF
        </>
      )}
    </Button>
  );
}
