from ...config.category import get_category
import re  # Used for regex

NODE_ID_PREFIX = "FoWL" # Add a prefix
TYPE_NAME = "Condition"
NODE_FUNCTION = "Funnel"
NODE_VERSION = "Light"
NODE_EMOJI = "💫"

class ConditionFunnelLight:
    """
    Force of Will Suite Light - ConditionFunnelLight Node

    This node in the Force of Will (FoW) Suite Light tier combines text prompts and encodes them into a single conditioning object, like your guild’s magic channel for ComfyUI beginners. It’s your power-up for fusing raw prompts in `PromptRefinerLight`, using predefined libraries (no customized tokens—upgrade to Pro (€25) or Ultimate (€100) for advanced fusion). Perfect for newbie workflows with up to 5 text inputs.

    Args:
        clip (CLIP): The CLIP model for encoding—your guild’s magic wand for prompts.
        Text 1–5 (STRING, optional): Up to 5 text inputs for combining (multiline, hidden by default for simplicity).

    Returns:
        tuple: (Combined Conditioning, Combined Prompt) for image generation in ComfyUI, using Light tier simplicity.

    Note:
        Install via ComfyUI Manager (“Install Custom Nodes” → “Force of Will Suite Light”) or clone from GitHub (https://github.com/SirWillance/FoW_Suite_LIGHT). Help me level up on Twitch (https://www.twitch.tv/sirwillance) for free `FoW_Suite_Standard` (€15) via Discord (https://discord.gg/BHSxf8HB)!
    """

    MAX_INPUT_COUNT = 8

    @classmethod
    def INPUT_TYPES(cls):
        inputs = {
            "required": {
                "clip": ("CLIP",),  # Add CLIP input
            },
            "optional": {},
        }
        return inputs


    RETURN_TYPES = ("CONDITIONING", "STRING",) #Return both condition and string,
    RETURN_NAMES = ("Combined Conditioning","Combined Prompt",)
    FUNCTION = "fuse"
    CATEGORY = get_category("2")
    DESCRIPTION = """Combines raw text prompts into a single conditioning object for ComfyUI—your guild’s Light tier channel, no customization (Pro/Ultimate only).
    Join me on Twitch (https://www.twitch.tv/sirwillance) for Pro/Ultimate insights!"""

    def fuse(self, clip, **kwargs):
        #Used for the prompt.
        text_inputs = []
     

        # Iterate over the received inputs in sorted order.
        for i in range(1, self.MAX_INPUT_COUNT + 1):
            k = f"Text {i}"  # Use keys from text.
            v = kwargs.get(k)

            # Only process string input ports.
            if isinstance(v, str):
                # Use regular expression to find and remove empty weights (e.g., "(:1)")
                v = re.sub(r'(\s*,\s*\(:[-+]?[0-9]+(?:\.[0-9]+)?\))+\s*|^\s*\(:[-+]?[0-9]+(?:\.[0-9]+)?\)\s*', '', v)
                #Override the value, check if the current weight is given, else apply the given weight.
                if v.strip():  # Only append if v is not empty after stripping whitespace
                    text_inputs.append(v)

            else:
                if(v != None):
                    print("Incorrect Input Format, skipping this line and going to the next one")
                    continue

        # Merge the inputs. Will always generate an output, even if empty.
        #Create new conditional and return.
        prompt = ", ".join(text_inputs)
        tokens = clip.tokenize(prompt)
        cond = clip.encode_from_tokens_scheduled(tokens)

        return (cond, prompt)

NODE_CLASS_MAPPINGS = {f"{NODE_ID_PREFIX}{TYPE_NAME}{NODE_FUNCTION}{NODE_VERSION}": ConditionFunnelLight,}
