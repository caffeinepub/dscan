import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Download, ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { useAddDocument } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Alert, AlertDescription } from './ui/alert';

interface PDFPreviewProps {
  pages: File[];
  onBack: () => void;
  onStartNew: () => void;
}

export default function PDFPreview({ pages, onBack, onStartNew }: PDFPreviewProps) {
  const [documentTitle, setDocumentTitle] = useState('');
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { mutate: addDocument, isPending, isSuccess, isError } = useAddDocument();
  const { identity } = useInternetIdentity();

  useEffect(() => {
    const defaultTitle = `Document_${new Date().toISOString().split('T')[0]}`;
    setDocumentTitle(defaultTitle);
    handleGenerate();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const blob = await generatePDF(pages);
      setPdfBlob(blob);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle || 'document'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    if (!pdfBlob || !identity) return;

    const arrayBuffer = await pdfBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    const externalBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
      setUploadProgress(percentage);
    });

    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    addDocument({
      id: documentId,
      title: documentTitle || 'Untitled Document',
      blob: externalBlob,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button onClick={onBack} variant="outline" className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Pages
        </Button>
        <h2 className="text-2xl font-bold mb-2">Save Document</h2>
        <p className="text-muted-foreground">Name your document and save it to your library</p>
      </div>

      {isGenerating ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium">Generating PDF...</p>
          <p className="text-sm text-muted-foreground mt-2">Please wait while we process your document</p>
        </div>
      ) : (
        <>
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <FileText className="w-12 h-12 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">PDF Document</p>
                <p className="font-medium">
                  {pages.length} page{pages.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="Enter document title"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {isSuccess && (
            <Alert className="mb-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <AlertDescription className="text-green-800 dark:text-green-200">
                Document saved successfully! You can find it in your library.
              </AlertDescription>
            </Alert>
          )}

          {isError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                Failed to save document. Please try again or download it locally.
              </AlertDescription>
            </Alert>
          )}

          {isPending && uploadProgress > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="gap-2 flex-1"
              disabled={!pdfBlob}
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            {identity ? (
              <Button
                onClick={handleSave}
                className="gap-2 flex-1"
                disabled={!pdfBlob || isPending || isSuccess}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : isSuccess ? (
                  'Saved!'
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Save to Library
                  </>
                )}
              </Button>
            ) : (
              <Button className="gap-2 flex-1" disabled>
                <FileText className="w-4 h-4" />
                Login to Save
              </Button>
            )}
          </div>

          {isSuccess && (
            <div className="mt-6 text-center">
              <Button onClick={onStartNew} variant="outline">
                Start New Document
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
