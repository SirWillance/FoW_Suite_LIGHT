from ...config.category import get_category

NODE_ID_PREFIX = "FoWL" # Add a prefix
TYPE_NAME = "Text"
NODE_FUNCTION = "Weight"
NODE_VERSION = "Light"
NODE_EMOJI = "⚖"

class TextWeight:
    """
    Combines a multiline text prompt with a weight slider and outputs the
    resulting weighted text string in the format '(text:weight)'.
    """

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
		"Weight": ("FLOAT", {
                    "default": 1.0,
                    "min": 0.0,
                    "max": 2.0,
                    "step": 0.05,
                    "display": "slider"
                }),
                
		"text": ("STRING", {"multiline": True}),
                
            },
        }


    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("Weighted Text",)
    FUNCTION = "apply_weight"
    CATEGORY = get_category("3")
    DESCRIPTION = "Combines a multiline text prompt with a weight slider."

    def apply_weight(self, Weight, text):
        weighted_text = f"({text}:{Weight})"
        return (weighted_text,)




NODE_CLASS_MAPPINGS = {f"{NODE_ID_PREFIX}{TYPE_NAME}{NODE_FUNCTION}{NODE_VERSION}": TextWeight,}
