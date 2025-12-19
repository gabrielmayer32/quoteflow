import { useState, useCallback } from 'react';

export interface CaptureStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  photo: File | null;
  previewUrl: string | null;
}

export interface UseCaptureSequenceReturn {
  steps: CaptureStep[];
  currentStepIndex: number;
  isComplete: boolean;
  canProceed: boolean;
  canGoBack: boolean;
  setPhotoForCurrentStep: (photo: File, previewUrl: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetSequence: () => void;
  getAllPhotos: () => File[];
  getMetadata: () => { stepId: string; stepTitle: string; photoName: string }[];
}

const defaultSteps: Omit<CaptureStep, 'completed' | 'photo' | 'previewUrl'>[] = [
  {
    id: 'wide-shot',
    title: 'Wide Shot',
    description: 'Capture a wide view of the entire room or area',
  },
  {
    id: 'close-up',
    title: 'Close-up',
    description: 'Take a close-up photo of the specific issue',
  },
  {
    id: 'context-shot',
    title: 'Context Shot',
    description: 'Show the issue in context with its surroundings',
  },
];

export function useCaptureSequence(
  customSteps?: Omit<CaptureStep, 'completed' | 'photo' | 'previewUrl'>[]
): UseCaptureSequenceReturn {
  const initialSteps: CaptureStep[] = (customSteps || defaultSteps).map((step) => ({
    ...step,
    completed: false,
    photo: null,
    previewUrl: null,
  }));

  const [steps, setSteps] = useState<CaptureStep[]>(initialSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = steps[currentStepIndex];
  const isComplete = steps.every((step) => step.completed);
  const canProceed = currentStep?.completed && currentStepIndex < steps.length - 1;
  const canGoBack = currentStepIndex > 0;

  const setPhotoForCurrentStep = useCallback(
    (photo: File, previewUrl: string) => {
      setSteps((prevSteps) => {
        const newSteps = [...prevSteps];
        newSteps[currentStepIndex] = {
          ...newSteps[currentStepIndex],
          photo,
          previewUrl,
          completed: true,
        };
        return newSteps;
      });
    },
    [currentStepIndex]
  );

  const nextStep = useCallback(() => {
    if (canProceed) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [canProceed]);

  const previousStep = useCallback(() => {
    if (canGoBack) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [canGoBack]);

  const resetSequence = useCallback(() => {
    setSteps(initialSteps);
    setCurrentStepIndex(0);
  }, [initialSteps]);

  const getAllPhotos = useCallback(() => {
    return steps.map((step) => step.photo).filter((photo): photo is File => photo !== null);
  }, [steps]);

  const getMetadata = useCallback(() => {
    return steps
      .filter((step) => step.photo !== null)
      .map((step) => ({
        stepId: step.id,
        stepTitle: step.title,
        photoName: step.photo!.name,
      }));
  }, [steps]);

  return {
    steps,
    currentStepIndex,
    isComplete,
    canProceed,
    canGoBack,
    setPhotoForCurrentStep,
    nextStep,
    previousStep,
    resetSequence,
    getAllPhotos,
    getMetadata,
  };
}
