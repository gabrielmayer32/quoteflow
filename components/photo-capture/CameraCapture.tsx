'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CameraCaptureProps {
  stepTitle: string;
  stepDescription: string;
  onPhotoCapture: (photo: File, previewUrl: string) => void;
  autoStart?: boolean;
}

export function CameraCapture({
  stepTitle,
  stepDescription,
  onPhotoCapture,
  autoStart = false,
}: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure video element properly receives and displays the stream
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Auto-start camera when component mounts if autoStart is true
  useEffect(() => {
    if (autoStart && !stream && !capturedPhoto) {
      startCamera();
    }
    // Cleanup stream when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Ensure video plays
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.error('Video play error:', playError);
        }
      }
    } catch (err) {
      setError(
        'Unable to access camera. Please check permissions or use file upload instead.'
      );
      console.error('Camera access error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File([blob], `${stepTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        const previewUrl = URL.createObjectURL(blob);

        setCapturedPhoto({ file, previewUrl });
        stopCamera();
      },
      'image/jpeg',
      0.9
    );
  }, [stepTitle, stopCamera]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setCapturedPhoto({ file, previewUrl });
  }, []);

  const retakePhoto = useCallback(() => {
    if (capturedPhoto?.previewUrl) {
      URL.revokeObjectURL(capturedPhoto.previewUrl);
    }
    setCapturedPhoto(null);
    setError(null);
  }, [capturedPhoto]);

  const confirmPhoto = useCallback(() => {
    if (capturedPhoto) {
      onPhotoCapture(capturedPhoto.file, capturedPhoto.previewUrl);
    }
  }, [capturedPhoto, onPhotoCapture]);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">{stepTitle}</h3>
          <p className="text-sm text-gray-600 mt-1">{stepDescription}</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
          {capturedPhoto ? (
            <img
              src={capturedPhoto.previewUrl}
              alt="Captured photo"
              className="w-full h-full object-contain"
            />
          ) : stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <Camera className="w-16 h-16 mx-auto text-gray-400" />
                <p className="text-sm text-gray-500">Camera preview will appear here</p>
              </div>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex flex-col gap-2">
          {!capturedPhoto && !stream && (
            <>
              <Button type="button" onClick={startCamera} disabled={isLoading} className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                {isLoading ? 'Starting Camera...' : 'Start Camera'}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </>
          )}

          {stream && !capturedPhoto && (
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={stopCamera} className="flex-1">
                Cancel
              </Button>
              <Button type="button" onClick={capturePhoto} className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Capture Photo
              </Button>
            </div>
          )}

          {capturedPhoto && (
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={retakePhoto} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              <Button type="button" onClick={confirmPhoto} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Confirm
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
