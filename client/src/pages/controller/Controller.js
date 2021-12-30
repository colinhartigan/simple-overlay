import { React, useEffect, useState } from 'react';
import { Link } from 'react-router-dom'

//utilities
import { makeStyles, useTheme } from '@material-ui/core/styles';

//components
import { Grid, Typography, Button } from '@material-ui/core'

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
        maxHeight: "100vh",
    },

    container: {
        width: "90%",
        height: "95vh",
        maxHeight: "95vh",
    },

    panel: {
        height: "100%",
    },

    header: {
        height: "5vh",
        width: "100%",
    }

}))

function Controller(props) {

    const classes = useStyles();
    const theme = useTheme();


    return (
        <div className={classes.root}>
            <div className={classes.header}>
                so no head?
            </div>
            <Grid container spacing={3} className={classes.container}>
                <Grid item xs={12} md={6} >
                    <PlayerList />
                </Grid>
                <Grid item xs={12} md={6} >
                    <Teams />
                </Grid>
                <Grid item xs={12} md={6} >
                
                </Grid>
                <Grid item xs={12} md={6} >
                
                </Grid>
            </Grid>
        </div>
    )
}

export default Controller; 