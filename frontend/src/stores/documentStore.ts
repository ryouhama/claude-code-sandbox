import { create } from 'zustand';
import type { Document, DocumentListItem } from '../types';
import { api } from '../api/client';

interface DocumentState {
  documents: DocumentListItem[];
  currentDocument: Document | null;
  isLoading: boolean;
  error: string | null;

  fetchDocuments: () => Promise<void>;
  selectDocument: (id: string) => Promise<void>;
  createDocument: () => Promise<void>;
  updateContent: (content: string) => void;
  updateTitle: (title: string) => void;
  saveDocument: () => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  clearError: () => void;
}

const LOCAL_STORAGE_KEY = 'markdown-editor-draft';

function saveDraftToLocal(doc: Document | null) {
  if (doc) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(doc));
  }
}

function loadDraftFromLocal(): Document | null {
  const draft = localStorage.getItem(LOCAL_STORAGE_KEY);
  return draft ? JSON.parse(draft) : null;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  currentDocument: loadDraftFromLocal(),
  isLoading: false,
  error: null,

  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const documents = await api.getDocuments();
      set({ documents, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectDocument: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const doc = await api.getDocument(id);
      set({ currentDocument: doc, isLoading: false });
      saveDraftToLocal(doc);
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createDocument: async () => {
    set({ isLoading: true, error: null });
    try {
      const doc = await api.createDocument({ title: 'Untitled', content: '' });
      set((state) => ({
        documents: [{ id: doc.id, title: doc.title, updatedAt: doc.updatedAt }, ...state.documents],
        currentDocument: doc,
        isLoading: false,
      }));
      saveDraftToLocal(doc);
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateContent: (content: string) => {
    set((state) => {
      if (!state.currentDocument) return state;
      const updated = { ...state.currentDocument, content };
      saveDraftToLocal(updated);
      return { currentDocument: updated };
    });
  },

  updateTitle: (title: string) => {
    set((state) => {
      if (!state.currentDocument) return state;
      const updated = { ...state.currentDocument, title };
      saveDraftToLocal(updated);
      return { currentDocument: updated };
    });
  },

  saveDocument: async () => {
    const { currentDocument } = get();
    if (!currentDocument) return;

    set({ isLoading: true, error: null });
    try {
      const updated = await api.updateDocument(currentDocument.id, {
        title: currentDocument.title,
        content: currentDocument.content,
      });
      set((state) => ({
        currentDocument: updated,
        documents: state.documents.map((d) =>
          d.id === updated.id ? { id: updated.id, title: updated.title, updatedAt: updated.updatedAt } : d
        ),
        isLoading: false,
      }));
      saveDraftToLocal(updated);
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteDocument: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.deleteDocument(id);
      set((state) => {
        const newDocuments = state.documents.filter((d) => d.id !== id);
        const newCurrent = state.currentDocument?.id === id ? null : state.currentDocument;
        if (!newCurrent) {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
        return {
          documents: newDocuments,
          currentDocument: newCurrent,
          isLoading: false,
        };
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
