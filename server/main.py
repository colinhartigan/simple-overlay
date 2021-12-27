import os, traceback
from src.server import Server

if __name__ == "__main__":
    try:
        Server.start()
    except:
        print("error: quite the bummer you've encountered this")
        traceback.print_exc()
        input("press enter to exit...")
        os._exit(1)
    