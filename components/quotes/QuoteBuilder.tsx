"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface QuoteBuilderProps {
  requestId: string;
  businessId: string;
  clientName: string;
}

export function QuoteBuilder({ requestId, businessId, clientName }: QuoteBuilderProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0, total: 0 },
  ]);
  const [notes, setNotes] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) {
      toast.error("Quote must have at least one line item");
      return;
    }
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };

    // Recalculate total for this line item
    if (field === "quantity" || field === "unitPrice") {
      updated[index].total = updated[index].quantity * updated[index].unitPrice;
    }

    setLineItems(updated);
  };

  const calculateGrandTotal = (): number => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate line items
      const invalidItems = lineItems.filter(
        (item) => !item.description.trim() || item.quantity <= 0 || item.unitPrice <= 0
      );

      if (invalidItems.length > 0) {
        toast.error("Please complete all line items with valid values");
        setIsSubmitting(false);
        return;
      }

      const grandTotal = calculateGrandTotal();
      if (grandTotal <= 0) {
        toast.error("Quote total must be greater than zero");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          businessId,
          lineItems,
          notes: notes.trim() || null,
          validUntil: validUntil || null,
          total: grandTotal,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create quote");
      }

      toast.success("Quote created successfully!");
      router.push(`/requests/${requestId}`);
    } catch (error) {
      console.error("Quote creation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create quote");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Line Items */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
          <Button type="button" onClick={addLineItem} size="sm" variant="outline">
            + Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {lineItems.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              {/* Description */}
              <div>
                <Label htmlFor={`desc-${index}`}>
                  Description <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`desc-${index}`}
                  type="text"
                  placeholder="e.g., AC Unit Installation"
                  value={item.description}
                  onChange={(e) => updateLineItem(index, "description", e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Quantity, Unit Price, Total */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`qty-${index}`}>
                    Quantity <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`qty-${index}`}
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, "quantity", parseFloat(e.target.value) || 0)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor={`price-${index}`}>
                    Unit Price (Rs) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`price-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label>Total (Rs)</Label>
                  <div className="h-10 px-3 py-2 bg-gray-50 border rounded-md flex items-center font-medium">
                    {item.total.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Remove Button */}
              {lineItems.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeLineItem(index)}
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={isSubmitting}
                >
                  Remove Item
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Grand Total */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Grand Total:</span>
            <span className="text-2xl font-bold text-blue-600">
              Rs {calculateGrandTotal().toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Additional Details</h2>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any terms, conditions, or additional information for the client..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isSubmitting}
            rows={4}
          />
        </div>

        {/* Valid Until */}
        <div>
          <Label htmlFor="validUntil">Quote Valid Until (Optional)</Label>
          <Input
            id="validUntil"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            disabled={isSubmitting}
            min={new Date().toISOString().split("T")[0]}
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave blank if quote has no expiration date
          </p>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || calculateGrandTotal() <= 0}
          className="flex-1"
        >
          {isSubmitting ? "Creating Quote..." : "Create Quote"}
        </Button>
      </div>
    </form>
  );
}
