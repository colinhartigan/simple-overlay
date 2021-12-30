import { React, useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom'

//utilities
import { makeStyles, useTheme } from '@material-ui/core/styles';

//components
import { Paper, Typography, Grow, Slide, Fade, Zoom } from '@material-ui/core'

import primeGaming from '../../../assets/primegaming.png'
import redbull from '../../../assets/redbull.png'

import socket from '../../../services/Socket.js'

const useStyles = makeStyles((theme) => ({
    root: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 0,
    },

    ceremonyPaper: {
        width: "400px",
        height: "150px",
        backgroundColor: "#1A252B",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },

    title: {
        width: "100%",
        height: "60%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-end",
    },

    teamName: {
        width: "100%",
        height: "40%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-start",
    }

}))

function Ceremony(props) {

    const classes = useStyles();
    const theme = useTheme();

    const containerRef = useRef(null);

    const [show, setShow] = useState(false);

    const ceremonies = {
        "flawless": {
            title: "FLAWLESS",
            backgroundImage: primeGaming,
        },
        "clutch": {
            title: "CLUTCH",
            backgroundImage: redbull,
        }
    }

    const ceremonyData = ceremonies[props.type]

    useEffect(() => {
        run()
    },[]);

    function run() {
        setShow(true);
        setTimeout(() => {
            setShow(false);
        },4000)
    }

    return (
        <Grow in={show} orientation="vertical" mountOnEnter unmountOnExit>
            <div className={classes.root}>
                <Paper variant="outlined" className={classes.ceremonyPaper} style={{
                    backgroundImage: `linear-gradient(0deg, rgba(28,34,42,1) 0%, rgba(28,34,42,.7) 100%), url(${ceremonyData.backgroundImage})`,
                    backgroundSize: "100% auto",
                    backgroundPosition: "50% 50%",
                }}>
                    <div className={classes.title} ref={containerRef}>
                        <Slide in direction="down" timeout={{ enter: 800, }} style={{transitionDelay: 300}} container={containerRef.current}>
                            <Typography variant="h2">{ceremonyData.title}</Typography>
                        </Slide>
                    </div>
                    <div className={classes.teamName}>
                        <Fade in style={{transitionDelay: 1000}}>
                            <Typography variant="overline" style={{ fontSize: "20px", lineHeight: "40px" }}>{props.subtext}</Typography>
                        </Fade>
                    </div>
                </Paper>
            </div>
        </Grow>
    )
}

export default Ceremony;