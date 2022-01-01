import { React, useEffect, useState } from 'react';
import { Link } from 'react-router-dom'

//utilities
import { makeStyles, useTheme } from '@material-ui/core/styles';

//components
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Typography, IconButton, Button } from '@material-ui/core'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';

import { GroupAdd } from '@material-ui/icons'

import TeamRow from './TeamRow.js'

import socket from '../../../../services/Socket.js'

const useStyles = makeStyles((theme) => ({

    content: {
        padding: "0px 10px 0px 10px"
    },

    tableActions: {
        width: "100%",
        padding: "13px 0px 0px 0px",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    }

}))

function TeamListDialog(props) {
    const classes = useStyles();
    const theme = useTheme();

    const [teamData, setTeamData] = useState(props.teamData)

    const open = props.open
    const editor = props.editor
    const selectCallback = props.selectCallback
    const resetCallback = props.resetCallback

    useEffect(() => {
        if (open) {
            setTeamData(props.teamData)
        }
    }, [open])

    function changeTeamData(team, data) {
        teamData[team] = data
        setTeamData({ ...teamData })
    }

    function deleteTeam(team) {
        delete teamData[team]
        console.log(teamData)
        setTeamData({ ...teamData })
    }

    function addTeam() {
        console.log(teamData)
        var max = Math.max.apply(Math, Object.keys(teamData))
        if (max === -Infinity) {
            max = 0
        }
        console.log(max)
        teamData[max + 1] = {
            name: "New Team",
            name_abbr: "NEW",
            wins: 0,
            losses: 0,
            team_img: "",
        }
        setTeamData({ ...teamData })
    }

    function publishTeamData() {
        socket.send({ "request": "update_team_data", "args": { "data": teamData } })
        props.setOpen(false)
    }

    return (
        <Dialog open={open} fullWidth maxWidth="sm" scroll="paper">
            <DialogTitle>Teams</DialogTitle>
            <DialogContent className={classes.content}>

                <Table className={classes.table} size="small">
                    <TableHead>
                        <TableRow>

                            {editor ? <TableCell padding="checkbox"></TableCell> : null}
                            <TableCell>Name</TableCell>
                            <TableCell align="right">W-L</TableCell>
                            <TableCell align="right">{editor ? 'Delete' : 'Select'}</TableCell>

                        </TableRow>
                    </TableHead>
                    <TableBody>

                        {teamData !== null ? Object.keys(teamData).map(teamId => {
                            var team = teamData[teamId]
                            return <TeamRow editor={editor} teamId={teamId} teamData={team} changeTeamData={changeTeamData} selectTeam={selectCallback} deleteTeam={deleteTeam} key={teamId} />
                        }) : null}

                    </TableBody>
                </Table>

                {editor ?
                    <div className={classes.tableActions}>
                        <Button onClick={addTeam} startIcon={<GroupAdd />} variant="outlined" size="medium" color="primary">
                            ADD TEAM
                        </Button>
                    </div>
                    : null}

            </DialogContent>
            <DialogActions>
                {!editor ?
                    <Button color="primary" onClick={() => { props.setOpen(false) }}>
                        Cancel
                    </Button>
                    : null}
                {!editor ?
                    <Button color="primary" onClick={() => { props.setOpen(false); resetCallback() }}>
                        Reset
                    </Button>
                : null}
                {editor ?
                    <Button color="primary" onClick={publishTeamData}>
                        Save
                    </Button>
                    : null}
            </DialogActions>
        </Dialog>
    )
}

export default TeamListDialog