import { React, useEffect, useState } from 'react';
import { Link } from 'react-router-dom'

//utilities
import { makeStyles, useTheme } from '@material-ui/core/styles';

import { Collapse, TextField, Grid, Typography, IconButton, Button } from '@material-ui/core'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';

import { Delete, Done, KeyboardArrowUp, KeyboardArrowDown } from '@material-ui/icons'

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

    const teamData = props.teamData
    const teamId = props.teamId
    const changeTeamData = props.changeTeamData
    const deleteTeam = props.deleteTeam
    const editor = props.editor
    const selectTeam = props.selectTeam

    function updateTeamData(key, value) {
        teamData[key] = value
        changeTeamData(teamId, teamData)
    }

    function toggle() {
        setOpen(!open)
    }

    return (
        <>
            <TableRow>
                {editor ?
                    <TableCell padding="checkbox">
                        <IconButton size="medium" onClick={toggle}>
                            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                    </TableCell>
                : null}
                <TableCell >{teamData.name} ({teamData.name_abbr})</TableCell>
                <TableCell align="right">{teamData.wins}-{teamData.losses}</TableCell>
                <TableCell align="right">
                    {editor ?
                        <IconButton onClick={() => { deleteTeam(teamId) }} color="primary" size="small" variant="outlined" style={{ width: "auto", height: "100%" }}>
                            <Delete />
                        </IconButton>
                        :
                        <IconButton onClick={() => { selectTeam(teamId) }} color="primary" size="small" variant="outlined" style={{ width: "auto", height: "100%" }}>
                            <Done />
                        </IconButton>
                    }
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0, }} colSpan={5}>
                    <Collapse in={open} timeout="auto" mountOnEnter unmountOnExit>

                        <Grid container spacing={3} style={{ width: "100%", height: "100%", padding: "12px 5px 7px 5px" }}>
                            <Grid item xs={7}>
                                <TextField
                                    label="Full name"
                                    defaultValue={teamData.name}
                                    onChange={(event) => updateTeamData("name", event.target.value)}
                                    variant="standard"
                                    size="small"
                                    style={{ width: "100%", }}
                                />
                            </Grid>
                            <Grid item xs={5}>
                                <TextField
                                    label="Abbr."
                                    defaultValue={teamData.name_abbr}
                                    onChange={(event) => updateTeamData("name_abbr", event.target.value)}
                                    variant="standard"
                                    size="small"
                                    style={{ width: "100%", }}
                                    inputProps={{ maxLength: 3 }}
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
                                    style={{ width: "100%", }}
                                />
                                <Typography variant="h4" style={{ margin: "10px" }}>-</Typography>
                                <TextField
                                    label="Losses"
                                    defaultValue={teamData.losses}
                                    onChange={(event) => updateTeamData("losses", event.target.value)}
                                    variant="standard"
                                    type="number"
                                    size="small"
                                    style={{ width: "100%", }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField disabled
                                    label="Team image"
                                    defaultValue={teamData.team_img}
                                    onChange={(event) => updateTeamData("team_img", event.target.value)}
                                    variant="standard"
                                    size="small"
                                    style={{ width: "100%", }}
                                />
                            </Grid>
                        </Grid>

                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    )
}

export default Row