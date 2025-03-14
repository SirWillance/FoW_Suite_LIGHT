# backend/nodes/base_villain.py
import os
import json
from ...config.category import get_category
from .path_utils import get_suite_root

class VillainNode:
    RETURN_TYPES = ("CONDITIONING", "STRING",)
    FUNCTION = "encode"
    CATEGORY = get_category("5")

    @classmethod
    def INPUT_TYPES(cls):
        catalogue_data = cls.get_default_catalogue()
        return {
            "required": {
                "clip": ("CLIP", {"tooltip": "CLIP model for encoding"}),
                "user_input": ("STRING", {"multiline": True, "dynamicPrompts": True, "hidden": True}),
                "default_catalogue": ("STRING", {"default": json.dumps(catalogue_data), "hidden": True}),
            }
        }

    @classmethod
    def get_default_catalogue(cls):
        try:
            catalogue_filename = getattr(cls, "CATALOGUE", "default_catalogue.json")
            suite_root = get_suite_root(__file__)
            library_dir = os.path.join(suite_root, "data", "Library")
            os.makedirs(library_dir, exist_ok=True)
            full_path = os.path.join(library_dir, catalogue_filename)
            if os.path.exists(full_path):
                with open(full_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            else:
                print(f"Warning: Catalogue file not found at {full_path}. Returning empty catalogue.")
                return {}
        except Exception as e:
            print(f"Error loading default catalogue: {str(e)}")
            return {}

    def encode(self, clip, user_input, default_catalogue):
        tokens = clip.tokenize(user_input)
        cond = clip.encode_from_tokens_scheduled(tokens)
        return (cond, user_input)