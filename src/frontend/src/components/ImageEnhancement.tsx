import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Check, X } from 'lucide-react';
import { applyBrightness, applyContrast, applyBlackAndWhite } from '../utils/imageFilters';

interface ImageEnhancementProps {
  image: string;
  onComplete: (enhancedImage: string) => void;
  onCancel: () => void;
}

export default function ImageEnhancement({ image, onComplete, onCancel }: ImageEnhancementProps) {
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [blackAndWhite, setBlackAndWhite] = useState(false);
  const [previewImage, setPreviewImage] = useState(image);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    applyFilters();
  }, [brightness, contrast, blackAndWhite, image]);

  const applyFilters = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      imageData = applyBrightness(imageData, brightness);
      imageData = applyContrast(imageData, contrast);
      if (blackAndWhite) {
        imageData = applyBlackAndWhite(imageData);
      }

      ctx.putImageData(imageData, 0, 0);
      setPreviewImage(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.src = image;
  };

  const handleComplete = () => {
    onComplete(previewImage);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Enhance Image</h2>
        <p className="text-muted-foreground">Adjust brightness, contrast, and apply filters</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Preview</h3>
          </div>
          <div className="relative bg-black" style={{ minHeight: '400px' }}>
            <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-semibold mb-6">Adjustments</h3>

          <div className="space-y-6">
            <div>
              <Label htmlFor="brightness" className="mb-3 block">
                Brightness: {brightness > 0 ? '+' : ''}
                {brightness}
              </Label>
              <Slider
                id="brightness"
                min={-100}
                max={100}
                step={1}
                value={[brightness]}
                onValueChange={(value) => setBrightness(value[0])}
              />
            </div>

            <div>
              <Label htmlFor="contrast" className="mb-3 block">
                Contrast: {contrast > 0 ? '+' : ''}
                {contrast}
              </Label>
              <Slider
                id="contrast"
                min={-100}
                max={100}
                step={1}
                value={[contrast]}
                onValueChange={(value) => setContrast(value[0])}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Label htmlFor="bw" className="cursor-pointer">
                Black & White
              </Label>
              <Switch id="bw" checked={blackAndWhite} onCheckedChange={setBlackAndWhite} />
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Button onClick={handleComplete} className="w-full gap-2">
              <Check className="w-4 h-4" />
              Apply & Continue
            </Button>
            <Button onClick={onCancel} variant="outline" className="w-full gap-2">
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
