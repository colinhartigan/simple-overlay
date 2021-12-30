

from .. import shared
from ..broadcast import broadcast

class Ceremonies:

    async def play_ceremony(type, subtext):
        payload = {
            "event": "ceremony",
            "data": {
                "type": type,
                "subtext": subtext
            }
        }

        await broadcast(payload)
        return