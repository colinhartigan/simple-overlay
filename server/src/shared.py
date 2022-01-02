# this module is a place to store stuff that is used in multiple modules

# valorant client object
client = None

# websocket connections
sockets = []

# asyncio loop
loop = None

# live team data
live_teams = {
    "TeamOne": "",
    "TeamTwo": "",
}

# saved storage data
storage = {}