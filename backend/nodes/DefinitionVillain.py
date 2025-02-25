# backend/nodes/DefinitionVillain.py
from .base_villain import VillainNode

NODE_ID_PREFIX = "FoWL" # Add a prefix
TYPE_NAME = "Definition"
NODE_FUNCTION = "Villain"
NODE_VERSION = "Light"
NODE_EMOJI = "👺"

class DefinitionVillain(VillainNode):
    """Definition Villain node for FoW Suite."""
    
    DESCRIPTION = "The Definition Villain Villain fights against unwanted visual elements—your guild’s shield in Light tier, no customization (Pro/Ultimate only)."
    RETURN_NAMES = (f"{TYPE_NAME} Conditioning", f"{TYPE_NAME} Text", )  # No spaces in return names


NODE_CLASS_MAPPINGS = {f"{NODE_ID_PREFIX}{TYPE_NAME}{NODE_FUNCTION}{NODE_VERSION}": DefinitionVillain}
