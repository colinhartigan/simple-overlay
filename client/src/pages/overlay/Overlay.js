import { React, useEffect, useState } from 'react';
import { Link } from 'react-router-dom'

//utilities
import { makeStyles, useTheme } from '@material-ui/core/styles';

//components
import { Typography, Button } from '@material-ui/core'

import TopBar from './components/TopBar.js'
import Team from './components/Team.js'
import Ceremony from './components/Ceremony.js'
import ref from '../../ref.png' 

import socket from '../../services/Socket.js'

const useStyles = makeStyles((theme) => ({
    root: {
        width: "100vw",
        height: "100vh",
    }
}))

function Overlay(props) {

    const classes = useStyles();
    const theme = useTheme();

    const [ingame, setIngame] = useState(false);
    const [matchData, setMatchData] = useState(null)
    const [teamOne, setTeamOne] = useState("red");
    const [teamTwo, setTeamTwo] = useState("blue");

    const [teamData, setTeamData] = useState(null);
    const [liveTeamData, setLiveTeamData] = useState(null)

    const [ceremony, setCeremony] = useState(null);

    useEffect(() => {
        socket.subscribe("game_state", ingameCallback);
        socket.subscribe("match_data", matchDataCallback);
        socket.subscribe("ceremony", ceremonyCallback)
        socket.subscribe("live_team_data", liveTeamDataCallback)
        socket.subscribe("team_data", teamDataCallback)

        socket.request({ "request": "fetch_team_data" }, teamDataCallback)
        socket.request({ "request": "fetch_live_teams" }, liveTeamDataCallback)
    }, [])

    function teamDataCallback(response){
        setTeamData(response)
    }

    function liveTeamDataCallback(response) {
        setLiveTeamData(response)
    }

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

    function ceremonyCallback(response){
        if(ceremony === null){
            setCeremony(<Ceremony type={response.type} subtext={response.subtext}/>)
            setTimeout(() => {
                setCeremony(null)
            },5000);
        }
    }

    return (
        <div className={classes.root}>
            <TopBar ingame={ingame} liveTeamData={liveTeamData} teamMetadata={teamData} />
            <Team ingame={ingame} teamId={teamOne} matchData={matchData}/>
            <Team ingame={ingame} mirrored teamId={teamTwo} matchData={matchData}/>
            {ceremony}
        </div>
    )
}

export default Overlay; 