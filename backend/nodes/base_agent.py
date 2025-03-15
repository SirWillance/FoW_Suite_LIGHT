# backend/nodes/base_agent.py
import os
import json
from ...config.category import get_category
from .file_cache import FileCache

class AgentNode:
    RETURN_TYPES = ("CONDITIONING", "STRING",)
    FUNCTION = "encode"
    CATEGORY = get_category("4")

    @classmethod
    def INPUT_TYPES(cls):
        file_cache = FileCache()
        catalogue_data = file_cache.get_catalogue(getattr(cls, "CATALOGUE", "default_catalogue.json"), __file__)
        combined_data = {"catalogue": catalogue_data}
        return {
            "required": {
                "clip": ("CLIP", {"tooltip": "CLIP model for encoding"}),
                "user_input": ("STRING", {"multiline": True, "dynamicPrompts": True, "hidden": True}),
                "default_catalogue": ("STRING", {"default": json.dumps(combined_data), "hidden": True}),
            }
        }

    def encode(self, clip, user_input, default_catalogue):
        tokens = clip.tokenize(user_input)
        cond = clip.encode_from_tokens_scheduled(tokens)
        return (cond, user_input)