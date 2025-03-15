# backend/utils/file_cache.py
import os
import json
from .path_utils import get_suite_root

class FileCache:
    _instance = None
    _catalogues = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FileCache, cls).__new__(cls)
        return cls._instance

    def get_catalogue(self, catalogue_filename, start_path):
        if catalogue_filename not in self._catalogues:
            try:
                suite_root = get_suite_root(start_path)
                library_dir = os.path.join(suite_root, "data", "Library")
                os.makedirs(library_dir, exist_ok=True)
                full_path = os.path.join(library_dir, catalogue_filename)
                if os.path.exists(full_path):
                    with open(full_path, 'r', encoding='utf-8') as f:
                        self._catalogues[catalogue_filename] = json.load(f)
                else:
                    print(f"Warning: Catalogue file not found at {full_path}. Using empty catalogue.")
                    self._catalogues[catalogue_filename] = {}
            except Exception as e:
                print(f"Error loading catalogue {catalogue_filename}: {str(e)}")
                self._catalogues[catalogue_filename] = {}
        return self._catalogues[catalogue_filename]