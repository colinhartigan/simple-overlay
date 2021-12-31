import { React, useEffect, useState } from 'react';

//utilities
import { makeStyles, useTheme } from '@material-ui/core/styles';

//components
import { Collapse, Paper, Grid, Typography, IconButton, Button } from '@material-ui/core'
import { TextField, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';

import { KeyboardArrowUp, KeyboardArrowDown } from '@material-ui/icons'

import TeamData from './TeamData.js'
import socket from '../../../../services/Socket.js'

const useStyles = makeStyles((theme) => ({
    root: {
        width: "100%",
        height: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        maxHeight: "100%",
        overflow: "auto",
    },

    container: {
        width: "100%",
        padding: "2%",
        height: "auto",
        maxHeight: "100%",
        overflowY: "auto",
    },

}))


function Teams(props) {

    const classes = useStyles();
    const theme = useTheme();

    const [teamData, setTeamData] = useState(null);

    useState(() => {
        socket.request({"request": "fetch_team_data"}, teamDataCallback)
        socket.subscribe("team_data", teamDataCallback)
    }, []);

    function teamDataCallback(response){
        console.log(response)
        setTeamData(response)
    }

    function updateTeamData(){
        socket.send({"request": "update_team_data", "args": {"data": teamData}})
    }

    return (
        <Paper variant="outlined" className={classes.root}>
            <div className={classes.container}>
                {teamData !== null ? Object.keys(teamData.teams).map(teamName => {
                    return (
                        <TeamData key={teamName} update={updateTeamData} teamName={teamName} teamData={teamData.teams[teamName]} />
                    )
                }) : null}

            </div>
            <div style={{ width: "80%", height: "40px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <Button onClick={updateTeamData} variant="outlined" color="primary" style={{ width: "100%", height: "80%", }}>
                    Save
                </Button>
            </div>

        </Paper>
    )
}

export default Teams;  