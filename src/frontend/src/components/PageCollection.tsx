import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, FileDown, Trash2, GripVertical } from 'lucide-react';
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

interface PageCollectionProps {
  pages: File[];
  onRemove: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onAddMore: () => void;
  onGeneratePDF: () => void;
}

export default function PageCollection({
  pages,
  onRemove,
  onReorder,
  onAddMore,
  onGeneratePDF,
}: PageCollectionProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      onReorder(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Document Pages</h2>
        <p className="text-muted-foreground">
          Manage your scanned pages - drag to reorder, or add more pages
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        {pages.map((page, index) => {
          const imageUrl = URL.createObjectURL(page);
          return (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative bg-card rounded-lg border-2 overflow-hidden cursor-move transition-all ${
                draggedIndex === index
                  ? 'opacity-50 scale-95'
                  : dragOverIndex === index
                  ? 'border-primary scale-105'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="aspect-[3/4] bg-black">
                <img src={imageUrl} alt={`Page ${index + 1}`} className="w-full h-full object-cover" />
              </div>
              <div className="p-2 bg-card border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <span>Page {index + 1}</span>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Page</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete page {index + 1}? This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onRemove(index)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          );
        })}

        <button
          onClick={onAddMore}
          className="aspect-[3/4] bg-muted/50 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-muted transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
        >
          <Plus className="w-8 h-8" />
          <span className="text-sm font-medium">Add Page</span>
        </button>
      </div>

      <div className="flex justify-center">
        <Button onClick={onGeneratePDF} size="lg" className="gap-2">
          <FileDown className="w-5 h-5" />
          Generate PDF ({pages.length} page{pages.length !== 1 ? 's' : ''})
        </Button>
      </div>
    </div>
  );
}
