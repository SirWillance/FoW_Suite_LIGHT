# backend/nodes/base_villain.py
from .base_agent import AgentNode
from ...config.category import get_category

class VillainNode(AgentNode):
    CATEGORY = get_category("5")