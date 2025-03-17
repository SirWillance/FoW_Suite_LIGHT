from ...config.category import get_category
from nodes import ConditioningConcat
from ...config.constants import  NODE_ID_PREFIX

TYPE_NAME = "Environment"
NODE_FUNCTION = "Category"
NODE_VERSION = "Light"
NODE_ID_PREFIX = "FoWL" 

class EnvironmentCategory:
    INPUT_FIELDS = ["setting", "structure_props", "elements_lighting"]

    CATEGORY = get_category("4")
    RETURN_TYPES = ("CONDITIONING", "STRING")
    RETURN_NAMES = ("Environment Conditioning", "Environment Prompt")
    FUNCTION = "fuse"
    DESCRIPTION = """Refines environment prompts for image generation. It creates the context and makes the scene feel real or immersive."""

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "clip": ("CLIP",),
            },
            "optional": {
                **{f"environment_{field}": ("STRING", {"multiline": True, "default": "", "hidden": True}) for field in cls.INPUT_FIELDS},
            },
        }

    def __init__(self):
        self.concat_node = ConditioningConcat()

    def fuse(self, clip, **kwargs):
        texts = []
        conditionings = []

        for field in self.INPUT_FIELDS:
            input_name = f"environment_{field}"
            text = kwargs.get(input_name, "").strip()
            if text:  # Skip empty texts
                # Strip custom delimiters and clean whitespace
                cleaned_text = text.replace(" FoW ", ", ").replace(" FoWs ", ", ").replace(" FoWe ", ", ").strip()
                if cleaned_text:
                    texts.append(cleaned_text)
                    cond = clip.encode_from_tokens_scheduled(clip.tokenize(cleaned_text))
                    conditionings.append(cond)

        if conditionings:
            fused = conditionings[0]
            for cond in conditionings[1:]:
                fused = self.concat_node.concat(fused, cond)[0]
        else:
            empty_text = ""
            fused = clip.encode_from_tokens_scheduled(clip.tokenize(empty_text))

        combined_prompt = ", ".join(texts) if texts else ""
        return (fused, combined_prompt)

NODE_CLASS_MAPPINGS = {f"{NODE_ID_PREFIX}{TYPE_NAME}{NODE_FUNCTION}{NODE_VERSION}": EnvironmentCategory}
