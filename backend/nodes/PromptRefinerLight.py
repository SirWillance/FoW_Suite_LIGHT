# backend/nodes/PromptRefinerPro.py
import re
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
from ...config.category import get_category
from nodes import ConditioningConcat


NODE_ID_PREFIX = "FoWL"
TYPE_NAME = "Prompt"
NODE_FUNCTION = "Refiner"
NODE_VERSION = "Light"
NODE_EMOJI = "⌨"

# Precompile regex for weight removal
WEIGHT_REGEX = re.compile(r'(\s*,\s*\(:[-+]?[0-9]+(?:\.[0-9]+)?\))+\s*|^\s*\(:[-+]?[0-9]+(?:\.[0-9]+)?\)\s*')

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

    @lru_cache(maxsize=128)  # Cache up to 128 unique text inputs
    def _process_text(self, clip, text):
        """Helper function to tokenize and encode a single text."""
        tokens = clip.tokenize(text)
        cond = clip.encode_from_tokens_scheduled(tokens)
        return cond

    def fuse(self, clip, **kwargs):
        # Step 1: Process positive text inputs
        positive_texts = []
        positive_conditionings = []

        for input_name in self.POSITIVE_INPUTS:
            text = kwargs.get(input_name)
            if isinstance(text, str) and text.strip():  # Skip empty texts
                # Remove empty weights using precompiled regex
                text = WEIGHT_REGEX.sub('', text)
                if text.strip():  # Check if text is still not empty after removing weights
                    positive_texts.append(text)

        # Step 2: Process negative text inputs
        negative_texts = []
        negative_conditionings = []

        for input_name in self.NEGATIVE_INPUTS:
            text = kwargs.get(input_name)
            if isinstance(text, str) and text.strip():  # Skip empty texts
                # Remove empty weights using precompiled regex
                text = WEIGHT_REGEX.sub('', text)
                if text.strip():  # Check if text is still not empty after removing weights
                    negative_texts.append(text)

        # Step 3: Tokenize and encode texts in parallel
        with ThreadPoolExecutor() as executor:
            # Process positive texts
            positive_futures = [executor.submit(self._process_text, clip, text) for text in positive_texts]
            positive_conditionings = [future.result() for future in positive_futures]

            # Process negative texts
            negative_futures = [executor.submit(self._process_text, clip, text) for text in negative_texts]
            negative_conditionings = [future.result() for future in negative_futures]

        # Step 4: Combine positive conditionings
        if positive_conditionings:
            positive_fused = positive_conditionings[0]
            for cond in positive_conditionings[1:]:
                positive_fused = self.concat_node.concat(positive_fused, cond)[0]
        else:
            # If no positive inputs, create an empty conditioning tensor
            empty_text = ""
            tokens = clip.tokenize(empty_text)
            cond = clip.encode_from_tokens_scheduled(tokens)
            positive_fused = cond

        # Step 5: Combine negative conditionings
        if negative_conditionings:
            negative_fused = negative_conditionings[0]
            for cond in negative_conditionings[1:]:
                negative_fused = self.concat_node.concat(negative_fused, cond)[0]
        else:
            # If no negative inputs, create an empty conditioning tensor
            empty_text = ""
            tokens = clip.tokenize(empty_text)
            cond = clip.encode_from_tokens_scheduled(tokens)
            negative_fused = cond

        # Step 6: Combine texts into prompts (for output)
        combined_positive_prompt = ", ".join(positive_texts) if positive_texts else ""
        combined_negative_prompt = ", ".join(negative_texts) if negative_texts else ""

        return (positive_fused, negative_fused, combined_positive_prompt, combined_negative_prompt)


NODE_CLASS_MAPPINGS = {f"{NODE_ID_PREFIX}{TYPE_NAME}{NODE_FUNCTION}{NODE_VERSION}": PromptRefinerLight}
