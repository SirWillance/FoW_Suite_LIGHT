# FoW_Suite/nodes/TextEqualizer.py
from ...config.category import get_category

TYPE_NAME = "Prompt"
NODE_FUNCTION = "Equalizer"
NODE_VERSION = "Light"
NODE_ID_PREFIX = "FoWL"

class PromptEqualizer:

    @classmethod
    def INPUT_TYPES(cls):

        return {
            "required": {
                "clip": ("CLIP", {"tooltip": "CLIP model for encoding"}),
                "user_input": ("STRING", {"multiline": True, "dynamicPrompts": True, "hidden": True}),
            }
        }

    RETURN_TYPES = ("CONDITIONING", "STRING")
    RETURN_NAMES = ("Combined Conditioning", "Weighted Prompt")
    FUNCTION = "fuse"
    CATEGORY = get_category("3")
    DESCRIPTION = """Combines text prompts with adjustable weights into a single conditioning object."""

    def fuse(self, clip, user_input):
        tokens = clip.tokenize(user_input)
        cond = clip.encode_from_tokens_scheduled(tokens)
        return (cond, user_input)  # Return both CONDITIONING and STRING

NODE_CLASS_MAPPINGS = {f"{NODE_ID_PREFIX}{TYPE_NAME}{NODE_FUNCTION}{NODE_VERSION}": PromptEqualizer}