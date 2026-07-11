// A2A (v1 / JSON-RPC) の薄いクライアント。
// dev では Vite の proxy 経由でバックエンド (:8000) に届く。

const RPC_URL = '/a2a'
const AGENT_CARD_URL = '/.well-known/agent-card.json'
const A2A_VERSION = '1.0'

export interface AgentSkill {
  id: string
  name: string
  description: string
  tags?: string[]
}

export interface AgentCard {
  name: string
  description: string
  version: string
  skills: AgentSkill[]
}

export interface A2AMessage {
  messageId: string
  contextId?: string
  taskId?: string
  role: string
  parts: { text?: string }[]
}

interface JsonRpcResponse {
  jsonrpc: string
  id: number
  result?: { message?: A2AMessage }
  error?: { code: number; message: string }
}

export async function fetchAgentCard(): Promise<AgentCard> {
  const res = await fetch(AGENT_CARD_URL)
  if (!res.ok) throw new Error(`Agent Card の取得に失敗しました (${res.status})`)
  return res.json()
}

export interface SendResult {
  reply: A2AMessage
  raw: JsonRpcResponse
}

export async function sendMessage(
  text: string,
  contextId?: string,
): Promise<SendResult> {
  const message: A2AMessage = {
    messageId: crypto.randomUUID(),
    role: 'ROLE_USER',
    parts: [{ text }],
  }
  if (contextId) message.contextId = contextId

  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'A2A-Version': A2A_VERSION,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'SendMessage',
      params: { message },
    }),
  })
  if (!res.ok) throw new Error(`リクエストに失敗しました (${res.status})`)

  const body: JsonRpcResponse = await res.json()
  if (body.error) throw new Error(`A2A エラー: ${body.error.message}`)
  if (!body.result?.message) throw new Error('応答に message がありません')
  return { reply: body.result.message, raw: body }
}

export function messageText(message: A2AMessage): string {
  return message.parts.map((p) => p.text ?? '').join('')
}
