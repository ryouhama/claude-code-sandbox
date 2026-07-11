import { useEffect, useState } from 'react'
import { fetchAgentCard, type AgentCard } from '../lib/a2aClient'

export function AgentCardPanel() {
  const [card, setCard] = useState<AgentCard | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAgentCard()
      .then(setCard)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
  }, [])

  if (error) {
    return (
      <div className="agent-card agent-card-error">
        エージェントに接続できません: {error}
        <br />
        <code>server/</code> で <code>uv run uvicorn app.main:app --port 8000</code>{' '}
        を起動してください。
      </div>
    )
  }
  if (!card) return <div className="agent-card">Agent Card を取得中…</div>

  return (
    <div className="agent-card">
      <h2>
        {card.name} <small>v{card.version}</small>
      </h2>
      <p>{card.description}</p>
      <ul>
        {card.skills.map((skill) => (
          <li key={skill.id}>
            <strong>{skill.name}</strong> — {skill.description}
          </li>
        ))}
      </ul>
    </div>
  )
}
