import re
from typing import Tuple
from ...config.category import get_category

NODE_ID_PREFIX = "FoWL" # Add a prefix
TYPE_NAME = "Prompt"
NODE_FUNCTION = "Splitter"
NODE_VERSION = "Light"
NODE_EMOJI = "🔱"

class PromptSplitterLight:
    MAX_OUTPUT_COUNT = 7  

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "prompt": ("STRING", {"multiline": True, "placeholder": "Paste Text/Prompt in here"}),  # Default example
                "inputcount": ("INT", {"default": 1, "min": 1, "max": cls.MAX_OUTPUT_COUNT, "hidden": True}),  # Default to 5 outputs
            },
            "optional": {},
        }

    RETURN_TYPES = tuple(["STRING"] * MAX_OUTPUT_COUNT)  # Allow up to MAX_OUTPUT_COUNT outputs
    RETURN_NAMES = tuple([f"Prompt Token {i+1}" for i in range(MAX_OUTPUT_COUNT)])
    FUNCTION = "split_prompt"
    CATEGORY = get_category("2") 
    DESCRIPTION = """Splits a text prompt into individual components based on common delimiters.

Define your 9 Categories and get them split up individually by this node into single tokens.

Key Features:
- Divides prompts into components based on delimiters, points, and parenthesis, "and", "with", "or", "featuring".
- Provides a dynamically adjustable number of output nozzles (up to 7).

"""
    def split_prompt(self, prompt: str, inputcount: int) -> Tuple[str, ...]:
        """Splits the input prompt into individual components."""

        if not prompt.strip():
            print("⚠️ Warning: Empty prompt received.")

            # Ensure inputcount is an integer before using it
            try:
                inputcount = int(inputcount)
            except ValueError:
                print(f"⚠️ Warning: 'inputcount' has an invalid format ({inputcount}). Using default value of 5.")
                inputcount = 1  # Default to 5 if conversion fails

            return tuple([""] * inputcount)  # ✅ Now inputcount is always an integer

        # Ensure inputcount is an integer
        try:
            inputcount = int(inputcount)
        except ValueError:
            print(f"⚠️ Warning: 'inputcount' has an invalid format ({inputcount}). Using default value of 5.")
            inputcount = 1  # Default to 5 if conversion fails

        # **Improved Delimiters:** Handles various punctuation and logical separators
        delimiters = r"\s*(?:,|\||\.|\band\b|\bor\b|\bwith\b|\bfeaturing\b)\s*"

        # Split and clean components
        components = [c.strip() for c in re.split(delimiters, prompt) if c.strip()]

        # **Limit output count dynamically**
        num_outputs = min(len(components), inputcount)
        output = components[:num_outputs]

        # **Ensure correct output length (pad with empty strings if needed)**
        output += [""] * (inputcount - len(output))

        print(f"🔹 Splitting prompt: '{prompt}' → {output}")
        return tuple(output)

NODE_CLASS_MAPPINGS = {f"{NODE_ID_PREFIX}{TYPE_NAME}{NODE_FUNCTION}{NODE_VERSION}": PromptSplitterLight}
