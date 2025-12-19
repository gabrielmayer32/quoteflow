"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/intake/FileUpload";
import { SequentialPhotoCapture } from "@/components/photo-capture/SequentialPhotoCapture";
import { toast } from "sonner";

interface IntakeFormProps {
  businessId: string;
}

export function IntakeForm({ businessId }: IntakeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    problemDesc: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [useGuidedCapture, setUseGuidedCapture] = useState(false);
  const [captureMetadata, setCaptureMetadata] = useState<
    { stepId: string; stepTitle: string; photoName: string }[] | null
  >(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const data = new FormData();
      data.append("businessId", businessId);
      data.append("clientName", formData.clientName);
      data.append("clientEmail", formData.clientEmail);
      data.append("clientPhone", formData.clientPhone);
      data.append("clientAddress", formData.clientAddress);
      data.append("problemDesc", formData.problemDesc);

      // Append all files
      files.forEach((file) => {
        data.append("files", file);
      });

      // Append capture metadata if using guided capture
      if (captureMetadata) {
        data.append("captureMetadata", JSON.stringify(captureMetadata));
      }

      const response = await fetch("/api/intake", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit request");
      }

      toast.success("Request submitted successfully!");

      // Show success message
      router.push(`/intake/success?requestId=${result.requestId}`);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGuidedCaptureComplete = (
    photos: File[],
    metadata: { stepId: string; stepTitle: string; photoName: string }[]
  ) => {
    setFiles(photos);
    setCaptureMetadata(metadata);
    setUseGuidedCapture(false);
    toast.success(`${photos.length} photos captured successfully!`);
  };

  const handleGuidedCaptureCancel = () => {
    setUseGuidedCapture(false);
  };

  const isValid =
    formData.clientName.trim() &&
    formData.clientEmail.trim() &&
    formData.clientPhone.trim() &&
    formData.clientAddress.trim() &&
    formData.problemDesc.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Name */}
      <div className="space-y-2">
        <Label htmlFor="clientName">
          Your Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="clientName"
          name="clientName"
          type="text"
          placeholder="Enter your full name"
          value={formData.clientName}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      {/* Client Phone */}
      {/* Client Email */}
      <div className="space-y-2">
        <Label htmlFor="clientEmail">
          Email Address <span className="text-red-500">*</span>
        </Label>
        <Input
          id="clientEmail"
          name="clientEmail"
          type="email"
          placeholder="e.g., you@email.com"
          value={formData.clientEmail}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      {/* Client Phone */}
      <div className="space-y-2">
        <Label htmlFor="clientPhone">
          Phone Number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="clientPhone"
          name="clientPhone"
          type="tel"
          placeholder="e.g., 5XXX XXXX"
          value={formData.clientPhone}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      {/* Client Address */}
      <div className="space-y-2">
        <Label htmlFor="clientAddress">
          Service Location <span className="text-red-500">*</span>
        </Label>
        <Input
          id="clientAddress"
          name="clientAddress"
          type="text"
          placeholder="Enter the address where service is needed"
          value={formData.clientAddress}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      {/* Problem Description */}
      <div className="space-y-2">
        <Label htmlFor="problemDesc">
          Describe the Problem <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="problemDesc"
          name="problemDesc"
          placeholder="Please describe the issue in detail. What's not working? When did it start? Any other relevant information..."
          value={formData.problemDesc}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          rows={5}
          className="resize-none"
        />
        <p className="text-xs text-gray-500">
          Be as specific as possible to help us provide an accurate quote
        </p>
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label>
          Photos or Videos <span className="text-gray-500 text-sm font-normal">(Optional)</span>
        </Label>

        {!useGuidedCapture ? (
          <>
            <FileUpload
              files={files}
              onFilesChange={setFiles}
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Upload images or videos showing the problem. Max 10 files, 10MB each.
              </p>
              <Button
                type="button"
                variant="link"
                onClick={() => setUseGuidedCapture(true)}
                disabled={isSubmitting}
                className="text-xs"
              >
                Use Guided Photo Capture
              </Button>
            </div>
          </>
        ) : (
          <SequentialPhotoCapture
            onComplete={handleGuidedCaptureComplete}
            onCancel={handleGuidedCaptureCancel}
          />
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="w-full h-12 text-base font-semibold"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <span className="inline-block animate-spin mr-2">⏳</span>
            Submitting Request...
          </>
        ) : (
          "Submit Request"
        )}
      </Button>

      <p className="text-xs text-center text-gray-500">
        By submitting this form, you agree to be contacted regarding your service request
      </p>
    </form>
  );
}
