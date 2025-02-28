# FoW_Suite_LIGHT/backend/nodes/__init__.py
from ...config.constants import FOW_NAME, NODE_ID_PREFIX

from .PromptSplitterLight import PromptSplitterLight
from .PromptFusionLight import PromptFusionLight
from .PromptFusionNegative import PromptFusionNegative
from .ConditionFunnelLight import ConditionFunnelLight
from .SubjectWeight import SubjectWeight
from .EnvironmentWeight  import EnvironmentWeight
from .StyleWeight  import StyleWeight
from .ShotWeight  import ShotWeight
from .DetailsWeight  import DetailsWeight
from .ConditionWeight import ConditionWeight
from .StaticWeight import StaticWeight
from .DefinitionWeight import DefinitionWeight
from .ContentWeight import ContentWeight
from .DynamicWeight import DynamicWeight
from .TextWeight import TextWeight
from .StyleAgent import StyleAgent
from .ShotAgent import ShotAgent
from .DetailAgent import DetailAgent
from .StaticVillain import StaticVillain
from .DefinitionVillain import DefinitionVillain
from .ContentVillain import ContentVillain
from .StyleVillain import StyleVillain
from .PromptRefinerLight import PromptRefinerLight


def add_prefix(node_id):
    return f"{NODE_ID_PREFIX}{node_id}"

def create_display_name(emoji, node_name):
    return f"{emoji} {FOW_NAME} - {node_name}"

NODE_CLASS_MAPPINGS = {
    add_prefix("PromptSplitterLight"): PromptSplitterLight,
    add_prefix("PromptFusionLight"): PromptFusionLight,
    add_prefix("PromptFusionNegative"): PromptFusionNegative,
    add_prefix("ConditionFunnelLight"): ConditionFunnelLight,
    add_prefix("SubjectWeight"): SubjectWeight,
    add_prefix("EnvironmentWeight"): EnvironmentWeight,
    add_prefix("StyleWeight"): StyleWeight,
    add_prefix("ShotWeight"): ShotWeight,
    add_prefix("DetailsWeight"): DetailsWeight,
    add_prefix("ConditionWeight"): ConditionWeight,
    add_prefix("StaticWeight"): StaticWeight,
    add_prefix("DefinitionWeight"): DefinitionWeight,
    add_prefix("ContentWeight"): ContentWeight,
    add_prefix("DynamicWeight"): DynamicWeight,
    add_prefix("TextWeight"): TextWeight,
    add_prefix("StyleAgent"): StyleAgent,
    add_prefix("ShotAgent"): ShotAgent,
    add_prefix("DetailAgent"): DetailAgent,
    add_prefix("StaticVillain"): StaticVillain,
    add_prefix("DefinitionVillain"): DefinitionVillain,
    add_prefix("ContentVillain"): ContentVillain,
    add_prefix("StyleVillain"): StyleVillain,
    add_prefix("PromptRefinerLight"): PromptRefinerLight,
    
}




NODE_DISPLAY_NAME_MAPPINGS = {
    add_prefix("PromptSplitterLight"): create_display_name("🔱", "Prompt Splitter Light"),
    add_prefix("PromptFusionLight"): create_display_name("🧬", "Prompt Fusion Light"),
    add_prefix("PromptFusionNegative"): create_display_name("🧬", "Prompt Fusion Negative"),
    add_prefix("ConditionFunnelLight"): create_display_name("💫", "Condition Funnel Light"),
    add_prefix("SubjectWeight"): create_display_name("👤", "Subject Weight Light"),
    add_prefix("EnvironmentWeight"): create_display_name("🌍", "Environment Weight Light"),
    add_prefix("StyleWeight"): create_display_name("🎨", "Style Weight Light"),
    add_prefix("ShotWeight"): create_display_name("📷", "Shot Weight Light"),
    add_prefix("DetailsWeight"): create_display_name("🔍", "Details Weight Light"),
    add_prefix("ConditionWeight"): create_display_name("⚖️", "Condition Weight"),
    add_prefix("StaticWeight"): create_display_name("💀", "Static Weight Light"),
    add_prefix("DefinitionWeight"): create_display_name("👺", "Definition Weight Light"),
    add_prefix("ContentWeight"): create_display_name("🙈", "Content Weight Light"),
    add_prefix("DynamicWeight"): create_display_name("😈", "Dynamic Weight Light"),
    add_prefix("TextWeight"): create_display_name("⚖️", "Text Weight Light"),
    add_prefix("StyleAgent"): create_display_name("🎨", "Style Agent Light"),
    add_prefix("ShotAgent"): create_display_name("📷", "Shot Agent Light"),
    add_prefix("DetailAgent"): create_display_name("🔍", "Detail Agent Light"),
    add_prefix("StaticVillain"): create_display_name("💀", "Static Villain Light"),
    add_prefix("DefinitionVillain"): create_display_name("👺", "Definition Villain Light"),
    add_prefix("ContentVillain"): create_display_name("🙈", "Content Villain Light"),
    add_prefix("StyleVillain"): create_display_name("😈", "Style Villain Light"),
    add_prefix("PromptRefinerLight"): create_display_name("⌨️​", "Prompt Refiner Light"),
    
}

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS"]




