import os
import json
import base64
from ...config.category import get_category

class AgentNode:
    """
    Base class for all agent-related nodes in the Force of Will Suite Light tier.
    Acts as your guild’s magical foundation, providing CLIP encoding and conditioning for agents like `StyleAgent`.
    Perfect for newbie prompt enhancement in ComfyUI, using predefined libraries only (custom tokens available in Pro/Ultimate).
    """

    RETURN_TYPES = ("CONDITIONING", "STRING",)
    FUNCTION = "encode"
    CATEGORY = get_category("4")

    @classmethod
    def INPUT_TYPES(cls):

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