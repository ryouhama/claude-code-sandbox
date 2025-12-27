import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useDocumentStore } from '../stores/documentStore';

interface PreviewProps {
  className?: string;
}

export function Preview({ className = '' }: PreviewProps) {
  const { currentDocument } = useDocumentStore();

  if (!currentDocument) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 text-gray-500 ${className}`}>
        プレビューはここに表示されます
      </div>
    );
  }

  return (
    <div className={`overflow-auto p-6 bg-white ${className}`}>
      <article className="prose prose-slate max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const isInline = !match;

              if (isInline) {
                return (
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm" {...props}>
                    {children}
                  </code>
                );
              }

              return (
                <SyntaxHighlighter
                  style={oneLight}
                  language={match[1]}
                  PreTag="div"
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            },
          }}
        >
          {currentDocument.content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
