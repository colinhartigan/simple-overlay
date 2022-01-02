import { React, useEffect, useState } from 'react';
import { Link } from 'react-router-dom'

//utilities
import { makeStyles, useTheme } from '@material-ui/core/styles';

//components
import { Typography, Paper, Slide } from '@material-ui/core'

import socket from '../../../services/Socket.js'

const useStyles = makeStyles((theme) => ({
    root: {
        width: "210px",
        height: "550px",
        position: "absolute",
        top: 515,
        margin: "0px 25px 0px 25px",
        backgroundColor: "transparent",
    },

    container: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
    },

    playerContainer: {
        height: "20%",
        padding: "5px 0px 5px 0px",
        width: "100%",
    },

    playerPaper: {
        height: "100%",
        width: "100%",
        backgroundColor: "#1C222A",
    },

    content: {
        height: "100%",
        width: "100%",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
    },

    playerName: {
        padding: "0px 7px 0px 7px",
        height: "35%",
        alignSelf: "flex-end",
        overflow: "hidden",
    },

    playerRank: {
        width: "30%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    }

}))

function Team(props) {

    const classes = useStyles();
    const theme = useTheme();

    const mirrored = props.mirrored;
    const teamId = props.teamId

    const teamData = props.matchData !== null ? props.matchData.teams[teamId] : null;

    useEffect(() => {
        if (props.ingame === false) {
            console.log("no longer in game")
        }
    }, [props.ingame])


    function generatePlayer(puuid) {

        const data = teamData[puuid]
        const hasRank = data.rank.tier_image !== ""
        const rankColor = data.rank.accent_color
        const teamColor = ((teamId === "red" && !props.matchData.swap_colors) || (teamId !== "red" && props.matchData.swap_colors)) ? "253,69,84" : "37,174,115"

        return (
            <Slide key={puuid} in={props.ingame} direction={mirrored ? "left" : "right"}>
                <div className={classes.playerContainer}>
                    <Paper
                        variant="outlined"
                        className={classes.playerPaper}
                        style={{
                            backgroundImage: `linear-gradient(0deg, rgba(28,34,42,1) 0%, rgba(255,255,255,0) 75%), url(${data.agent.agent_image})`,
                            backgroundPosition: (data.agent.agent_uuid !== "1e58de9c-4950-5125-93e9-a0aee9f98746" ? "0% 65%" : "50% 50%"),
                            backgroundSize: (data.agent.agent_uuid !== "1e58de9c-4950-5125-93e9-a0aee9f98746" ? "auto 140%" : "200% 100%"),
                            backgroundRepeat: "no-repeat",
                            transform: (mirrored ? "scaleX(-1)" : null),
                            borderColor: `rgba(${teamColor},.3)`,
                        }}
                    >
                        <div className={classes.content} style={{ transform: (mirrored ? "scaleX(-1)" : null) }}>

                            <div className={classes.playerName} style={{ order: (mirrored ? 2 : 1), width: (hasRank ? "70%" : "100%") }}>
                                <Typography variant="h5" style={{ textOverflow: "ellipsis", overflow: "hidden", textAlign: (mirrored ? "right" : "left") }}>{data.identity.name}</Typography>
                            </div>

                            {hasRank ?
                                <div className={classes.playerRank} style={{ order: (mirrored ? 1 : 2) }}>
                                    <img src={data.rank.tier_image} alt="agent" style={{ marginTop: "8px", height: "auto", width: "80%", objectFit: "cover" }} />
                                    {data.rank.tier !== 0 ? <Typography variant="h6" style={{ color: rankColor, textAlign: "center", lineHeight: "2.3", fontSize: "0.85rem" }}>{data.rank.rr}RR</Typography> : null}
                                </div>
                                : null
                            }

                        </div>

                    </Paper>

                </div>
            </Slide>
        )
    }

    return (
        <div className={classes.root} style={{ left: (mirrored ? null : 0), right: (mirrored ? 0 : null) }}>
            <div className={classes.container}>
                {teamData !== null && teamId !== "" ? Object.keys(teamData).map(puuid => {
                    return generatePlayer(puuid)
                }) : null}
            </div>
        </div>
    )
}

export default Team;