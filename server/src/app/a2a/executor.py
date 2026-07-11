"""A2A と カスタムエージェントをつなぐアダプタ。

A2A メッセージ ⇄ エージェントの入出力(str)の変換だけを行う。
エージェントのロジックはここには書かない。
"""

import logging

from a2a.helpers import new_text_message
from a2a.server.agent_execution import AgentExecutor, RequestContext
from a2a.server.events.event_queue_v2 import EventQueue
from a2a.types import Role

from app.agents.base import Agent, AgentContext

logger = logging.getLogger(__name__)


class AppAgentExecutor(AgentExecutor):
    def __init__(self, agent: Agent) -> None:
        self._agent = agent

    async def execute(self, context: RequestContext, event_queue: EventQueue) -> None:
        query = context.get_user_input()
        agent_context = AgentContext(
            task_id=context.task_id,
            context_id=context.context_id,
        )
        log_extra = {
            "agent": self._agent.name,
            "task_id": context.task_id,
            "context_id": context.context_id,
        }
        logger.info(
            "agent invocation started",
            extra={**log_extra, "query_length": len(query)},
        )

        chunks = [chunk async for chunk in self._agent.invoke(query, agent_context)]
        response = "".join(chunks)

        # MVP は即時応答(単一 Message)。長時間タスク対応時に Task イベントへ拡張する。
        await event_queue.enqueue_event(
            new_text_message(
                response,
                context_id=context.context_id,
                task_id=context.task_id,
                role=Role.ROLE_AGENT,
            )
        )
        logger.info(
            "agent invocation completed",
            extra={**log_extra, "response_length": len(response)},
        )

    async def cancel(self, context: RequestContext, event_queue: EventQueue) -> None:
        raise NotImplementedError("cancel is not supported (immediate-response agent)")
