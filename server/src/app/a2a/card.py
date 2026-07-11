"""エージェント定義から A2A Agent Card を生成する。"""

from a2a.types import AgentCapabilities, AgentCard, AgentInterface, AgentSkill
from a2a.utils.constants import PROTOCOL_VERSION_1_0, TransportProtocol

from app.agents.base import Agent
from app.settings import Settings


def build_agent_card(agent: Agent, settings: Settings) -> AgentCard:
    return AgentCard(
        name=agent.name,
        description=agent.description,
        version=agent.version,
        supported_interfaces=[
            AgentInterface(
                url=f"{settings.public_url}{settings.rpc_path}",
                protocol_binding=TransportProtocol.JSONRPC.value,
                protocol_version=PROTOCOL_VERSION_1_0,
            )
        ],
        capabilities=AgentCapabilities(streaming=True),
        default_input_modes=["text/plain"],
        default_output_modes=["text/plain"],
        skills=[
            AgentSkill(
                id=skill.id,
                name=skill.name,
                description=skill.description,
                tags=skill.tags,
                examples=skill.examples,
            )
            for skill in agent.skills
        ],
    )
