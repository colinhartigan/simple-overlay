from ..file_management.file_manager import File_Manager

from .. import shared 
from ..broadcast import broadcast


class Team_Manager:

    async def update_team_data(data):
        shared.storage["teams"] = data
        payload = {
            "event": "team_data",
            "data": data
        }
        await broadcast(payload)
        File_Manager.update_storage(shared.storage)

    def fetch_team_data():
        return shared.storage["teams"]

    async def set_live_team(side, team_id):
        shared.live_teams[side] = team_id
        payload = {
            "event": "live_team_data",
            "data": shared.live_teams
        }
        await broadcast(payload)

    async def fetch_live_teams():
        return shared.live_teams