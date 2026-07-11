"""FastAPI エントリポイント。

起動: uv run uvicorn app.main:app --reload --port 8000
"""

import logging

from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.routes import (
    add_a2a_routes_to_fastapi,
    create_agent_card_routes,
    create_jsonrpc_routes,
)
from a2a.server.tasks import InMemoryTaskStore
from fastapi import FastAPI

from app.a2a.card import build_agent_card
from app.a2a.executor import AppAgentExecutor
from app.agents import EchoAgent
from app.api.routes import router as api_router
from app.logging_config import setup_logging
from app.settings import get_settings

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    settings = get_settings()
    setup_logging(settings.log_level)

    agent = EchoAgent()
    agent_card = build_agent_card(agent, settings)
    logger.info(
        "agent server initialized",
        extra={"agent": agent.name, "version": agent.version, "rpc_path": settings.rpc_path},
    )

    request_handler = DefaultRequestHandler(
        agent_executor=AppAgentExecutor(agent),
        task_store=InMemoryTaskStore(),
        agent_card=agent_card,
    )

    app = FastAPI(title=agent.name, version=agent.version)
    add_a2a_routes_to_fastapi(
        app,
        agent_card_routes=create_agent_card_routes(agent_card),
        jsonrpc_routes=create_jsonrpc_routes(request_handler, rpc_url=settings.rpc_path),
    )
    app.include_router(api_router)
    return app


app = create_app()
