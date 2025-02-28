# backend/nodes/StyleVillain.py
from .base_villain import VillainNode

NODE_ID_PREFIX = "FoWL" # Add a prefix
TYPE_NAME = "Style"
NODE_FUNCTION = "Villain"
NODE_VERSION = "Light"
NODE_EMOJI = "😈"

class StyleVillain(VillainNode):
    """Style Villain node for FoW Suite."""
    
    DESCRIPTION = """The Style Villain fights against unwanted visual elements—your guild’s shield in Light tier.
Increase the Catalogue by increasing your Tier on https://www.twitch.tv/sirwillance/"""
    RETURN_NAMES = ("Dynamic Conditioning", f"{TYPE_NAME} Text", )  # No spaces in return names


NODE_CLASS_MAPPINGS = {f"{NODE_ID_PREFIX}{TYPE_NAME}{NODE_FUNCTION}{NODE_VERSION}": StyleVillain}
