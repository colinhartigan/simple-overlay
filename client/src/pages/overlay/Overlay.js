import { React, useEffect, useState } from 'react';
import { Link } from 'react-router-dom'

//utilities
import { makeStyles, useTheme } from '@material-ui/core/styles';

//components
import { Typography, Button } from '@material-ui/core'

import TopBar from './components/TopBar.js'
import Team from './components/Team.js'
import ref from '../../ref.png' 

const useStyles = makeStyles((theme) => ({
    root: {
        width: "1920px",
        height: "1080px",
        backgroundColor: "transparent",
        //backgroundImage: `url(${ref})`,
    },


}))

function Overlay(props) {

    const classes = useStyles();
    const theme = useTheme();

    return (
        <div className={classes.root}>
            <TopBar />
            <Team />
            <Team mirrored />
        </div>
    )
}

export default Overlay; 