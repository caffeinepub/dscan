import { useCamera } from '../camera/useCamera';
import { Button } from './ui/button';
import { Camera, RotateCcw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface CameraCaptureProps {
  onCapture: (image: File) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const {
    isActive,
    isSupported,
    error,
    isLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    retry,
    videoRef,
    canvasRef,
  } = useCamera({
    facingMode: 'environment',
    quality: 0.95,
    format: 'image/jpeg',
  });

  const handleCapture = async () => {
    const photo = await capturePhoto();
    if (photo) {
      onCapture(photo);
    }
  };

  if (isSupported === false) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Camera is not supported on this device or browser. Please use a device with camera support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Scan Document</h1>
        <p className="text-muted-foreground">Position your document within the frame and capture</p>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden shadow-lg">
        <div className="relative bg-black" style={{ aspectRatio: '4/3' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ display: isActive ? 'block' : 'none' }}
          />
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Camera not active</p>
              </div>
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border-t border-destructive/20">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error.message}
                {error.type === 'permission' && (
                  <span className="block mt-2">
                    Please grant camera permissions in your browser settings.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="p-6 flex flex-wrap gap-3 justify-center">
          {!isActive ? (
            <>
              <Button
                onClick={startCamera}
                disabled={isLoading}
                size="lg"
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Starting Camera...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    Start Camera
                  </>
                )}
              </Button>
              {error && (
                <Button onClick={retry} disabled={isLoading} variant="outline" size="lg" className="gap-2">
                  <RotateCcw className="w-5 h-5" />
                  Retry
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                onClick={handleCapture}
                disabled={isLoading}
                size="lg"
                className="gap-2 px-8"
              >
                <img
                  src="/assets/generated/camera-icon.dim_64x64.png"
                  alt="Capture"
                  className="w-5 h-5 brightness-0 invert"
                />
                Capture Document
              </Button>
              <Button
                onClick={stopCamera}
                disabled={isLoading}
                variant="outline"
                size="lg"
              >
                Stop Camera
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
