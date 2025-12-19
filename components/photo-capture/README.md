# Sequential Photo Capture Feature

## Overview

This feature provides a guided, enforced photo capture sequence for client intake forms. Users must complete each step in order and cannot skip steps, ensuring consistent and complete documentation.

## Default Sequence

1. **Wide Shot** - Capture a wide view of the entire room or area
2. **Close-up** - Take a close-up photo of the specific issue
3. **Context Shot** - Show the issue in context with its surroundings

## Components

### `SequentialPhotoCapture`
Main orchestrator component that manages the entire photo capture flow.

**Props:**
- `onComplete: (photos: File[], metadata: CaptureMetadata[]) => void` - Called when all photos are captured
- `onCancel?: () => void` - Optional callback for cancellation

**Usage:**
```tsx
<SequentialPhotoCapture
  onComplete={(photos, metadata) => {
    console.log('Captured photos:', photos);
    console.log('Metadata:', metadata);
  }}
  onCancel={() => console.log('Cancelled')}
/>
```

### `CameraCapture`
Individual step component that handles camera access, photo capture, and file upload fallback.

**Features:**
- Native camera access via getUserMedia API
- File upload fallback for browsers without camera support
- Preview captured photos before confirming
- Retake functionality
- Mobile-friendly with environment-facing camera preference

### `CaptureSequenceIndicator`
Visual progress indicator showing all steps and current progress.

**Features:**
- Step-by-step visual representation
- Active step highlighting
- Completed step checkmarks
- Progress bar between steps

### `useCaptureSequence` Hook
Custom React hook for managing capture sequence state.

**Returns:**
- `steps` - Array of all capture steps
- `currentStepIndex` - Current active step index
- `isComplete` - Whether all steps are completed
- `canProceed` - Whether user can move to next step
- `canGoBack` - Whether user can go back to previous step
- `setPhotoForCurrentStep(photo, previewUrl)` - Set photo for current step
- `nextStep()` - Move to next step
- `previousStep()` - Go back to previous step
- `resetSequence()` - Reset all progress
- `getAllPhotos()` - Get array of all captured photos
- `getMetadata()` - Get metadata for all captured photos

**Custom Steps Example:**
```tsx
const customSteps = [
  {
    id: 'before',
    title: 'Before',
    description: 'Take a photo before starting work',
  },
  {
    id: 'during',
    title: 'During',
    description: 'Photo during the repair process',
  },
  {
    id: 'after',
    title: 'After',
    description: 'Photo after completion',
  },
];

const { steps, currentStepIndex, ... } = useCaptureSequence(customSteps);
```

## Integration

### IntakeForm Integration

The photo capture is integrated into the intake form with a toggle option:

1. Default view shows standard file upload
2. "Use Guided Photo Capture" link switches to sequential capture
3. After completion, photos are automatically added to the form
4. Metadata is stored in the database for reference

### Database Schema

The `Request` model includes:
- `mediaUrls: String[]` - Array of uploaded photo URLs
- `captureMetadata: Json?` - Optional metadata about the capture sequence

Example metadata structure:
```json
[
  {
    "stepId": "wide-shot",
    "stepTitle": "Wide Shot",
    "photoName": "wide-shot-1702345678901.jpg"
  },
  {
    "stepId": "close-up",
    "stepTitle": "Close-up",
    "photoName": "close-up-1702345689012.jpg"
  },
  {
    "stepId": "context-shot",
    "stepTitle": "Context Shot",
    "photoName": "context-shot-1702345699123.jpg"
  }
]
```

## Browser Compatibility

- **Modern Browsers**: Full camera capture support via getUserMedia
- **Mobile Browsers**: Camera access with environment-facing camera preference
- **Fallback**: File upload input with camera capture attribute for older browsers
- **iOS Safari**: Supported with appropriate permissions

## Security & Permissions

- Camera access requires user permission
- Permission prompts are handled by the browser
- Clear error messages if permission is denied
- Fallback to file upload if camera unavailable

## File Storage

- Photos are stored using the existing R2/local storage system
- Same upload limits apply (10MB per file)
- Generated filenames include step ID and timestamp
- All standard file validations apply

## Customization

To customize the capture sequence, modify the `defaultSteps` array in [useCaptureSequence.ts](../../lib/hooks/useCaptureSequence.ts) or pass custom steps to the hook.

## Future Enhancements

Potential improvements:
- Video capture support (optional per step)
- Image editing/cropping before confirmation
- Drawing/annotation on captured photos
- GPS location metadata
- Multiple photos per step
- Optional vs required steps
- Skip conditions based on problem type
