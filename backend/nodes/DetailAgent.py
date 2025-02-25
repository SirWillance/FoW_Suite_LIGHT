# backend/nodes/DetailAgent.py
from .base_agent import AgentNode

NODE_ID_PREFIX = "FoWL" # Add a prefix
TYPE_NAME = "Detail"
NODE_FUNCTION = "Agent"
NODE_VERSION = "Light"
NODE_EMOJI = "🔍"

class DetailAgent(AgentNode):
    """Agent node for style selection and encoding."""
    
    RETURN_NAMES = (f"{TYPE_NAME} Conditioning", f"{TYPE_NAME} Text", )  # No spaces in return names
    DESCRIPTION = 	"""Fine detail and enhancement prompts for image refinement.
			Access a library of artistic details, textures, and quality enhancers.
			Examples: 'intricate details', 'high definition', 'masterfully crafted', etc.
			Use the widget to add professional finishing touches to your generations."""



NODE_CLASS_MAPPINGS = {f"{NODE_ID_PREFIX}{TYPE_NAME}{NODE_FUNCTION}{NODE_VERSION}": DetailAgent}
