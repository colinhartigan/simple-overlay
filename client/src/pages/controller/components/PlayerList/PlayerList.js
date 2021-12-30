import { React, useEffect, useState } from 'react';
import { Link } from 'react-router-dom'

//utilities
import { makeStyles, useTheme } from '@material-ui/core/styles';

//components
import { Collapse, Paper, Grid, Typography, IconButton, Button } from '@material-ui/core'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';

import { KeyboardArrowUp, KeyboardArrowDown } from '@material-ui/icons'

import Row from './TableRow.js'
import socket from '../../../../services/Socket.js'

const useStyles = makeStyles((theme) => ({
    root: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        maxHeight: "100%",
        overflow: "auto",
        overflowX: "hidden",
        flexGrow: 1,
    },

    container: {
        width: "100%",
        height: "100%",
        padding: "1%",
        maxHeight: "100%",
        overflowY: "auto",
    },

    gridItem: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },

    actionButton: {
        width: "100%",
        height: "100%",
    }
}))




function PlayerList(props) {

    const classes = useStyles();
    const theme = useTheme();

    const [matchData, setMatchData] = useState(null);
    const [ingame, setIngame] = useState(false);

    function matchDetailsCallback(response){
        setMatchData(response)
    }

    function ingameCallback(response){
        setIngame(response)
    }

    useEffect(() => {
        socket.subscribe("match_data",matchDetailsCallback)
        socket.subscribe("game_state",ingameCallback)
    },[])

    return (
        <Paper variant="outlined" className={classes.root}>
            <div className={classes.container}>
                {/* <Typography variant="h5">Players</Typography> */}

                <Table className={classes.table} size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox"></TableCell>
                            <TableCell>Player</TableCell>
                            <TableCell align="right">Team</TableCell>
                            <TableCell align="right">Agent</TableCell>
                            <TableCell align="right">Rank</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>

                        {ingame && matchData !== null ? Object.keys(matchData.teams).map(teamName => {
                            var team = matchData.teams[teamName]
                            return Object.keys(team).map(puuid => {
                                return <Row key={puuid} playerData={team[puuid]} />
                            })
                        }) : null}

                    </TableBody>
                </Table>
            </div>

        </Paper>
    )
}

export default PlayerList; 