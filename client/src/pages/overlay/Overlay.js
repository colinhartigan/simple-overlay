import { React, useEffect, useState } from 'react';
import { Link } from 'react-router-dom'

//utilities
import { makeStyles, useTheme } from '@material-ui/core/styles';

//components
import { Typography, Button } from '@material-ui/core'

import TopBar from './components/TopBar.js'
import Team from './components/Team.js'
import ref from '../../ref.png' 

import socket from '../../services/Socket.js'

const useStyles = makeStyles((theme) => ({
    root: {
        width: "1920px",
        height: "1080px",
        backgroundColor: "transparent",
        //backgroundImage: `url(${ref})`,
    },


}))

function Overlay(props) {

    const classes = useStyles();
    const theme = useTheme();

    const [ingame, setIngame] = useState(false);
    const [matchData, setMatchData] = useState(null)
    const [teamOne, setTeamOne] = useState("red");
    const [teamTwo, setTeamTwo] = useState("blue");

    useEffect(() => {
        socket.subscribe("game_state", ingameCallback);
        socket.subscribe("match_data", matchDataCallback);
    }, [])

    function matchDataCallback(response){
        setMatchData(response)
        setTeamOne(response.team_one);
        setTeamTwo(response.team_two);
    }

    function ingameCallback(response) {
        if (response === false){
            setMatchData(null)
        }
        setIngame(response);
    }

    return (
        <div className={classes.root}>
            <TopBar ingame={ingame}/>
            <Team ingame={ingame} teamId={teamOne} matchData={matchData}/>
            <Team ingame={ingame} mirrored teamId={teamTwo} matchData={matchData}/>
        </div>
    )
}

export default Overlay; 