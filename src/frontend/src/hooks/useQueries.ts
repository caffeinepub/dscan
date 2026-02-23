import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type Document, ExternalBlob } from '../backend';

export function useListDocuments() {
  const { actor, isFetching } = useActor();

  return useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDocuments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchDocuments(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Document[]>({
    queryKey: ['documents', 'search', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm) return [];
      return actor.searchDocuments(searchTerm);
    },
    enabled: !!actor && !isFetching && !!searchTerm,
  });
}

export function useGetDocument(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Document>({
    queryKey: ['documents', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getDocument(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useAddDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      blob,
    }: {
      id: string;
      title: string;
      blob: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.addDocument(id, title, blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.deleteDocument(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
