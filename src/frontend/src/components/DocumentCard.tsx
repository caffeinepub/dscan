import { useState } from 'react';
import { Button } from './ui/button';
import { Download, Trash2, Loader2 } from 'lucide-react';
import { type Document } from '../backend';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
}

export default function DocumentCard({ document: doc, onDelete }: DocumentCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const thumbnailUrl = doc.externalBlob.getDirectURL();

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const bytes = await doc.externalBlob.getBytes();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${doc.title}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[3/4] bg-muted relative overflow-hidden">
        <iframe
          src={thumbnailUrl}
          className="w-full h-full pointer-events-none"
          title={doc.title}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold truncate mb-3" title={doc.title}>
          {doc.title}
        </h3>
        <div className="flex gap-2">
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download
              </>
            )}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{doc.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(doc.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
