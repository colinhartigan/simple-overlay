import { React, useEffect, useState } from 'react';
import { Link } from 'react-router-dom'

//utilities
import { makeStyles, useTheme } from '@material-ui/core/styles';

import { Collapse, Paper, Grid, Typography, IconButton, Button } from '@material-ui/core'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';

import { KeyboardArrowUp, KeyboardArrowDown } from '@material-ui/icons'

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
    },

    container: {
        width: "95%",
        height: "95%",
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

function Row(props) {

    const classes = useStyles();
    const theme = useTheme();

    const [open, setOpen] = useState(false)

    const playerData = props.playerData

    function toggle(){
        setOpen(!open)
    }

    function playClutch(){
        socket.send({"request": "ceremony", "args": {"type": "clutch", "subtext": `${playerData.identity.name}`}})
    }

    return (
        <>
            <TableRow>
                <TableCell padding="checkbox">
                    <IconButton size="medium" onClick={toggle}>
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </TableCell>
                <TableCell >{playerData.identity.name}#{playerData.identity.tag}</TableCell>
                <TableCell align="right">{playerData.identity.team}</TableCell>
                <TableCell align="right">{playerData.agent.agent_name}</TableCell>
                <TableCell align="right">{playerData.rank.tier_name}</TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>

                        <Grid container spacing={2} style={{ padding: "10px 0px 10px 0px" }}>
                            <Grid item xs={4} className={classes.gridItem}>
                                <Button onClick={playClutch} variant="outlined" color="primary" className={classes.actionButton}>
                                    CLUTCH
                                </Button>
                            </Grid>

                            <Grid item xs={4} className={classes.gridItem}>
                                <Button disabled variant="outlined" color="primary" className={classes.actionButton}>
                                    DISPLAY OVERVIEW
                                </Button>
                            </Grid>

                            <Grid item xs={4} className={classes.gridItem}> 
                                <Button disabled variant="outlined" color="primary" className={classes.actionButton}>
                                    HIGHLIGHT
                                </Button>
                            </Grid>

                        </Grid>

                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    )
}

export default Row