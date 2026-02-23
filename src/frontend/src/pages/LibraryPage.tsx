import { useState } from 'react';
import { useDocumentLibrary } from '../hooks/useDocumentLibrary';
import DocumentCard from '../components/DocumentCard';
import SearchBar from '../components/SearchBar';
import { Loader2, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { documents, isLoading, error, deleteDocument, searchDocuments } = useDocumentLibrary();

  const displayedDocuments = searchTerm ? searchDocuments(searchTerm) : documents;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Document Library</h1>
        <p className="text-muted-foreground">Browse and manage your scanned documents</p>
      </div>

      <div className="mb-6">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : displayedDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {searchTerm ? 'No documents found' : 'No documents yet'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Start scanning documents to build your library'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedDocuments.map((doc) => (
            <DocumentCard key={doc.id} document={doc} onDelete={deleteDocument} />
          ))}
        </div>
      )}
    </div>
  );
}
