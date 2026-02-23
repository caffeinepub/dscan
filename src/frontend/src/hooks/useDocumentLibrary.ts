import { useMemo } from 'react';
import { useListDocuments, useDeleteDocument } from './useQueries';
import { type Document } from '../backend';

export function useDocumentLibrary() {
  const { data: documents = [], isLoading, error: queryError } = useListDocuments();
  const { mutate: deleteDocumentMutation } = useDeleteDocument();

  const error = queryError ? String(queryError) : null;

  const searchDocuments = (searchTerm: string): Document[] => {
    if (!searchTerm) return documents;
    const lowerSearch = searchTerm.toLowerCase();
    return documents.filter((doc) => doc.title.toLowerCase().includes(lowerSearch));
  };

  const deleteDocument = (id: string) => {
    deleteDocumentMutation(id);
  };

  return {
    documents,
    isLoading,
    error,
    searchDocuments,
    deleteDocument,
  };
}
