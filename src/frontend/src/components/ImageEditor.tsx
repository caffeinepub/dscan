import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Check, X, RotateCw } from 'lucide-react';
import ImageEnhancement from './ImageEnhancement';
import { detectDocumentCorners, applyPerspectiveTransform } from '../utils/imageProcessing';

interface ImageEditorProps {
  image: File;
  onComplete: (processedImage: File) => void;
  onCancel: () => void;
}

interface Corner {
  x: number;
  y: number;
}

export default function ImageEditor({ image, onComplete, onCancel }: ImageEditorProps) {
  const [corners, setCorners] = useState<Corner[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [imageData, setImageData] = useState<string>('');
  const [processedImage, setProcessedImage] = useState<string>('');
  const [showEnhancement, setShowEnhancement] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setImageData(dataUrl);

      const img = new Image();
      img.onload = () => {
        const detectedCorners = detectDocumentCorners(img);
        setCorners(detectedCorners);
        applyTransform(img, detectedCorners);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(image);
  }, [image]);

  const applyTransform = (img: HTMLImageElement, currentCorners: Corner[]) => {
    const transformed = applyPerspectiveTransform(img, currentCorners);
    setProcessedImage(transformed);
  };

  const handleMouseDown = (index: number) => {
    setDraggingIndex(index);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingIndex === null || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newCorners = [...corners];
    newCorners[draggingIndex] = {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
    setCorners(newCorners);
  };

  const handleMouseUp = () => {
    if (draggingIndex !== null && imageData) {
      const img = new Image();
      img.onload = () => {
        applyTransform(img, corners);
      };
      img.src = imageData;
    }
    setDraggingIndex(null);
  };

  const handleRedetect = () => {
    if (!imageData) return;
    const img = new Image();
    img.onload = () => {
      const detectedCorners = detectDocumentCorners(img);
      setCorners(detectedCorners);
      applyTransform(img, detectedCorners);
    };
    img.src = imageData;
  };

  const handleEnhancementComplete = (enhancedDataUrl: string) => {
    fetch(enhancedDataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], 'scanned-document.jpg', { type: 'image/jpeg' });
        onComplete(file);
      });
  };

  const handleContinue = () => {
    setShowEnhancement(true);
  };

  if (showEnhancement && processedImage) {
    return (
      <ImageEnhancement
        image={processedImage}
        onComplete={handleEnhancementComplete}
        onCancel={() => setShowEnhancement(false)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Adjust Document Boundaries</h2>
        <p className="text-muted-foreground">
          Drag the corner points to adjust the document boundaries
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Original</h3>
          </div>
          <div
            ref={containerRef}
            className="relative bg-black"
            style={{ aspectRatio: '4/3' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {imageData && (
              <>
                <img src={imageData} alt="Original" className="w-full h-full object-contain" />
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <polygon
                    points={corners.map((c) => `${c.x}%,${c.y}%`).join(' ')}
                    fill="rgba(59, 130, 246, 0.2)"
                    stroke="rgb(59, 130, 246)"
                    strokeWidth="2"
                  />
                </svg>
                {corners.map((corner, index) => (
                  <div
                    key={index}
                    className="absolute w-6 h-6 bg-primary border-2 border-white rounded-full cursor-move shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${corner.x}%`, top: `${corner.y}%` }}
                    onMouseDown={() => handleMouseDown(index)}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Processed</h3>
          </div>
          <div className="relative bg-black" style={{ aspectRatio: '4/3' }}>
            {processedImage ? (
              <img src={processedImage} alt="Processed" className="w-full h-full object-contain" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src="/assets/generated/document-placeholder.dim_200x280.png"
                  alt="Processing"
                  className="opacity-30"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Button onClick={handleRedetect} variant="outline" className="gap-2">
          <RotateCw className="w-4 h-4" />
          Re-detect
        </Button>
        <Button onClick={onCancel} variant="outline" className="gap-2">
          <X className="w-4 h-4" />
          Cancel
        </Button>
        <Button onClick={handleContinue} disabled={!processedImage} className="gap-2">
          <Check className="w-4 h-4" />
          Continue
        </Button>
      </div>
    </div>
  );
}
