import { useState } from 'react'
import { messageText, sendMessage } from '../lib/a2aClient'

interface ChatEntry {
  role: 'user' | 'agent'
  text: string
}

export function Chat() {
  const [entries, setEntries] = useState<ChatEntry[]>([])
  const [input, setInput] = useState('')
  const [contextId, setContextId] = useState<string | undefined>()
  const [lastRaw, setLastRaw] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    setInput('')
    setError(null)
    setSending(true)
    setEntries((prev) => [...prev, { role: 'user', text }])
    try {
      const { reply, raw } = await sendMessage(text, contextId)
      setContextId(reply.contextId)
      setLastRaw(JSON.stringify(raw, null, 2))
      setEntries((prev) => [...prev, { role: 'agent', text: messageText(reply) }])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="chat">
      <div className="chat-log">
        {entries.length === 0 && (
          <p className="chat-empty">メッセージを送ってエージェントの応答を確認できます。</p>
        )}
        {entries.map((entry, i) => (
          <div key={i} className={`bubble bubble-${entry.role}`}>
            {entry.text}
          </div>
        ))}
        {sending && <div className="bubble bubble-agent">…</div>}
      </div>

      {error && <div className="chat-error">{error}</div>}

      <form className="chat-form" onSubmit={submit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力"
          disabled={sending}
        />
        <button type="submit" disabled={sending || !input.trim()}>
          送信
        </button>
      </form>

      {lastRaw && (
        <details className="chat-raw">
          <summary>生レスポンス (JSON-RPC)</summary>
          <pre>{lastRaw}</pre>
        </details>
      )}
    </div>
  )
}
