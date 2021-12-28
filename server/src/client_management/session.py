import asyncio

from ..broadcast import broadcast
from .. import shared


class Session:
    def __init__(self):
        self.client = shared.client
        self.valclient = shared.client.client

        try:
            self.previous_presence = self.valclient.fetch_presence()
        except:
            self.previous_presence = {}
        self.presence = self.previous_presence
        self.ingame = False


    async def update_match(self):
        if self.ingame:
            await self.client.broadcast_match_data()
        #else:
            #await self.client.clear_match_data()

    async def update_score(self):
        if self.ingame:
            await self.client.broadcast_score()

    async def check_presence(self):
        self.previous_presence = self.presence
        
        changed = False

        try:
            self.presence = self.valclient.fetch_presence()
            if self.presence["sessionLoopState"] == "INGAME": # dont want to do stuff in pregame
                self.ingame = True
            else:
                self.ingame = False

            if self.previous_presence["sessionLoopState"] != self.presence["sessionLoopState"]:
                changed = True

        except:
            self.ingame = False

        await broadcast({
            "event": "game_state",
            "data": self.ingame
        })

        return changed


    async def loop(self):
        while True:
            print("loop")
            changed = await self.check_presence()

            await self.update_match()
            await self.update_score()

            await asyncio.sleep(5)