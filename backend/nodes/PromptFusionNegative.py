from ...config.category import get_category
from nodes import ConditioningConcat

NODE_ID_PREFIX = "FoWL" # Add a prefix
TYPE_NAME = "Prompt"
NODE_FUNCTION = "Fusion"
NODE_VERSION = "Negative"
NODE_EMOJI = "🧬"


class PromptFusionNegative:
    MAX_INPUT_COUNT = 4

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                # No inputcount widget here
            },
            "optional": {
                # Inputs are dynamically added based on the frontend
            },
        }
	

    RETURN_TYPES = ("CONDITIONING",)
    RETURN_NAMES = ("Fused Prompt",)
    FUNCTION = "fuse"
    CATEGORY = get_category("2")
    DESCRIPTION =  """Fuses Your Negative Prompt Categories into One Single Negative Conditioning Output. 

Note: The Pro-Version will add a general version with infit Inputs, join me on https://www.twitch.tv/sirwillance for more informations"""

    def __init__(self):
        self.concat_node = ConditioningConcat()

    def fuse(self, **kwargs):
        # Get initial conditioning from Condition 1
        result = kwargs.get("Static")
        if result is None:
            raise ValueError("Static input is required.")

        # Process all other inputs in order
        conditions = ["Content", "Definition", "Dynamic"]
        for i in range(1, self.MAX_INPUT_COUNT - 4):
            conditions.append(f"Extra_{i}")

        for condition_name in conditions:
            condition = kwargs.get(condition_name)
            if condition is not None:
                result = self.concat_node.concat(result, condition)[0]

        return (result,)

NODE_CLASS_MAPPINGS = {f"{NODE_ID_PREFIX}{TYPE_NAME}{NODE_FUNCTION}{NODE_VERSION}": PromptFusionNegative}

