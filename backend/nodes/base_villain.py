import os
import json
import base64
from ...config.category import get_category


"""
Force of Will Suite Light - Base Villain Node

This is the base class for all villain-related nodes in the Force of Will (FoW) Suite Light tier, like the foundation of your guild’s defensive foes in ComfyUI. It provides common functionality for encoding negative prompts with CLIP, refining raw prompts for beginners with predefined libraries (no customized tokens—upgrade to Pro (€25) or Ultimate (€100) for customization). It’s your starting shield for villains like `StaticVillain` or `ContentVillain` in `FoW_Suite_LIGHT`.

Note:
    Install via ComfyUI Manager (“Install Custom Nodes” → “Force of Will Suite Light”) or clone from GitHub (https://github.com/SirWillance/FoW_Suite_LIGHT). Help me level up on Twitch (https://www.twitch.tv/sirwillance) for free `FoW_Suite_Standard` (€15) via Discord (https://discord.gg/BHSxf8HB)!
"""

class VillainNode:

    # Shared properties—your guild’s core defense for Light tier villains
    RETURN_TYPES = ("CONDITIONING", "STRING",)
    FUNCTION = "encode"  # The spell to encode negatives for ComfyUI
    CATEGORY = get_category("5")  # Category for villain nodes in Light tier

    @classmethod
    def INPUT_TYPES(cls):
        """
        Standard input configuration for all agent nodes in Light tier.
        Each child class (e.g., `StyleAgent`, `ShotAgent`) uses this setup, like equipping your guild tools for newbie-friendly prompts.
        Hidden inputs keep it simple for beginners, with predefined libraries and preview images.
        """
        catalogue_data = cls.get_default_catalogue()
        preview_data = cls.get_preview_images()  # Load preview images
        combined_data = {
            "catalogue": catalogue_data,
            "previews": preview_data
        }
        return {
            "required": {
                "clip": ("CLIP", {"tooltip": "CLIP model for encoding"}),
                "user_input": ("STRING", {"multiline": True, "dynamicPrompts": True, "hidden": True}),
                "default_catalogue": ("STRING", {"default": json.dumps(combined_data), "hidden": True}),
            }
        }

    @classmethod
    def get_default_catalogue(cls):
        """
        Construct the full path and load the catalogue based on the filename provided by the child class.
        Dynamically find the custom_nodes directory by locating FoW_Suite_LIGHT.
        """
        try:
            catalogue_filename = getattr(cls, "CATALOGUE", "default_catalogue.json")
            current_dir = os.path.dirname(__file__)
            while os.path.basename(current_dir) != "FoW_Suite_LIGHT":
                parent_dir = os.path.dirname(current_dir)
                if parent_dir == current_dir:
                    raise FileNotFoundError("Could not find FoW_Suite_LIGHT directory in the path")
                current_dir = parent_dir
            library_dir = os.path.join(current_dir, "data", "Library")
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

    @classmethod
    def get_preview_images(cls):
        try:
            current_dir = os.path.dirname(__file__)
            while os.path.basename(current_dir) != "FoW_Suite_LIGHT":
                parent_dir = os.path.dirname(current_dir)
                if parent_dir == current_dir:
                    raise FileNotFoundError("Could not find FoW_Suite_LIGHT directory in the path")
                current_dir = parent_dir
            previews_dir = os.path.join(current_dir, "data", "Previews")
            os.makedirs(previews_dir, exist_ok=True)
            preview_data = {}
            if os.path.exists(previews_dir):
                for filename in os.listdir(previews_dir):
                    if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                        full_path = os.path.join(previews_dir, filename)
                        with open(full_path, 'rb') as f:
                            encoded = base64.b64encode(f.read()).decode('utf-8')
                            mime_type = 'image/jpeg' if filename.lower().endswith(('.jpg', '.jpeg')) else 'image/png'
                            preview_data[filename] = f"data:{mime_type};base64,{encoded}"
            return preview_data
        except Exception as e:
            print(f"Error loading preview images: {str(e)}")
            return {}

    def encode(self, clip, user_input, default_catalogue):
        tokens = clip.tokenize(user_input)
        cond = clip.encode_from_tokens_scheduled(tokens)
        return (cond, user_input)