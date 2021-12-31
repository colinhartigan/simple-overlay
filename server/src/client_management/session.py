import asyncio, websockets, ssl, json, base64

ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

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

    async def check_ingame(self):
        self.previous_presence = self.presence

        try:
            if self.presence["sessionLoopState"] == "INGAME": # dont want to do stuff in pregame
                self.ingame = True
            else:
                self.ingame = False

            # if self.previous_presence["sessionLoopState"] != self.presence["sessionLoopState"]:
            #     changed = True

        except:
            self.ingame = False

        await broadcast({
            "event": "game_state",
            "data": self.ingame
        })

    async def presence_listener(self):
        async with websockets.connect(f'wss://riot:{self.valclient.lockfile["password"]}@localhost:{self.valclient.lockfile["port"]}', ssl=ssl_context) as websocket:
            await websocket.send('[5, "OnJsonApiEvent_chat_v4_presences"]')    # subscribing to presence event
            
            while True:
                response = await websocket.recv()
                if response != "":
                    print("presence")
                    response = json.loads(response)
                    if response[2]['data']['presences'][0]['puuid'] == self.valclient.puuid:
                        self.presence = json.loads(base64.b64decode((response[2]['data']['presences'][0]['private'])))
                        await self.update_score()


    async def loop(self):
        while True:
            print("loop")
            if self.ingame:
                await self.update_match()
                await self.check_ingame()
            await asyncio.sleep(5)
        

    async def entrypoint(self):
        self.presence = self.valclient.fetch_presence()
        await self.check_ingame()
        await self.update_score()

        asyncio.ensure_future(self.loop())
        asyncio.ensure_future(self.presence_listener())