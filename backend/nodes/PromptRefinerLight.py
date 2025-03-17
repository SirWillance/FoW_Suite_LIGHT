from ...config.category import get_category
from nodes import ConditioningConcat
from ...config.constants import  NODE_ID_PREFIX


NODE_ID_PREFIX = "FoWL"
TYPE_NAME = "Prompt"
NODE_FUNCTION = "Refiner"
NODE_VERSION = "Light"
NODE_EMOJI = "⌨"

class PromptRefinerLight:
    # Define the exact input names for positive and negative groups
    POSITIVE_INPUTS = ["positive_subject", "positive_environment", "positive_style", "positive_shot", "positive_detail"]  # Text 1 to 5
    NEGATIVE_INPUTS = ["negative_static", "negative_content", "negative_definition", "negative_dynamic"]  # Text 6 to 9

    """
    Standalone node for refining prompts with user interaction.
    """

    # Define node properties
    CATEGORY = get_category("3")  # Category for the node
    RETURN_TYPES = ("CONDITIONING", "CONDITIONING", "STRING", "STRING")
    RETURN_NAMES = ("Positive Conditioning", "Negative Conditioning", "Combined Positive Prompt", "Combined Negative Prompt")
    FUNCTION = "fuse"  # The main function to execute
    DESCRIPTION = """The only Node interface u will need! Enter your Positive and your Negative Prompt in here.
Standard-Version includes Tokeniztion of your prompt. Pro-Version enhancements feature token weighting plus much much more."""

    @classmethod
    def INPUT_TYPES(cls):
        inputs = {
            "required": {
                "clip": ("CLIP",),  # CLIP model for text encoding
            },
            "optional": {
                **{input_name: ("STRING", {"multiline": True, "default": "", "hidden": True}) for input_name in cls.POSITIVE_INPUTS},
                **{input_name: ("STRING", {"multiline": True, "default": "", "hidden": True}) for input_name in cls.NEGATIVE_INPUTS},
            },
        }
        return inputs

    def __init__(self):
        self.concat_node = ConditioningConcat()

    def fuse(self, clip, **kwargs):
        # Step 1: Process positive text inputs
        positive_texts = []
        positive_conditionings = []

        for input_name in self.POSITIVE_INPUTS:
            text = kwargs.get(input_name, "").strip()
            if text:  # Skip empty texts
                # Strip custom delimiters and clean whitespace
                cleaned_text = text.replace(" FoW ", ", ").replace(" FoWs ", ", ").replace(" FoWe ", ", ").strip()
                if cleaned_text:
                    positive_texts.append(cleaned_text)
                    cond = clip.encode_from_tokens_scheduled(clip.tokenize(cleaned_text))
                    positive_conditionings.append(cond)

        # Step 2: Process negative text inputs
        negative_texts = []
        negative_conditionings = []

        for input_name in self.NEGATIVE_INPUTS:
            text = kwargs.get(input_name, "").strip()
            if text:  # Skip empty texts
                # Strip custom delimiters and clean whitespace
                cleaned_text = text.replace(" FoW ", ", ").replace(" FoWs ", ", ").replace(" FoWe ", ", ").strip()
                if cleaned_text:
                    negative_texts.append(cleaned_text)
                    cond = clip.encode_from_tokens_scheduled(clip.tokenize(cleaned_text))
                    negative_conditionings.append(cond)

        # Step 3: Combine positive conditionings
        if positive_conditionings:
            positive_fused = positive_conditionings[0]
            for cond in positive_conditionings[1:]:
                positive_fused = self.concat_node.concat(positive_fused, cond)[0]
        else:
            empty_text = ""
            positive_fused = clip.encode_from_tokens_scheduled(clip.tokenize(empty_text))

        # Step 4: Combine negative conditionings
        if negative_conditionings:
            negative_fused = negative_conditionings[0]
            for cond in negative_conditionings[1:]:
                negative_fused = self.concat_node.concat(negative_fused, cond)[0]
        else:
            empty_text = ""
            negative_fused = clip.encode_from_tokens_scheduled(clip.tokenize(empty_text))

        # Step 5: Combine texts into prompts (for output)
        combined_positive_prompt = ", ".join(positive_texts) if positive_texts else ""
        combined_negative_prompt = ", ".join(negative_texts) if negative_texts else ""

        return (positive_fused, negative_fused, combined_positive_prompt, combined_negative_prompt)

NODE_CLASS_MAPPINGS = {f"{NODE_ID_PREFIX}{TYPE_NAME}{NODE_FUNCTION}{NODE_VERSION}": PromptRefinerLight}
