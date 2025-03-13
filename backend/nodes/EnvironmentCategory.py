import re
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
from nodes import ConditioningConcat

from ...config.category import get_category

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

    @lru_cache(maxsize=128)
    def _process_text(self, clip, text):
        tokens = clip.tokenize(text)
        cond = clip.encode_from_tokens_scheduled(tokens)
        return cond

    def fuse(self, clip, **kwargs):
        if clip is None or not hasattr(clip, 'tokenize') or not hasattr(clip, 'encode_from_tokens_scheduled'):
            print(f"[ERROR] Invalid CLIP object for node {self.__class__.__name__}. Returning empty conditioning.")
            empty_text = ""
            return (clip.encode_from_tokens_scheduled(clip.tokenize(empty_text)) if clip else None, "")

        texts = []
        conditionings = []
        WEIGHT_REGEX = re.compile(r'(\s*,\s*\(:[-+]?[0-9]+(?:\.[0-9]+)?\))+\s*|^\s*\(:[-+]?[0-9]+(?:\.[0-9]+)?\)\s*')

        for field in self.INPUT_FIELDS:
            input_name = f"environment_{field}"
            text = kwargs.get(input_name)
            if isinstance(text, str) and text.strip():
                text = WEIGHT_REGEX.sub('', text)
                if text.strip():
                    texts.append(text)

        with ThreadPoolExecutor() as executor:
            futures = [executor.submit(self._process_text, clip, text) for text in texts]
            conditionings = [future.result() for future in futures]

        if conditionings:
            fused = conditionings[0]
            for cond in conditionings[1:]:
                fused = self.concat_node.concat(fused, cond)[0]
        else:
            empty_text = ""
            tokens = clip.tokenize(empty_text)
            fused = clip.encode_from_tokens_scheduled(tokens)

        combined_prompt = ", ".join(texts).replace(" FoWe ", ", ").replace(" FoW ", "").strip()
        return (fused, combined_prompt)

NODE_CLASS_MAPPINGS = {f"{NODE_ID_PREFIX}{TYPE_NAME}{NODE_FUNCTION}{NODE_VERSION}": EnvironmentCategory}