'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCaptureSequence } from '@/lib/hooks/useCaptureSequence';
import { CaptureSequenceIndicator } from './CaptureSequenceIndicator';
import { CameraCapture } from './CameraCapture';

interface SequentialPhotoCaptureProps {
  onComplete: (photos: File[], metadata: { stepId: string; stepTitle: string; photoName: string }[]) => void;
  onCancel?: () => void;
}

export function SequentialPhotoCapture({
  onComplete,
  onCancel,
}: SequentialPhotoCaptureProps) {
  const {
    steps,
    currentStepIndex,
    isComplete,
    canProceed,
    canGoBack,
    setPhotoForCurrentStep,
    nextStep,
    previousStep,
    getAllPhotos,
    getMetadata,
  } = useCaptureSequence();

  const currentStep = steps[currentStepIndex];

  const handlePhotoCapture = (photo: File, previewUrl: string) => {
    setPhotoForCurrentStep(photo, previewUrl);
  };

  const handleComplete = () => {
    if (isComplete) {
      const photos = getAllPhotos();
      const metadata = getMetadata();
      onComplete(photos, metadata);
    }
  };

  return (
    <div className="space-y-6">
      <CaptureSequenceIndicator steps={steps} currentStepIndex={currentStepIndex} />

      <CameraCapture
        stepTitle={currentStep.title}
        stepDescription={currentStep.description}
        onPhotoCapture={handlePhotoCapture}
        existingPhoto={
          currentStep.photo && currentStep.previewUrl
            ? { file: currentStep.photo, previewUrl: currentStep.previewUrl }
            : null
        }
      />

      <div className="flex justify-between gap-4">
        <div className="flex gap-2">
          {canGoBack && (
            <Button type="button" variant="outline" onClick={previousStep}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          {onCancel && currentStepIndex === 0 && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {canProceed && (
            <Button type="button" onClick={nextStep}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {isComplete && (
            <Button type="button" onClick={handleComplete}>
              Complete Capture
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> You must complete each step in order. The sequence cannot be
          skipped to ensure proper documentation.
        </p>
      </div>
    </div>
  );
}
