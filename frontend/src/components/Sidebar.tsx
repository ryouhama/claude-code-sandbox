import { useEffect } from 'react';
import { useDocumentStore } from '../stores/documentStore';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = '' }: SidebarProps) {
  const {
    documents,
    currentDocument,
    isLoading,
    fetchDocuments,
    selectDocument,
    createDocument,
    deleteDocument,
  } = useDocumentStore();

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('このドキュメントを削除しますか？')) {
      deleteDocument(id);
    }
  };

  return (
    <div className={`flex flex-col bg-gray-900 text-gray-100 ${className}`}>
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={createDocument}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          + 新規ドキュメント
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {documents.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            ドキュメントがありません
          </div>
        ) : (
          <ul className="divide-y divide-gray-800">
            {documents.map((doc) => (
              <li
                key={doc.id}
                onClick={() => selectDocument(doc.id)}
                className={`p-3 cursor-pointer hover:bg-gray-800 transition-colors group ${
                  currentDocument?.id === doc.id ? 'bg-gray-800 border-l-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{doc.title || 'Untitled'}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(doc.updatedAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, doc.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                    title="削除"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
