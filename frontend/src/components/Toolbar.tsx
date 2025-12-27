import { useCallback, useEffect, useRef, useState } from 'react';
import { useDocumentStore } from '../stores/documentStore';
import { api } from '../api/client';

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className = '' }: ToolbarProps) {
  const { currentDocument, updateTitle, saveDocument, isLoading } = useDocumentStore();
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);

  // 自動保存（デバウンス）
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(async () => {
      setIsSaving(true);
      await saveDocument();
      setIsSaving(false);
    }, 2000);
  }, [saveDocument]);

  useEffect(() => {
    if (currentDocument) {
      debouncedSave();
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [currentDocument?.content, currentDocument?.title, debouncedSave]);

  const handleExport = (format: 'html' | 'pdf') => {
    if (!currentDocument) return;
    window.open(api.getExportUrl(currentDocument.id, format), '_blank');
  };

  const handleManualSave = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setIsSaving(true);
    await saveDocument();
    setIsSaving(false);
  };

  if (!currentDocument) {
    return (
      <div className={`flex items-center justify-between px-4 py-2 bg-white border-b ${className}`}>
        <div className="text-gray-400">Markdown Editor</div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between px-4 py-2 bg-white border-b ${className}`}>
      <div className="flex items-center gap-4 flex-1">
        <input
          type="text"
          value={currentDocument.title}
          onChange={(e) => updateTitle(e.target.value)}
          className="text-lg font-medium bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 max-w-md"
          placeholder="ドキュメント名"
        />
        {isSaving && (
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            保存中...
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleManualSave}
          disabled={isLoading || isSaving}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded transition-colors"
        >
          保存
        </button>

        <div className="relative group">
          <button className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
            エクスポート
          </button>
          <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <button
              onClick={() => handleExport('html')}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 rounded-t-lg"
            >
              HTML
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 rounded-b-lg"
            >
              PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
