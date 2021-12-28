import traceback
import requests, os, json, asyncio
from valclient.client import Client as ValClient
from dotenv import load_dotenv

from .. import shared
from ..broadcast import broadcast

load_dotenv()

class Client:

    def __init__(self):
        self.client = None 
        self.ready = False

        self.saved_players = {}
        self.season_uuid = None

        self.all_content = None
        self.all_comp_data = requests.get("https://valorant-api.com/v1/competitivetiers").json()["data"][-1]["tiers"]
        self.all_agent_data = requests.get("https://valorant-api.com/v1/agents").json()["data"]
        self.all_map_data = requests.get("https://valorant-api.com/v1/maps").json()["data"]

    def get_season(self):
        for season in self.all_content["Seasons"]:
            if season["IsActive"] and season["Type"] == "act":
                self.season_uuid = season["ID"]

    def connect(self,force_local=False):
        if self.ready == False:
            try:
                self.client = ValClient(region=self.autodetect_region())
                self.client.activate()
                self.ready = True
                self.all_content = self.client.fetch_content()

            except:
                traceback.print_exc()
                self.ready = False
                print("game not running")

    def autodetect_region(self):
        client = ValClient(region="na")
        client.activate()
        sessions = client.riotclient_session_fetch_sessions()
        for _,session in sessions.items():
            if session["productId"] == "valorant":
                launch_args = session["launchConfiguration"]["arguments"]
                for arg in launch_args:
                    if "-ares-deployment" in arg:
                        region = arg.replace("-ares-deployment=","")
                        return region


    async def broadcast_match_data(self):
        if self.season_uuid is None:
            self.get_season()

        try:
            match_id = self.client.coregame_fetch_player()["MatchID"]
            match_data = self.client.coregame_fetch_match(match_id)
            presence_data = self.client.fetch_presence()
            host_team = presence_data["partyOwnerMatchCurrentTeam"]
        except:
            print("no longer in game")
            return

        alt_color = lambda color: "blue" if color == "Red" else "red"

        payload = {
            "event": "match_data",
            "data": {
                "teams": {}, 
                "team_one": "",
                "team_two": "",
            } 
        }

        if host_team != "":
            if host_team != "Neutral": 
                payload["data"]["team_one"] = host_team.lower()
                payload["data"]["team_two"] = alt_color(host_team)
            else: 
                payload["data"]["team_one"] = "red"
                payload["data"]["team_two"] = "blue"

        teams = {
            "red": {},
            "blue": {},
        }

        def fetch_names():
            url = f"https://pd.{self.client.shard}.a.pvp.net/name-service/v2/players"

            puuids = [player["identity"]["puuid"] for _,player in teams["red"].items()]
            puuids.extend([player["identity"]["puuid"] for _,player in teams["blue"].items()])

            headers = {"Content-Type": "application/json"}

            names = requests.request("PUT", url, json=puuids, headers=headers)
            names = names.json()

            for _,team in teams.items():
                for _, player in team.items():
                    player["identity"]["name"] = next(p for p in names if p["Subject"] == player["identity"]["puuid"])["GameName"]

        def fetch_mmr_data(puuid):
            data = {}
            if puuid in self.saved_players.keys():
                if self.saved_players.get(puuid)["tier_image"] != "":
                    print("using cached")
                    data = self.saved_players.get(puuid)

            if data == {}:
                try:
                    mmr_data = self.client.fetch_mmr(puuid)
                    comp_info = mmr_data["QueueSkills"]["competitive"]["SeasonalInfoBySeasonID"]

                    if comp_info is not None and comp_info.get(self.season_uuid):
                        comp_data = comp_info.get(self.season_uuid)
                        tier_data = next(tier for tier in self.all_comp_data if tier["tier"] == comp_data["CompetitiveTier"])

                        data = {
                            "tier": comp_data["CompetitiveTier"],
                            "rr": comp_data["RankedRating"],
                            "tier_name": tier_data["tierName"],
                            "tier_image": tier_data["largeIcon"],
                            "accent_color": f"#{tier_data['color']}",
                        }

                    else:
                        data = {
                            "tier": "0",
                            "rr": "0",
                            "tier_name": "Unrated",
                            "tier_image": "",
                            "accent_color": "#000000",
                        }
                
                except:
                    traceback.print_exc()
                    print("failed to fetch mmr data")
                    data = {
                        "tier": "0",
                        "rr": "0",
                        "tier_name": "Unrated",
                        "tier_image": "",
                        "accent_color": "#000000",
                    }

                self.saved_players[puuid] = data

            return data 

        for player in match_data["Players"]:
            # if the player w/ overlay is also playing, make their team the left side
            print(host_team, player["TeamID"])
            teams[player["TeamID"].lower()][player["Subject"]] = {
                "identity": {
                    "puuid": player["Subject"],
                    "name": "",
                },

                "agent": {
                    "agent_uuid": player["CharacterID"],
                    "agent_image": f"https://media.valorant-api.com/agents/{player['CharacterID']}/displayicon.png",
                    "agent_name": [agent for agent in self.all_agent_data if agent["uuid"] == player["CharacterID"]][0]["displayName"],
                },

                "rank": fetch_mmr_data(player["Subject"]),
            }

        fetch_names()

        payload["data"]["teams"] = teams

        await broadcast(payload)
        

    async def clear_match_data(self):
        payload = {
            "event": "match_data",
            "data": {
                "teams": {}, 
                "team_one": "",
                "team_two": "",
            } 
        }
        await broadcast(payload)



    async def broadcast_score(self):
        presence = self.client.fetch_presence()

        host_team = presence["partyOwnerMatchCurrentTeam"]

        halftime_met = presence["partyOwnerMatchScoreAllyTeam"] + presence["partyOwnerMatchScoreEnemyTeam"] >= 12

        if host_team == "Neutral":
            score_red = int(presence["partyOwnerMatchScoreEnemyTeam"]) if not halftime_met else int(presence["partyOwnerMatchScoreAllyTeam"])
            score_blue = int(presence["partyOwnerMatchScoreAllyTeam"]) if not halftime_met else int(presence["partyOwnerMatchScoreEnemyTeam"])
        else: 
            score_red = int(presence["partyOwnerMatchScoreAllyTeam"]) if host_team == "Red" else int(presence["partyOwnerMatchScoreEnemyTeam"])
            score_blue = int(presence["partyOwnerMatchScoreEnemyTeam"]) if host_team == "Red" else int(presence["partyOwnerMatchScoreAllyTeam"])

        if halftime_met and host_team == "Neutral":
            print("switch")
            holder = score_red
            print(holder)
            score_red = score_blue
            score_blue = holder
            print(holder)

        tied = score_red == score_blue

        data = {
            "map_name": next(map for map in self.all_map_data if map["mapUrl"] == presence["partyOwnerMatchMap"])["displayName"],
            "changed_sides": halftime_met,
            "score": {
                "red": {
                    "rounds_won": score_red,
                    "winning": score_red > score_blue or tied,
                },
                "blue": {
                    "rounds_won": score_blue,
                    "winning": score_blue > score_red or tied,
                },
            },
            "round_num": score_red + score_blue + 1,
        }

        payload = {
            "event": "score_data",
            "data": data
        }

        await broadcast(payload)