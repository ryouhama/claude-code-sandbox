"""カスタムエージェント置き場。

新しいエージェントは、このパッケージにモジュールを追加して
`base.Agent` Protocol を満たすクラスを実装する。A2A の知識は不要。
"""

from app.agents.base import Agent, AgentContext, Skill
from app.agents.echo import EchoAgent

__all__ = ["Agent", "AgentContext", "EchoAgent", "Skill"]
