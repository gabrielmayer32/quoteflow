"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Business {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string | null;
  logoUrl: string | null;
}

interface SettingsFormProps {
  business: Business;
}

export function SettingsForm({ business }: SettingsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [formData, setFormData] = useState({
    name: business.name,
    phone: business.phone,
    address: business.address || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/business/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update settings");
      }

      toast.success("Settings updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Settings update error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges =
    formData.name !== business.name ||
    formData.phone !== business.phone ||
    formData.address !== (business.address || "");

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("logo", file);

      const response = await fetch("/api/business/logo", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload logo");
      }

      toast.success("Logo uploaded successfully!");
      router.refresh();
    } catch (error) {
      console.error("Logo upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleDeleteLogo = async () => {
    if (!confirm("Are you sure you want to remove your logo?")) return;

    setIsUploadingLogo(true);
    try {
      const response = await fetch("/api/business/logo", {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete logo");
      }

      toast.success("Logo removed successfully!");
      router.refresh();
    } catch (error) {
      console.error("Logo deletion error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove logo");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Business Profile */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email (Read-only) */}
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={business.email}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Business Name */}
          <div>
            <Label htmlFor="name">
              Business Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address">Business Address (Optional)</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={3}
              placeholder="Enter your business address"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!hasChanges || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Saving Changes..." : "Save Changes"}
          </Button>
        </form>
      </div>

      {/* Logo Upload Section */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Logo</h2>

        <div className="flex items-center gap-6">
          {business.logoUrl ? (
            <img
              src={business.logoUrl}
              alt="Business Logo"
              className="h-20 w-20 rounded-lg object-cover border"
            />
          ) : (
            <div className="h-20 w-20 rounded-lg bg-gray-100 border flex items-center justify-center">
              <span className="text-3xl text-gray-400">
                {business.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">
              {business.logoUrl
                ? "Your logo appears on quotes and public forms"
                : "Upload a logo to personalize your quotes and forms"}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isUploadingLogo}
                onClick={() => document.getElementById("logo-upload")?.click()}
              >
                {isUploadingLogo ? "Uploading..." : business.logoUrl ? "Change Logo" : "Upload Logo"}
              </Button>
              {business.logoUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUploadingLogo}
                  onClick={handleDeleteLogo}
                  className="text-red-600 hover:bg-red-50"
                >
                  Remove
                </Button>
              )}
            </div>
            <input
              id="logo-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleLogoUpload}
              disabled={isUploadingLogo}
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Accepts JPEG, PNG, or WebP images up to 5MB
        </p>
      </div>

      {/* Intake Link */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Your Intake Form Link</h2>
        <p className="text-sm text-gray-600 mb-4">
          Share this link with clients to collect service requests
        </p>

        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={`${process.env.NEXT_PUBLIC_APP_URL}/intake/${business.id}`}
            readOnly
            className="bg-white"
            onClick={(e) => e.currentTarget.select()}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              await navigator.clipboard.writeText(
                `${process.env.NEXT_PUBLIC_APP_URL}/intake/${business.id}`
              );
              toast.success("Link copied to clipboard!");
            }}
          >
            Copy
          </Button>
        </div>
      </div>
    </div>
  );
}
