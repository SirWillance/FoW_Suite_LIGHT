# backend/nodes/StyleAgent.py
import os
import json
import base64
from .base_agent import AgentNode
from .path_utils import get_suite_root

NODE_ID_PREFIX = "FoWL"
TYPE_NAME = "Style"
NODE_FUNCTION = "Agent"
NODE_VERSION = "Light"
NODE_EMOJI = "🎨"

# Global preview cache
_preview_cache = None

def load_preview_images():
    """Load previews once and cache them."""
    global _preview_cache
    if _preview_cache is None:
        try:
            suite_root = get_suite_root(__file__)
            previews_dir = os.path.join(suite_root, "data", "Previews")
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
            _preview_cache = preview_data
            print(f"Loaded {len(_preview_cache)} preview images into cache")
        except Exception as e:
            print(f"Error loading preview images: {str(e)}")
            _preview_cache = {}
    return _preview_cache

def list_preview_filenames():
    """Return only the list of preview filenames."""
    global _preview_cache
    if _preview_cache is None:
        load_preview_images()  # Ensure cache is loaded
    return list(_preview_cache.keys())

class StyleAgent(AgentNode):
    CATALOGUE = "🎨 Style Catalogue - Light.json"
    USES_PREVIEWS = True
    RETURN_NAMES = (f"{TYPE_NAME} Conditioning", f"{TYPE_NAME} Text",)
    DESCRIPTION = """Art style and visual aesthetic guide for image generation.
    Access a curated collection of artistic styles, movements, and visual themes.
    Examples: 'Art Deco', 'Chibi', 'cyberpunk', etc.
    Increase the Catalogue by increasing your Tier on https://www.twitch.tv/sirwillance/"""

    # Override FUNCTION to use our custom encode method
    FUNCTION = "encode"

    # Track if we've initialized the cache for the first node
    _cache_initialized = False

    @classmethod
    def INPUT_TYPES(cls):
        catalogue_data = cls.get_default_catalogue()
        # Ensure previews are loaded
        load_preview_images()
        # First node gets full base64 data, others get filenames
        if not cls._cache_initialized:
            cls._cache_initialized = True
            preview_data = _preview_cache  # Full base64 data for first node
            print("First StyleAgent node: Including base64 preview data in preview_images")
        else:
            preview_data = list_preview_filenames()  # Only filenames for others
            print("Subsequent StyleAgent node: Including only filenames in preview_images")
        return {
            "required": {
                "clip": ("CLIP", {"tooltip": "CLIP model for encoding"}),
                "user_input": ("STRING", {"multiline": True, "dynamicPrompts": True, "hidden": True}),
                "default_catalogue": ("STRING", {"default": json.dumps(catalogue_data), "hidden": True}),
                "preview_images": ("STRING", {"default": json.dumps(preview_data), "hidden": True}),
            }
        }

    @classmethod
    def get_preview_images(cls):
        return _preview_cache  # Provide access to the cache

    def __init__(self):
        super().__init__()
        # Cache is already loaded by INPUT_TYPES, no need to reload here

    def encode(self, clip, user_input, default_catalogue, preview_images):
        """
        Encode the user_input tokens using the CLIP model.
        preview_images is ignored here as it's only needed for the frontend.
        """
        # The backend only cares about encoding the user_input (tokens from the frontend)
        tokens = clip.tokenize(user_input)
        cond = clip.encode_from_tokens_scheduled(tokens)
        return (cond, user_input)

NODE_CLASS_MAPPINGS = {f"{NODE_ID_PREFIX}{TYPE_NAME}{NODE_FUNCTION}{NODE_VERSION}": StyleAgent}
