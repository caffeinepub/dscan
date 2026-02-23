import { useState } from 'react';
import CameraCapture from '../components/CameraCapture';
import FileImport from '../components/FileImport';
import ImageEditor from '../components/ImageEditor';
import PageCollection from '../components/PageCollection';
import PDFPreview from '../components/PDFPreview';
import { useDocumentCollection } from '../hooks/useDocumentCollection';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { ArrowLeft, Camera, Upload } from 'lucide-react';

type WorkflowStep = 'capture' | 'edit' | 'collection' | 'preview';
type InputMode = 'camera' | 'file';

export default function ScanPage() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('capture');
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const { pages, addPage, removePage, reorderPages, clearPages } = useDocumentCollection();

  const handleCapture = (image: File) => {
    setCapturedImage(image);
    setCurrentStep('edit');
  };

  const handleFileImport = (image: File) => {
    setCapturedImage(image);
    setCurrentStep('edit');
  };

  const handleEditComplete = (processedImage: File) => {
    addPage(processedImage);
    setCapturedImage(null);
    setCurrentStep('collection');
  };

  const handleEditCancel = () => {
    setCapturedImage(null);
    setCurrentStep('capture');
  };

  const handleAddMore = () => {
    setCurrentStep('capture');
  };

  const handleGeneratePDF = () => {
    setCurrentStep('preview');
  };

  const handleBackToCollection = () => {
    setCurrentStep('collection');
  };

  const handleStartNew = () => {
    clearPages();
    setCurrentStep('capture');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {currentStep === 'capture' && (
        <div>
          {pages.length > 0 && (
            <div className="mb-6">
              <Button onClick={() => setCurrentStep('collection')} variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Collection ({pages.length} page{pages.length !== 1 ? 's' : ''})
              </Button>
            </div>
          )}
          
          <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as InputMode)} className="w-full">
            <div className="flex justify-center mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="camera" className="gap-2">
                  <Camera className="w-4 h-4" />
                  Camera
                </TabsTrigger>
                <TabsTrigger value="file" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Import File
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="camera" className="mt-0">
              <CameraCapture onCapture={handleCapture} />
            </TabsContent>

            <TabsContent value="file" className="mt-0">
              <FileImport onImport={handleFileImport} />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {currentStep === 'edit' && capturedImage && (
        <ImageEditor
          image={capturedImage}
          onComplete={handleEditComplete}
          onCancel={handleEditCancel}
        />
      )}

      {currentStep === 'collection' && (
        <PageCollection
          pages={pages}
          onRemove={removePage}
          onReorder={reorderPages}
          onAddMore={handleAddMore}
          onGeneratePDF={handleGeneratePDF}
        />
      )}

      {currentStep === 'preview' && (
        <PDFPreview
          pages={pages}
          onBack={handleBackToCollection}
          onStartNew={handleStartNew}
        />
      )}
    </div>
  );
}
