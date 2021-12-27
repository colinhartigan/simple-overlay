import asyncio

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

        self.first = True


    async def fetch_match(self):
        if self.ingame:
            await self.client.broadcast_match_data()


    async def check_presence(self):
        self.previous_presence = self.presence
        changed = False

        try:
            self.presence = self.valclient.fetch_presence()
            if self.presence["sessionLoopState"] == "INGAME": # dont want to do stuff in pregame
                self.ingame = True
                if self.first:
                    changed = True
                    self.first = False
            else:
                self.ingame = False

            if self.previous_presence["sessionLoopState"] != self.presence["sessionLoopState"]:
                changed = True

        except:
            self.ingame = False

        return changed


    async def loop(self):
        while True:
            print("loop")
            changed = await self.check_presence()
            # if changed:
            #     await self.fetch_match()
            await self.fetch_match()

            if self.ingame:
                await asyncio.sleep(20)
            else:
                await asyncio.sleep(5)