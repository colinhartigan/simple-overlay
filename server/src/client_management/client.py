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

        self.alt_color = lambda color: "blue" if color == "Red" else "red"

        self.all_content = None
        self.all_comp_data = requests.get("https://valorant-api.com/v1/competitivetiers").json()["data"][-1]["tiers"]
        self.all_agent_data = requests.get("https://valorant-api.com/v1/agents?isPlayableCharacter=true").json()["data"]
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


    def get_teams(self, host_team):
        team_one = ""
        team_two = ""
        if host_team != "":
            if host_team != "Neutral": 
                team_one = host_team.lower()
                team_two = self.alt_color(host_team)
            else: 
                team_one = "blue"
                team_two = "red"
        
        return team_one, team_two

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

        payload = {
            "event": "match_data",
            "data": {
                "teams": {}, 
                "team_one": "",
                "team_two": "",
                "swap_colors": False
            } 
        }

        halftime_met = presence_data["partyOwnerMatchScoreAllyTeam"] + presence_data["partyOwnerMatchScoreEnemyTeam"] >= 12

        team_one, team_two = self.get_teams(host_team)
        payload["data"]["team_one"] = team_one
        payload["data"]["team_two"] = team_two

        if host_team == "Neutral":
            if halftime_met:
                payload["data"]["swap_colors"] = True
        else:
            if team_one == "red":
                payload["data"]["swap_colors"] = True

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
                    data = next(p for p in names if p["Subject"] == player["identity"]["puuid"])
                    player["identity"]["name"] = data["GameName"]
                    player["identity"]["tag"] = data["TagLine"]

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
            if player["TeamID"] != "Neutral":
                try:
                    teams[player["TeamID"].lower()][player["Subject"]] = {
                        "identity": {
                            "puuid": player["Subject"],
                            "name": "",
                            "tag": "",
                            "team": player["TeamID"]
                        },

                        "agent": {
                            "agent_uuid": player["CharacterID"],
                            "agent_image": f"https://media.valorant-api.com/agents/{player['CharacterID']}/displayicon.png",
                            "agent_name": [agent for agent in self.all_agent_data if agent["uuid"] == player["CharacterID"].lower()][0]["displayName"],
                        },

                        "rank": fetch_mmr_data(player["Subject"]),
                    }
                except:
                    traceback.print_exc()
                    pass

        fetch_names()

        payload["data"]["teams"] = teams

        #payload = {'event': 'match_data', 'data': {'teams': {'red': {'65171ec5-153e-5a16-8cfa-911fde3c5582': {'identity': {'puuid': '65171ec5-153e-5a16-8cfa-911fde3c5582', 'name': 'Hakeemyy', 'team': 'Red'}, 'agent': {'agent_uuid': '6f2a04ca-43e0-be17-7f36-b3908627744d', 'agent_image': 'https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/displayicon.png', 'agent_name': 'Skye'}, 'rank': {'tier': 15, 'rr': 5, 'tier_name': 'PLATINUM 1', 'tier_image': 'https://media.valorant-api.com/competitivetiers/e4e9a692-288f-63ca-7835-16fbf6234fda/15/largeicon.png', 'accent_color': '#59a9b6ff'}}, 'c8c8577b-9a5b-567e-aca5-ec3ece48c01f': {'identity': {'puuid': 'c8c8577b-9a5b-567e-aca5-ec3ece48c01f', 'name': 'nodnarb', 'team': 'Red'}, 'agent': {'agent_uuid': 'eb93336a-449b-9c1b-0a54-a891f7921d69', 'agent_image': 'https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/displayicon.png', 'agent_name': 'Phoenix'}, 'rank': {'tier': 10, 'rr': 32, 'tier_name': 'SILVER 2', 'tier_image': 'https://media.valorant-api.com/competitivetiers/e4e9a692-288f-63ca-7835-16fbf6234fda/10/largeicon.png', 'accent_color': '#bbc2c2ff'}}, '74f27fae-7617-58b8-a1f6-51864f26b047': {'identity': {'puuid': '74f27fae-7617-58b8-a1f6-51864f26b047', 'name': 'noobie', 'team': 'Red'}, 'agent': {'agent_uuid': '1e58de9c-4950-5125-93e9-a0aee9f98746', 'agent_image': 'https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/displayicon.png', 'agent_name': 'Killjoy'}, 'rank': {'tier': 8, 'rr': 49, 'tier_name': 'BRONZE 3', 'tier_image': 'https://media.valorant-api.com/competitivetiers/e4e9a692-288f-63ca-7835-16fbf6234fda/8/largeicon.png', 'accent_color': '#a5855dff'}}, '178e6f09-97f2-5b58-bb5a-4fc7bd3c9857': {'identity': {'puuid': '178e6f09-97f2-5b58-bb5a-4fc7bd3c9857', 'name': 'tommat51', 'team': 'Red'}, 'agent': {'agent_uuid': 'f94c3b30-42be-e959-889c-5aa313dba261', 'agent_image': 'https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/displayicon.png', 'agent_name': 'Raze'}, 'rank': {'tier': '0', 'rr': '0', 'tier_name': 'Unrated', 'tier_image': '', 'accent_color': '#000000'}}, 'e7e6b242-b644-5776-9c9b-6db9ffd737db': {'identity': {'puuid': 'e7e6b242-b644-5776-9c9b-6db9ffd737db', 'name': 'Smerrkz GG', 'team': 'Red'}, 'agent': {'agent_uuid': 'a3bfb853-43b2-7238-a4f1-ad90e9e46bcc', 'agent_image': 'https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/displayicon.png', 'agent_name': 'Reyna'}, 'rank': {'tier': 11, 'rr': 0, 'tier_name': 'SILVER 3', 'tier_image': 'https://media.valorant-api.com/competitivetiers/e4e9a692-288f-63ca-7835-16fbf6234fda/11/largeicon.png', 'accent_color': '#bbc2c2ff'}}}, 'blue': {'eaa0d224-61bc-593a-a083-d6e18161e4c5': {'identity': {'puuid': 'eaa0d224-61bc-593a-a083-d6e18161e4c5', 'name': 'semicolin', 'team': 'Blue'}, 'agent': {'agent_uuid': '601dbbe7-43ce-be57-2a40-4abd24953621', 'agent_image': 'https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/displayicon.png', 'agent_name': 'KAY/O'}, 'rank': {'tier': 13, 'rr': 99, 'tier_name': 'GOLD 2', 'tier_image': 'https://media.valorant-api.com/competitivetiers/e4e9a692-288f-63ca-7835-16fbf6234fda/13/largeicon.png', 'accent_color': '#eccf56ff'}}, 'a5769d9b-6439-5c91-babc-0ec79000557f': {'identity': {'puuid': 'a5769d9b-6439-5c91-babc-0ec79000557f', 'name': 'HierogIyph', 'team': 'Blue'}, 'agent': {'agent_uuid': '22697a3d-45bf-8dd7-4fec-84a9e28c69d7', 'agent_image': 'https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/displayicon.png', 'agent_name': 'Chamber'}, 'rank': {'tier': 13, 'rr': 46, 'tier_name': 'GOLD 2', 'tier_image': 'https://media.valorant-api.com/competitivetiers/e4e9a692-288f-63ca-7835-16fbf6234fda/13/largeicon.png', 'accent_color': '#eccf56ff'}}, '10b1960d-f58f-5ca8-b960-3ebfe7bfe924': {'identity': {'puuid': '10b1960d-f58f-5ca8-b960-3ebfe7bfe924', 'name': 'espada', 'team': 'Blue'}, 'agent': {'agent_uuid': 'add6443a-41bd-e414-f6ad-e58d267f4e95', 'agent_image': 'https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png', 'agent_name': 'Jett'}, 'rank': {'tier': 13, 'rr': 11, 'tier_name': 'GOLD 2', 'tier_image': 'https://media.valorant-api.com/competitivetiers/e4e9a692-288f-63ca-7835-16fbf6234fda/13/largeicon.png', 'accent_color': '#eccf56ff'}}, '1ceb6cbf-b72f-5468-aab0-71a3acc1bc39': {'identity': {'puuid': '1ceb6cbf-b72f-5468-aab0-71a3acc1bc39', 'name': 'JERRURURURURURU', 'team': 'Blue'}, 'agent': {'agent_uuid': 'f94c3b30-42be-e959-889c-5aa313dba261', 'agent_image': 'https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/displayicon.png', 'agent_name': 'Raze'}, 'rank': {'tier': 20, 'rr': 15, 'tier_name': 'DIAMOND 3', 'tier_image': 'https://media.valorant-api.com/competitivetiers/e4e9a692-288f-63ca-7835-16fbf6234fda/20/largeicon.png', 'accent_color': '#b489c4ff'}}, 'ea8027dc-44ae-5cb5-b060-f17a3ee1320c': {'identity': {'puuid': 'ea8027dc-44ae-5cb5-b060-f17a3ee1320c', 'name': 'TheBrokenYoYo', 'team': 'Blue'}, 'agent': {'agent_uuid': 'a3bfb853-43b2-7238-a4f1-ad90e9e46bcc', 'agent_image': 'https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/displayicon.png', 'agent_name': 'Reyna'}, 'rank': {'tier': 9, 'rr': 37, 'tier_name': 'SILVER 1', 'tier_image': 'https://media.valorant-api.com/competitivetiers/e4e9a692-288f-63ca-7835-16fbf6234fda/9/largeicon.png', 'accent_color': '#bbc2c2ff'}}}}, 'team_one': 'blue', 'team_two': 'red', 'swap_colors': False}} 

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
        spectating = host_team == "Neutral"

        halftime_met = presence["partyOwnerMatchScoreAllyTeam"] + presence["partyOwnerMatchScoreEnemyTeam"] >= 12

        if not spectating:
            team_one, team_two = self.get_teams("blue")

        if not halftime_met and spectating:
            team_one, team_two = self.get_teams(host_team)
        elif spectating and not halftime_met:
            team_two, team_one = self.get_teams(host_team)

        if host_team == "Neutral":
            score_teamone = int(presence["partyOwnerMatchScoreAllyTeam"]) if not halftime_met else int(presence["partyOwnerMatchScoreEnemyTeam"])
            score_teamtwo = int(presence["partyOwnerMatchScoreEnemyTeam"]) if not halftime_met else int(presence["partyOwnerMatchScoreAllyTeam"])
        else: 
            score_teamone = int(presence["partyOwnerMatchScoreAllyTeam"])
            score_teamtwo = int(presence["partyOwnerMatchScoreEnemyTeam"])

        # if halftime_met and host_team == "Neutral":
        #     print("switch")
        #     holder = score_red
        #     print(holder)
        #     score_red = score_blue
        #     score_blue = holder
        #     print(holder)

        tied = score_teamone == score_teamtwo

        data = {
            "map_name": next(map for map in self.all_map_data if map["mapUrl"] == presence["partyOwnerMatchMap"])["displayName"],
            "changed_sides": halftime_met,
            "score": {
                "TeamOne": {
                    "color": team_one, 
                    "rounds_won": score_teamone,
                    "winning": score_teamone > score_teamtwo or tied,
                    "mirrored": False,
                },
                "TeamTwo": {
                    "color": team_two,
                    "rounds_won": score_teamtwo,
                    "winning": score_teamtwo > score_teamone or tied,
                    "mirrored": True,
                },
            },
            "round_num": score_teamone + score_teamtwo + 1,
        }

        payload = {
            "event": "score_data",
            "data": data
        }

        await broadcast(payload)