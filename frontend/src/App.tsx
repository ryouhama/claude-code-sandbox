import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Toolbar } from './components/Toolbar';
import { useDocumentStore } from './stores/documentStore';

function App() {
  const { error, clearError } = useDocumentStore();

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {error && (
        <div className="bg-red-500 text-white px-4 py-2 flex items-center justify-between">
          <span>エラー: {error}</span>
          <button onClick={clearError} className="text-white hover:text-gray-200">
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar className="w-64 flex-shrink-0" />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Toolbar />

          <div className="flex-1 flex overflow-hidden">
            <Editor className="w-1/2 border-r border-gray-300" />
            <Preview className="w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
