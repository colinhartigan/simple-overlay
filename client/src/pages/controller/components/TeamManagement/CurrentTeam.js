import { React, useEffect, useState } from 'react';

//utilities
import { makeStyles, useTheme } from '@material-ui/core/styles';

//components
import { Collapse, Paper, Grid, Typography, IconButton, Button } from '@material-ui/core'
import { TextField, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';

import { KeyboardArrowUp, KeyboardArrowDown } from '@material-ui/icons'

import TeamListDialog from './TeamListDialog.js'
import socket from '../../../../services/Socket.js'

const useStyles = makeStyles((theme) => ({
    teamPaper: {
        width: "100%",
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        padding: "8px 10px 10px 10px",
    },

    teamActions: {
        width: "100%",
        marginTop: "10px",
    },

    actionButton: {
        width: "100%",
    }

}))

function CurrentTeam(props) {

    const classes = useStyles();
    const theme = useTheme();

    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [selectedTeamData, setSelectedTeamData] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const id = props.id;
    const teamData = props.teamData;

    useEffect(() => {
        if(selectedTeamId !== null && teamData[selectedTeamId] !== undefined){
            setSelectedTeamData(teamData[selectedTeamId])
        } else {
            setSelectedTeamData(null)
        }
    },[teamData])

    function selectCallback(teamId){
        setSelectedTeamId(teamId);
        setSelectedTeamData(teamData[teamId])
        setDialogOpen(false);
    }

    function resetCallback(){
        setSelectedTeamId(null);
        setSelectedTeamData(null);
    }

    function playFlawless(){
        socket.send({"request": "ceremony", "args": {"type": "flawless", "subtext": selectedTeamData.name}})
    }

    return (
        <>
            <TeamListDialog resetCallback={resetCallback} selectCallback={selectCallback} editor={false} open={dialogOpen} setOpen={setDialogOpen} teamData={teamData} />
            <Grid item xs={12} style={{ width: "100%", }}>
                <Paper variant="outlined" className={classes.teamPaper}>
                    <Typography variant="h6">{id} {selectedTeamData !== null ? `(${selectedTeamData.name})` : null}</Typography>

                    <div className={classes.teamActions}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Button onClick={() => {setDialogOpen(true)}} variant="outlined" color="primary" size="medium" className={classes.actionButton}>
                                    Select team
                                </Button>
                            </Grid>
                            <Grid item xs={4}>
                                <Button onClick={playFlawless} variant="outlined" color="primary" size="medium" className={classes.actionButton}>
                                    Flawless
                                </Button>
                            </Grid>
                            <Grid item xs={4}>
                                <Button disabled variant="outlined" color="primary" size="medium" className={classes.actionButton}>
                                    Team Overview
                                </Button>
                            </Grid>
                            <Grid item xs={4}>
                                <Button disabled variant="outlined" color="primary" size="medium" className={classes.actionButton}>
                                    Empty
                                </Button>
                            </Grid>
                        </Grid>
                    </div>
                </Paper>
            </Grid>
        </>
    )
}

export default CurrentTeam;