import { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Upload, FileImage, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface FileImportProps {
  onImport: (image: File) => void;
}

export default function FileImport({ onImport }: FileImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    setError(null);

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    onImport(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Import Document</h1>
        <p className="text-muted-foreground">Select an image file from your device</p>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden shadow-lg">
        <div
          className={`relative bg-muted/30 transition-colors ${
            isDragging ? 'bg-primary/10 border-primary' : ''
          }`}
          style={{ aspectRatio: '4/3' }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
            <div className="text-center">
              <FileImage className="w-20 h-20 mx-auto mb-6 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">
                {isDragging ? 'Drop your file here' : 'Choose a file to import'}
              </h3>
              <p className="text-muted-foreground mb-6">
                Drag and drop or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Supported formats: JPEG, PNG, WebP (max 10MB)
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border-t border-destructive/20">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <div className="p-6 flex justify-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <Button onClick={handleButtonClick} size="lg" className="gap-2 px-8">
            <Upload className="w-5 h-5" />
            Select File
          </Button>
        </div>
      </div>
    </div>
  );
}
