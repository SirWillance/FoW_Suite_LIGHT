# backend/nodes/ShotAgent.py
from .base_agent import AgentNode

NODE_ID_PREFIX = "FoWL" # Add a prefix
TYPE_NAME = "Shot"
NODE_FUNCTION = "Agent"
NODE_VERSION = "Light"
NODE_EMOJI = "📷"

class ShotAgent(AgentNode):
    """Agent node for style selection and encoding."""
    
    RETURN_NAMES = (f"{TYPE_NAME} Conditioning", f"{TYPE_NAME} Text", )  # No spaces in return names   
    DESCRIPTION =	 """Camera and composition guide for image generation.
Access a curated collection of cinematic shots, angles, and composition styles.
Examples: 'extreme close-up', 'birds-eye view', 'Dutch angle', etc.
Increase the Catalogue by increasing your Tier on https://www.twitch.tv/sirwillance/"""



NODE_CLASS_MAPPINGS = {f"{NODE_ID_PREFIX}{TYPE_NAME}{NODE_FUNCTION}{NODE_VERSION}": ShotAgent}