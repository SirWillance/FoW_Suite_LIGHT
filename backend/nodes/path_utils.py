# backend/utils/path_utils.py
import os

def get_suite_root(start_path):
    """Find the FoW_Suite_LIGHT root directory from a starting path."""
    current_dir = os.path.dirname(start_path)
    while os.path.basename(current_dir) != "FoW_Suite_LIGHT":
        parent_dir = os.path.dirname(current_dir)
        if parent_dir == current_dir:
            raise FileNotFoundError("Could not find FoW_Suite_LIGHT directory in the path")
        current_dir = parent_dir
    return current_dir