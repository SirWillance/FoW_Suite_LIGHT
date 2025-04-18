# backend/nodes/StaticVillain.py
from .base_villain import VillainNode

NODE_ID_PREFIX = "FoWL" # Add a prefix
TYPE_NAME = "Static"
NODE_FUNCTION = "Villain"
NODE_VERSION = "Light"
NODE_EMOJI = "💀"

class StaticVillain(VillainNode):
    """Static Villain node for FoW Suite."""

    CATALOGUE = "💀 Static Catalogue - Light.json"   
    DESCRIPTION = """The Static Villain fights against unwanted visual elements—your guild’s shield in Light tier.
Increase the Catalogue by increasing your Tier on https://www.twitch.tv/sirwillance/"""
    RETURN_NAMES = (f"{TYPE_NAME} Conditioning", f"{TYPE_NAME} Text", )  # No spaces in return names


NODE_CLASS_MAPPINGS = {f"{NODE_ID_PREFIX}{TYPE_NAME}{NODE_FUNCTION}{NODE_VERSION}": StaticVillain}