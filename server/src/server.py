import websockets, json, traceback, os, asyncio, inspect
import websockets.client 
import websockets.server
from websockets.exceptions import ConnectionClosedOK, ConnectionClosedError

from .client_management.client import Client
from .client_management.session import Session
from .ceremony_management.ceremonies import Ceremonies
from .team_management.teams import Team_Manager
from .file_management.file_manager import File_Manager
from .file_management.filepath import Filepath

from . import shared


class Server:

    shared.client = Client()
    shared.client.connect()

    request_lookups = {
        "handshake": lambda: True,

        "ceremony": Ceremonies.play_ceremony,
        "fetch_team_data": Team_Manager.fetch_team_data,
        "update_team_data": Team_Manager.update_team_data,
    }

    @staticmethod
    def start():
        if not os.path.exists(Filepath.get_appdata_folder()):
            os.mkdir(Filepath.get_appdata_folder())

        if not shared.client.ready:
            Server.reset_valclient()
            
        
        shared.loop = asyncio.get_event_loop()

        # set up other modules
        session = Session()

        # load storage
        shared.storage = File_Manager.fetch_storage_file()

        #start websocket server
        start_server = websockets.serve(Server.ws_entrypoint, "", 8009)
        
        print("server running\nopen https://colinhartigan.github.io/simple-overlay in your browser to use")
        shared.loop.run_until_complete(start_server)

        shared.loop.run_until_complete(session.entrypoint())

        shared.loop.run_forever()


    def reset_valclient():
        shared.client = Client()
        try:
            shared.client.connect()
        except: 
            print("couldnt connect")


    @staticmethod
    async def ws_entrypoint(websocket, path):
        print("connected")
        print(shared.sockets)
        shared.sockets.append(websocket)
        try:
            while websocket in shared.sockets:
                data = await websocket.recv()
                data = json.loads(data)

                request = data.get("request")
                args = data.get("args")
                has_kwargs = True if args is not None else False
                payload = {}

                if request in Server.request_lookups.keys():
                    payload = {
                        "success": True,
                        "event": request,
                        "data": None,
                    }
                    if inspect.iscoroutinefunction(Server.request_lookups[request]):
                        if has_kwargs:
                            payload["data"] = await Server.request_lookups[request](**args)
                        else:
                            payload["data"] = await Server.request_lookups[request]()
                    else:
                        if has_kwargs:
                            payload["data"] = Server.request_lookups[request](**args)
                        else:
                            payload["data"] = Server.request_lookups[request]()
                else:
                    payload = {
                        "success": False,
                        "data": "could not find the specified request"
                    }

                await websocket.send(json.dumps(payload))
                #print("responded w/ payload\n----------------------")
        
        except ConnectionClosedOK:
            print("disconnected")
            shared.sockets.pop(shared.sockets.index(websocket))

        except ConnectionClosedError:
            print("disconnected w/ error")
            shared.sockets.pop(shared.sockets.index(websocket))
            
        except Exception:
            print("----- EXCEPTION -----")
            print(traceback.print_exc())

        except:
            print("idk what even happened to get here")


