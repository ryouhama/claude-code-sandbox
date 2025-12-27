export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentListItem {
  id: string;
  title: string;
  updatedAt: string;
}

export interface DocumentCreate {
  title?: string;
  content?: string;
}

export interface DocumentUpdate {
  title?: string;
  content?: string;
}
