import type { Document, DocumentListItem, DocumentCreate, DocumentUpdate } from '../types';

const API_BASE = 'http://localhost:8000/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP error: ${response.status}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

export const api = {
  async getDocuments(): Promise<DocumentListItem[]> {
    const response = await fetch(`${API_BASE}/documents`);
    return handleResponse<DocumentListItem[]>(response);
  },

  async getDocument(id: string): Promise<Document> {
    const response = await fetch(`${API_BASE}/documents/${id}`);
    return handleResponse<Document>(response);
  },

  async createDocument(data: DocumentCreate): Promise<Document> {
    const response = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Document>(response);
  },

  async updateDocument(id: string, data: DocumentUpdate): Promise<Document> {
    const response = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Document>(response);
  },

  async deleteDocument(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },

  getExportUrl(id: string, format: 'html' | 'pdf'): string {
    return `${API_BASE}/documents/${id}/export?format=${format}`;
  },
};
