import { AgentCardPanel } from './components/AgentCardPanel'
import { Chat } from './components/Chat'
import './App.css'

function App() {
  return (
    <main className="container">
      <h1>A2A Agent Console</h1>
      <AgentCardPanel />
      <Chat />
    </main>
  )
}

export default App
