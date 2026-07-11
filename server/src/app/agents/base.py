"""カスタムエージェントの共通インターフェース。

ここは A2A 非依存。エージェント実装者はこの Protocol を満たすクラスを
agents/ 配下に追加するだけでよい(A2A への接続は app.a2a 層が担う)。
"""

from collections.abc import AsyncIterator
from dataclasses import dataclass, field
from typing import Protocol, runtime_checkable


@dataclass(frozen=True)
class Skill:
    """エージェントが提供するスキル(Agent Card に載る)。"""

    id: str
    name: str
    description: str
    tags: list[str] = field(default_factory=list)
    examples: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class AgentContext:
    """1回の呼び出しに紐づくコンテキスト情報。"""

    task_id: str | None = None
    context_id: str | None = None


@runtime_checkable
class Agent(Protocol):
    """カスタムエージェントが実装するインターフェース。"""

    name: str
    description: str
    version: str
    skills: list[Skill]

    def invoke(self, query: str, context: AgentContext) -> AsyncIterator[str]:
        """ユーザー入力を受け取り、応答テキストを(必要なら分割して)返す。"""
        ...
