import { useState } from 'react';

export function useDocumentCollection() {
  const [pages, setPages] = useState<File[]>([]);

  const addPage = (page: File) => {
    setPages((prev) => [...prev, page]);
  };

  const removePage = (index: number) => {
    setPages((prev) => prev.filter((_, i) => i !== index));
  };

  const reorderPages = (fromIndex: number, toIndex: number) => {
    setPages((prev) => {
      const newPages = [...prev];
      const [removed] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, removed);
      return newPages;
    });
  };

  const clearPages = () => {
    setPages([]);
  };

  return {
    pages,
    addPage,
    removePage,
    reorderPages,
    clearPages,
  };
}
