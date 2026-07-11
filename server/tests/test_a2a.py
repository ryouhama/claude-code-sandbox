"""A2A エンドポイントの疎通テスト。"""

import httpx
import pytest

from app.main import create_app


@pytest.fixture
async def client():
    transport = httpx.ASGITransport(app=create_app())
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


async def test_health(client: httpx.AsyncClient) -> None:
    res = await client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


async def test_agent_card(client: httpx.AsyncClient) -> None:
    res = await client.get("/.well-known/agent-card.json")
    assert res.status_code == 200
    card = res.json()
    assert card["name"] == "sandbox-agent"
    assert [s["id"] for s in card["skills"]] == ["echo"]
    assert card["supportedInterfaces"][0]["url"] == "http://localhost:8000/a2a"


async def test_send_message_echoes_text(client: httpx.AsyncClient) -> None:
    res = await client.post(
        "/a2a",
        headers={"A2A-Version": "1.0"},
        json={
            "jsonrpc": "2.0",
            "id": 1,
            "method": "SendMessage",
            "params": {
                "message": {
                    "messageId": "msg-1",
                    "role": "ROLE_USER",
                    "parts": [{"text": "hello a2a"}],
                }
            },
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert body["id"] == 1
    message = body["result"]["message"]
    assert message["role"] == "ROLE_AGENT"
    assert message["parts"][0]["text"] == "hello a2a"
