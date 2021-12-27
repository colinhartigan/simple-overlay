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
        width: "45%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
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
        width: "134px",
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
        height: "50%",
    }

}))

function TopBar(props) {

    const classes = useStyles();
    const theme = useTheme();

    const [scoreData, setScoreData] = useState(null)

    const spectatorMode = false

    useEffect(() => {
        socket.subscribe("score_data", scoreDataCallback)
    }, [])

    function scoreDataCallback(response) {
        setScoreData(response)
    }

    function generateTeamHeader(teamColor){

        var isRed = teamColor === "red"
        var color = isRed ? "253,69,84" : "37,174,115"

        return (
            <div className={classes.team} style={{ 
                borderRadius: (isRed ? `0px 0px 30px ${spectatorMode ? '30px' : '0px'}` :  `0px 0px ${spectatorMode ? '30px' : '0px'} 30px`),
                backgroundImage: (scoreData.score[teamColor].winning ? `linear-gradient(0deg, rgba(${color},.2) 0%, rgba(255,255,255,0) 100%)` : null),
                width: (spectatorMode ? "183px" : "135px"),
                padding: `${isRed ? '6px' : '0px'} ${!isRed ? '0px' : '6px'}`,
            }}>
                <div className={classes.score} style={{ order: (isRed ? 2 : 1) }}>
                    <Typography variant="h3">
                        <strong>{scoreData.score[teamColor].rounds_won}</strong>
                    </Typography>
                </div>
                <div className={classes.teamInfo} style={{ order: (isRed ? 1 : 2) }}>
                    <Typography variant="h5" style={{ opacity: .8 }}>
                        UwU
                    </Typography>
                    <Typography variant="body2" style={{ opacity: .7 }}>
                        0 - 0
                    </Typography>
                </div>
            </div>
        )
    }

    return (
        <>
            {scoreData !== null ?
                <Slide in={props.ingame} direction="down">
                    <div className={classes.root}>
                        <div className={classes.container}>

                            {generateTeamHeader("red")}

                            <Fade in>
                                <div className={classes.timer}>
                                    <div className={classes.roundNum}>
                                        <Typography variant="overline" style={{ opacity: .9 }}>
                                            ROUND {scoreData.round_num}
                                        </Typography>
                                    </div>
                                </div>
                            </Fade>

                            {generateTeamHeader("blue")}

                        </div>
                    </div>
                </Slide>
                : null}
        </>
    )
}

export default TopBar;