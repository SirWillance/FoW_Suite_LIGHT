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
from .SubjectCategory import SubjectCategory
from .EnvironmentCategory import EnvironmentCategory
from .StyleAgent import StyleAgent
from .ShotAgent import ShotAgent
from .DetailAgent import DetailAgent
from .StaticVillain import StaticVillain
from .DefinitionVillain import DefinitionVillain
from .ContentVillain import ContentVillain
from .StyleVillain import StyleVillain
from .PromptRefinerLight import PromptRefinerLight
from .PromptEqualizerLight import PromptEqualizer



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
    add_prefix("SubjectCategory"): SubjectCategory,
    add_prefix("EnvironmentCategory"): EnvironmentCategory,
    add_prefix("StyleAgent"): StyleAgent,
    add_prefix("ShotAgent"): ShotAgent,
    add_prefix("DetailAgent"): DetailAgent,
    add_prefix("StaticVillain"): StaticVillain,
    add_prefix("DefinitionVillain"): DefinitionVillain,
    add_prefix("ContentVillain"): ContentVillain,
    add_prefix("StyleVillain"): StyleVillain,
    add_prefix("PromptRefinerLight"): PromptRefinerLight,
    add_prefix("PromptEqualizerLight"): PromptEqualizer,
    
}




NODE_DISPLAY_NAME_MAPPINGS = {
    add_prefix("PromptSplitterLight"): create_display_name("🔱", "Category Prompt Splitter Light"),
    add_prefix("PromptFusionLight"): create_display_name("🧬", "Prompt Fusion Positive"),
    add_prefix("PromptFusionNegative"): create_display_name("🧬", "Prompt Fusion Negative"),
    add_prefix("ConditionFunnelLight"): create_display_name("💫", "Text Fusion Light"),
    add_prefix("SubjectWeight"): create_display_name("👤", "Subject Weight"),
    add_prefix("EnvironmentWeight"): create_display_name("🌍", "Environment Weight"),
    add_prefix("StyleWeight"): create_display_name("🎨", "Style Weight"),
    add_prefix("ShotWeight"): create_display_name("📷", "Shot Weight"),
    add_prefix("DetailsWeight"): create_display_name("🔍", "Details Weight"),
    add_prefix("ConditionWeight"): create_display_name("⚖️", "Conditioning Weight"),
    add_prefix("StaticWeight"): create_display_name("💀", "Static Weight"),
    add_prefix("DefinitionWeight"): create_display_name("👺", "Definition Weight"),
    add_prefix("ContentWeight"): create_display_name("🙈", "Content Weight"),
    add_prefix("DynamicWeight"): create_display_name("😈", "Dynamic Weight"),
    add_prefix("TextWeight"): create_display_name("📄", "Text Weight"),
    add_prefix("SubjectCategory"): create_display_name("👤", "Subject Category Light"),
    add_prefix("EnvironmentCategory"): create_display_name("🌍", "Environment Category Light"),
    add_prefix("StyleAgent"): create_display_name("🎨", "Style Category Light"),
    add_prefix("ShotAgent"): create_display_name("📷", "Shot Category Light"),
    add_prefix("DetailAgent"): create_display_name("🔍", "Detail Category Light"),
    add_prefix("StaticVillain"): create_display_name("💀", "Static Category Light"),
    add_prefix("DefinitionVillain"): create_display_name("👺", "Definition Category Light"),
    add_prefix("ContentVillain"): create_display_name("🙈", "Content Category Light"),
    add_prefix("StyleVillain"): create_display_name("😈", "Dynamic Category Light"),
    add_prefix("PromptRefinerLight"): create_display_name("⌨️​", "Prompt Refiner Light"),
    add_prefix("PromptEqualizerLight"): create_display_name("🎚️", "Prompt Equalizer Light"),
    
}

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS"]




