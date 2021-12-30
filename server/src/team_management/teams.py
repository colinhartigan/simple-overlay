from .. import shared 
from ..broadcast import broadcast

class Team_Manager:

    def init_team_data():
        shared.team_data = {
            "teams": {
                "TeamOne": {
                    "name": "",
                    "name_abbr": "",
                    "team_img": "",
                    "wins": 0,
                    "losses": 0,
                },
                "TeamTwo": {
                    "name": "",
                    "name_abbr": "",
                    "team_img": "",
                    "wins": 0,
                    "losses": 0,
                }
            }
        }

    async def update_team_data(data):
        shared.team_data = data
        payload = {
            "event": "team_data",
            "data": data
        }
        await broadcast(payload)

    def fetch_team_data():
        return shared.team_data