import { React, useEffect, useState } from 'react';
import { Link } from 'react-router-dom'

//utilities
import { makeStyles, useTheme } from '@material-ui/core/styles';

//components
import { Typography, Slide, Fade } from '@material-ui/core'

import socket from '../../../services/Socket.js'

const useStyles = makeStyles((theme) => ({
    root: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        position: "absolute",
        top: 0,
    },

    container: {
        width: "450px",
        height: "70px",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },

    team: {
        height: "100%",
        backgroundColor: "#1A252B",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        transition: ".5s ease-in-out !important",
    },

    score: {
        width: "50%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        margin: "5%",
    },

    teamInfo: {
        width: "50%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },

    timer: {
        height: "100%",
        // position: "absolute",
        // top: 0,
        // left: 893,
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
    },

    roundNum: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    }

}))

function TopBar(props) {

    const classes = useStyles();
    const theme = useTheme();

    const [scoreData, setScoreData] = useState(null)

    const liveTeamData = props.liveTeamData
    const teamMetadata = props.teamMetadata
    const spectatorMode = false

    useEffect(() => {
        socket.subscribe("score_data", scoreDataCallback)
    }, [])

    function scoreDataCallback(response) {
        setScoreData(response)
    }

    function generateTeamHeader(teamName) {
        if (scoreData !== null && liveTeamData !== null) {
            var teamScoreData = scoreData.score[teamName]
            var mirrored = teamScoreData.mirrored
            var color = teamScoreData.color === "red" ? "253,69,84" : "37,174,115"

            var hasTeamData, teamId, teamData

            if (liveTeamData[teamName] !== "") {
                teamId = liveTeamData[teamName]
                teamData = teamMetadata[teamId]
                hasTeamData = true
            } else {
                hasTeamData = false
            }

            console.log(teamData)

            return (
                <>
                    {scoreData !== null ?
                        <div className={classes.team} style={{
                            borderRadius: (!mirrored ? `0px 0px 30px ${!spectatorMode ? '30px' : '0px'}` : `0px 0px ${!spectatorMode ? '30px' : '0px'} 30px`),
                            backgroundImage: (scoreData.score[teamName].winning ? `linear-gradient(0deg, rgba(${color},.2) 0%, rgba(255,255,255,0) 100%)` : null),
                            width: (spectatorMode ? "183px" : "140px"),
                            padding: `${!mirrored ? '6px' : '0px'} ${mirrored ? '0px' : '6px'}`,
                        }}>
                            <div className={classes.score} style={{ order: (!mirrored ? 2 : 1) }}>
                                <Typography variant="h3" style={{ width: "80%", textAlign: "center" }}>
                                    <strong>{scoreData.score[teamName].rounds_won}</strong>
                                </Typography>
                            </div>
                            <div className={classes.teamInfo} style={{ padding: `0px ${mirrored ? '8px' : '0px'} 0px ${mirrored ? '0px' : '8px'}`, order: (!mirrored ? 1 : 2) }}>
                                {hasTeamData ?
                                    <>
                                        <Typography variant="h5" style={{ opacity: .8 }}>
                                            {teamData.name_abbr}
                                        </Typography>

                                        <Typography variant="body2" style={{ opacity: .7 }}>
                                            {teamData.wins} - {teamData.losses}
                                        </Typography>
                                    </>
                                    : null}

                            </div>
                        </div>
                        : null}
                </>
            )
        } else {
            return null
        }
    }


    return (
        <>
            <div className={classes.root}>
                <Slide in={props.ingame} direction="down" style={{ timeout: 1000 }}>
                    <div className={classes.container}>

                        {teamMetadata !== null ? generateTeamHeader("TeamOne") : null}

                        {scoreData !== null ?
                            <Fade in>
                                <div className={classes.timer} style={{ width: (spectatorMode ? "134px" : "118px"), }}>
                                    <div className={classes.roundNum} style={{ height: (spectatorMode ? "50%" : "33%"), backgroundColor: (!spectatorMode ? "#1A252B" : "transparent") }}>
                                        <Typography variant="overline" style={{}}>
                                            ROUND {scoreData.round_num}
                                        </Typography>
                                    </div>
                                </div>
                            </Fade>
                            : null}

                        {teamMetadata !== null ? generateTeamHeader("TeamTwo") : null}

                    </div>
                </Slide>

                {!props.ingame ?
                    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                        <Typography variant="overline" style={{ marginLeft: "10px", marginBottom: "5px", }}>NOT IN GAME</Typography>
                    </div>
                    : null
                }
            </div>
        </>
    )
}

export default TopBar;