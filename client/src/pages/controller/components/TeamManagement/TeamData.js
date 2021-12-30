import { React, useEffect, useState } from 'react';

//utilities
import { makeStyles, useTheme } from '@material-ui/core/styles';

import { Collapse, Paper, Grid, Typography, IconButton, Button } from '@material-ui/core'
import { TextField, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';

import socket from '../../../../services/Socket.js'

const useStyles = makeStyles((theme) => ({

    team: {
        height: "50%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingBottom: "5px",
    },

    body: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },


    actionButton: {
        width: "100%",
        height: "100%",
    }

}))


function TeamData(props) {

    const classes = useStyles();
    const theme = useTheme();

    const teamData = props.teamData 
    const teamId = props.teamName

    function playFlawless(){
        socket.send({"request": "ceremony", "args": {"type": "flawless", "subtext": teamData.name}})
    }

    function updateTeamData(key,value){
        teamData[key] = value
    }

    return (
        <div className={classes.team}>
            <Typography variant="h5">
                {teamId} ({teamData.name})
            </Typography>

            <Grid container className={classes.body} style={{ marginTop: "4px", }}>
                <Grid item xs={6}>
                    <Grid container spacing={3} style={{ width: "100%", height: "100%", }}>
                        <Grid item xs={7}>
                            <TextField
                                label="Full name"
                                defaultValue={teamData.name}
                                onChange={(event) => updateTeamData("name", event.target.value)}
                                variant="standard"
                                size="small"
                                style={{width: "100%",}}
                            />
                        </Grid>
                        <Grid item xs={5}>
                            <TextField
                                label="Abbr."
                                defaultValue={teamData.name_abbr}
                                onChange={(event) => updateTeamData("name_abbr", event.target.value)}
                                variant="standard"
                                size="small"
                                style={{width: "100%",}}
                            />
                        </Grid>
                        <Grid item xs={6} style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "flex-start" }}>
                            <TextField
                                label="Wins"
                                defaultValue={teamData.wins}
                                onChange={(event) => updateTeamData("wins", event.target.value)}
                                variant="standard"
                                type="number"
                                size="small"
                                style={{width: "100%",}}
                            />
                            <Typography variant="h4" style={{ margin: "10px" }}>-</Typography>
                            <TextField
                                label="Losses"
                                defaultValue={teamData.losses}
                                onChange={(event) => updateTeamData("losses", event.target.value)}
                                variant="standard"
                                type="number"
                                size="small"
                                style={{width: "100%",}}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Team image"
                                defaultValue={teamData.team_img}
                                onChange={(event) => updateTeamData("team_img", event.target.value)}
                                variant="standard"
                                size="small"
                                style={{width: "100%",}}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={6}>
                    <Grid container spacing={1} style={{ width: "100%", height: "100%", }}>
                        <Grid item xs={6}>
                            <Button onClick={playFlawless} variant="outlined" color="primary" className={classes.actionButton}>
                                FLAWLESS
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button disabled onClick={null} variant="outlined" color="primary" className={classes.actionButton}>
                                TEAM OVERVIEW
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button disabled onClick={null} variant="outlined" color="primary" className={classes.actionButton}>
                                EMPTY
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button disabled onClick={null} variant="outlined" color="primary" className={classes.actionButton}>
                                EMPTY
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </div>
    )
}

export default TeamData