import { React, useEffect, useState } from 'react';
import { Link } from 'react-router-dom'

//utilities
import { makeStyles, useTheme } from '@material-ui/core/styles';

//components
import { Grid, TextField, Button } from '@material-ui/core'

import PlayerList from './components/PlayerList/PlayerList.js'
import Teams from './components/TeamManagement/Teams.js'
import socket from '../../services/Socket.js'

const useStyles = makeStyles((theme) => ({
    root: {
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
    },

    container: {
        width: "90%",
        height: "auto",
        flexGrow: 1,
        maxHeight: "95%",
    },

    header: {
        height: "60px",
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    }

}))

function Controller(props) {

    const classes = useStyles();
    const theme = useTheme();

    const [ip, setIp] = useState(socket.ip)

    async function reconnect(){
        console.log("reconnecting")
        socket.ip = ip
        await socket.connect()
    }

    return (
        <div className={classes.root}>
            <div className={classes.header}>
                <TextField
                    label="server ip"
                    defaultValue={ip}
                    onChange={(event) => setIp(event.target.value)}
                    variant="standard"
                    size="small"
                />
                <Button onClick={reconnect} color="primary" variant="outlined" size="small">
                    Reconnect
                </Button>
            </div>
            <Grid container spacing={1} className={classes.container}>
                <Grid item xs={12} md={6} style={{ height: "50%" }}>
                    <PlayerList />
                </Grid>
                <Grid item xs={12} md={6} style={{ height: "50%" }}>
                    <Teams />
                </Grid>
                <Grid item xs={12} md={6} style={{ height: "50%" }}>

                </Grid>
                <Grid item xs={12} md={6} style={{ height: "50%" }}>

                </Grid>
            </Grid>
        </div>
    )
}

export default Controller; 