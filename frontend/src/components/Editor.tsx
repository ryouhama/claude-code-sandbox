import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { useDocumentStore } from '../stores/documentStore';

const theme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '14px',
  },
  '.cm-scroller': {
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    overflow: 'auto',
  },
  '.cm-content': {
    padding: '16px',
  },
  '.cm-gutters': {
    backgroundColor: '#f8f9fa',
    borderRight: '1px solid #e9ecef',
  },
  '.cm-activeLine': {
    backgroundColor: '#f8f9fa',
  },
});

interface EditorProps {
  className?: string;
}

export function Editor({ className = '' }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { currentDocument, updateContent } = useDocumentStore();

  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        updateContent(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: currentDocument?.content || '',
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        markdown({ codeLanguages: languages }),
        theme,
        updateListener,
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
    // currentDocument.idの変更時のみ再作成
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDocument?.id]);

  // ドキュメント切り替え時にエディタ内容を更新
  useEffect(() => {
    if (viewRef.current && currentDocument) {
      const currentContent = viewRef.current.state.doc.toString();
      if (currentContent !== currentDocument.content) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: currentDocument.content,
          },
        });
      }
    }
  }, [currentDocument?.id, currentDocument?.content]);

  if (!currentDocument) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 text-gray-500 ${className}`}>
        ドキュメントを選択するか、新規作成してください
      </div>
    );
  }

  return <div ref={containerRef} className={`overflow-hidden ${className}`} />;
}
