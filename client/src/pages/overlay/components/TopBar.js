import { React, useEffect, useState } from 'react';
import { Link } from 'react-router-dom'

//utilities
import { makeStyles, useTheme } from '@material-ui/core/styles';

//components
import { Typography, Button } from '@material-ui/core'

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
        height: "72px",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },

    team: {
        width: "183px",
        flexGrow: 1,
        height: "100%",
        backgroundColor: "#1A252B",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },

    score: {
        width: "40%",
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
    }

}))

function TopBar(props) {

    const classes = useStyles();
    const theme = useTheme();

    return (
        <div className={classes.root}>
            <div className={classes.container}>

                <div className={classes.team} style={{ borderRadius: "0px 0px 0px 30px", backgroundImage: "linear-gradient(0deg, rgba(253,69,84,.2) 0%, rgba(255,255,255,0) 100%)" }}>
                    <div className={classes.score} style={{ order: 2 }}>
                        <Typography variant="h3">
                            <strong>13</strong>
                        </Typography>
                    </div>
                    <div className={classes.teamInfo} style={{ order: 1 }}>
                        <Typography variant="h5" style={{ opacity: .8 }}>
                            ATK
                        </Typography>
                        <Typography variant="body2" style={{ opacity: .7 }}>
                            0 - 3
                        </Typography>
                    </div>

                </div>

                <div className={classes.timer}>
                    <div className={classes.roundNum}>
                        <Typography variant="overline" style={{ opacity: .6 }}>
                            ROUND 26
                        </Typography>
                    </div>
                </div>

                <div className={classes.team} style={{ borderRadius: "0px 0px 30px 0px", backgroundImage: "linear-gradient(0deg, rgba(37, 174, 115,.2) 0%, rgba(255,255,255,0) 100%)" }}>
                    <div className={classes.score} style={{ order: 1 }}>
                        <Typography variant="h3">
                            <strong>13</strong>
                        </Typography>
                    </div>
                    <div className={classes.teamInfo} style={{ order: 2 }}>
                        <Typography variant="h5" style={{ opacity: .8 }}>
                            DEF
                        </Typography>
                        <Typography variant="body2" style={{ opacity: .7 }}>
                            0 - 3
                        </Typography>
                    </div>

                </div>

            </div>
        </div>
    )
}

export default TopBar;