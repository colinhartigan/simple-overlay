import { React, useEffect, useState } from 'react';

//utilities
import { makeStyles, useTheme } from '@material-ui/core/styles';

//components
import { Collapse, Paper, Grid, Typography, IconButton, Button, responsiveFontSizes } from '@material-ui/core'
import { TextField, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';

import { KeyboardArrowUp, KeyboardArrowDown } from '@material-ui/icons'

import CurrentTeam from './CurrentTeam.js'
import TeamListDialog from './TeamListDialog.js'
import socket from '../../../../services/Socket.js'

const useStyles = makeStyles((theme) => ({
    root: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        maxHeight: "100%",
    },

    container: {
        width: "100%",
        marginTop: "15px",
        height: "100%",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: "0px 10px 0px 10px",
    },

    editButton: {
        width: "90%",
        height: "50px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        marginTop: "5px",
        alignItems: "center"
    },

}))


function Teams(props) {

    const classes = useStyles();
    const theme = useTheme();

    const [teamData, setTeamData] = useState(null);
    const [liveTeamData, setLiveTeamData] = useState(null)
    const [dialogOpen, setDialogOpen] = useState(false);

    useState(() => {
        socket.request({ "request": "fetch_team_data" }, teamDataCallback)
        socket.request({ "request": "fetch_live_teams" }, liveTeamDataCallback)

        socket.subscribe("team_data", teamDataCallback)
    }, []);

    function liveTeamDataCallback(response) {
        console.log(response)
        setLiveTeamData(response)
    }

    function teamDataCallback(response) {
        setTeamData(response)
    }

    return (
        <>
            {teamData !== null ?
                <>
                    <TeamListDialog editor open={dialogOpen} setOpen={setDialogOpen} teamData={teamData} />
                    <Paper variant="outlined" className={classes.root}>

                        <div className={classes.container}>
                            <CurrentTeam id="TeamOne" liveTeamData={liveTeamData} teamData={teamData} />
                            <CurrentTeam id="TeamTwo" liveTeamData={liveTeamData} teamData={teamData} />
                        </div>

                        <div className={classes.editButton}>
                            <Button onClick={() => { setDialogOpen(true) }} size="medium" variant="outlined" color="primary" style={{ width: "100%", height: "80%", }}>
                                Edit teams
                            </Button>
                        </div>

                    </Paper>
                </>
                : null}
        </>
    )
}

export default Teams;  