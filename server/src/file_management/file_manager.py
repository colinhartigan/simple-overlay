from .filepath import Filepath
import os, json

from .. import shared

class File_Manager:

    def create_empty_storage():
        with open(Filepath.get_path(os.path.join(Filepath.get_appdata_folder(), 'storage.json')), 'w+') as f:
            data = {
                "teams": {}
            }
            json.dump(data, f)
            return data

    def fetch_storage_file():
        try:
            with open(Filepath.get_path(os.path.join(Filepath.get_appdata_folder(), 'storage.json'))) as f:
                return json.load(f)
        except:
            return File_Manager.create_empty_storage()

    def update_storage(new_data):
        with open(Filepath.get_path(os.path.join(Filepath.get_appdata_folder(), 'storage.json')),'w') as f:
            json.dump(new_data,f)