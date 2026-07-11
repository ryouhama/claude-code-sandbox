"""疎通確認用のサンプルエージェント。カスタムエージェントの実装例を兼ねる。"""

from collections.abc import AsyncIterator

from app.agents.base import AgentContext, Skill


class EchoAgent:
    name = "sandbox-agent"
    description = "サンドボックス用サンプルエージェント"
    version = "0.1.0"
    skills = [
        Skill(
            id="echo",
            name="Echo",
            description="受け取ったテキストをそのまま返す(疎通確認用)",
            tags=["sample"],
            examples=["hello"],
        )
    ]

    async def invoke(self, query: str, context: AgentContext) -> AsyncIterator[str]:
        yield query
