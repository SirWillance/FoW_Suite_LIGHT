from .constants import (
    CATEGORY_EMOJI,
    CATEGORIES_EMOJI,
    REFINEMENT_EMOJI,
    WEIGHTING_EMOJI,
    FUSION_EMOJI,
    FOW_TIER_NAME,
    MODULATION_EMOJI,
    POSITIVE_EMOJI,
    NEGATIVE_EMOJI,
)

MAIN_CATEGORY = f"{CATEGORY_EMOJI} {FOW_TIER_NAME}"
CATEGORIES_CATEGORY = f"{MAIN_CATEGORY}/{CATEGORIES_EMOJI} The 9 Categories"
REFINEMENT_CATEGORY = f"{REFINEMENT_EMOJI} Prompt Refinement"

SUBCATEGORIES = {
    "1": f"{REFINEMENT_CATEGORY}/{WEIGHTING_EMOJI} Weighting",
    "2": f"{REFINEMENT_CATEGORY}/{FUSION_EMOJI} Funneling",    
    "3": f"{REFINEMENT_CATEGORY}/{MODULATION_EMOJI} Modulation",        
    "4": f"{CATEGORIES_CATEGORY}/{POSITIVE_EMOJI} Positive", 
    "5": f"{CATEGORIES_CATEGORY}/{NEGATIVE_EMOJI} Negative", 
}

def get_category(subcategory_key: str) -> str:
    if subcategory_key not in SUBCATEGORIES:
        raise KeyError(f"Subcategory key '{subcategory_key}' not found.")
    
    # Check if the subcategory is nested under "Categories"
    if SUBCATEGORIES[subcategory_key].startswith(CATEGORIES_CATEGORY):
        return SUBCATEGORIES[subcategory_key]  # Return the full subcategory path
    else:
        return f"{MAIN_CATEGORY}/{SUBCATEGORIES[subcategory_key]}"  # Prepend the main category