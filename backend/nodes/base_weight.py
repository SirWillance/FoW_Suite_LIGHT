# backend/nodes/base_weight.py
from ...config.category import get_category

"""
Force of Will Suite Light - Base Weight Node

This is the base class for all weight-related nodes in the Force of Will (FoW) Suite Light tier, like the foundation of your guild’s strength boosters in ComfyUI. It provides common functionality for applying weights to conditioning inputs, enhancing raw prompts for beginners with simple adjustments (no sliders or customization in Light—upgrade to Pro (€25) or Ultimate (€100) for advanced weighting). It’s your starting armor for weights like `SubjectWeight` or `StyleWeight` in `FoW_Suite_LIGHT`.

Note:
    Install via ComfyUI Manager (“Install Custom Nodes” → “Force of Will Suite Light”) or clone from GitHub (https://github.com/SirWillance/FoW_Suite_LIGHT). Help me level up on Twitch (https://www.twitch.tv/sirwillance) for free `FoW_Suite_Standard` (€15) via Discord (https://discord.gg/BHSxf8HB)!
"""

class WeightNode:
    """
    Base class for all weight-related nodes in the Force of Will Suite Light tier.

    Acts as your guild’s strength foundation, applying basic weights to conditioning for weights like `SubjectWeight`. Perfect for newbie prompt emphasis in ComfyUI, using simple defaults only (advanced sliders and customization available in Pro/Ultimate).
    """

    # Shared properties—your guild’s core strength for Light tier weights
    RETURN_TYPES = ("CONDITIONING",)
    FUNCTION = "apply_weight"  # The spell to boost prompt influence
    CATEGORY = get_category("1")  # Category for weight nodes in Light tier
    DESCRIPTION = """Increases the influence of your prompt by adjusting the weight"""

    @classmethod
    def INPUT_TYPES(cls):
        """
        Standard input configuration for all weight nodes in Light tier.

        Each child class (e.g., `SubjectWeight`, `StyleWeight`) uses this setup, like equipping your guild tools for newbie-friendly prompts. Default weight (1.0) keeps it simple for beginners, no customization here (sliders in Pro/Ultimate).
        """
        return {
            "required": {
                "RAW Condition": ("CONDITIONING",),  # Will be renamed by child classes
                "Weight": ("FLOAT", {
                    "default": 1,
                    "min": 0,
                    "max": 2.0,
                    "step": 0.1,
                    "display": "slider"
                }),
            },
        }

    def apply_weight(self, Weight=1.0, **kwargs):
        """
        Core weight application logic shared by all weight nodes.
        Args:
            Weight: The weight value to apply (default: 1.0)
            **kwargs: Dictionary containing the conditioning input with varying names
                     (e.g., 'Style', 'Shot', etc.)
        """
        try:
            # Get the conditioning input (first value from kwargs)
            condition = next(iter(kwargs.values()))
            
            weighted = []
            for tensor, metadata in condition:
                weighted.append((tensor.clone() * Weight, metadata))
            return (weighted,)
        except Exception as e:
            print(f"🔥 Weight Error: {e}")
            # Return the original condition from kwargs if available, otherwise empty list
            return (next(iter(kwargs.values()), []),)