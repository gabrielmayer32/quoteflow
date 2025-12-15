"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface RequestActionsProps {
  requestId: string;
  currentStatus: string;
}

const statusOptions = [
  { value: "NEW", label: "New" },
  { value: "REVIEWING", label: "Reviewing" },
  { value: "QUOTED", label: "Quoted" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "COMPLETED", label: "Completed" },
];

export function RequestActions({ requestId, currentStatus }: RequestActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/requests/${requestId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast.success("Status updated successfully");
      setSelectedStatus(newStatus);
      router.refresh();
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status");
      setSelectedStatus(currentStatus); // Revert
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>

      <div className="space-y-4">
        {/* Change Status */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Update Status
          </label>
          <Select
            value={selectedStatus}
            onValueChange={handleStatusChange}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Update the status of this request to track progress
          </p>
        </div>

        {/* Contact Client */}
        <div className="pt-4 border-t">
          <p className="text-sm font-medium text-gray-700 mb-2">Contact Client</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild className="flex-1">
              <a href={`tel:${requestId}`}>
                📞 Call
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild className="flex-1">
              <a href={`sms:${requestId}`}>
                💬 SMS
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
