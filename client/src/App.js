import { useEffect, useState, useRef } from "react";

//utilities
import { ThemeProvider, createTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { Link, BrowserRouter as Switch, Route, HashRouter, Navigate, Routes } from "react-router-dom";


//pages
import Overlay from "./pages/overlay/Overlay.js"
import Controller from "./pages/controller/Controller.js"

import socket from "./services/Socket.js";

const mainTheme = createTheme({
    palette: {
        type: "dark",
        primary: {
            main: "#fa7581",
        },
        secondary: {
            main: "#454545",
        },
    },
    typography: {
        fontFamily: [
            'Rubik',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
    },
    overrides: {
        MuiCssBaseline: {
            // this is fine for now but perhaps make the background transparent in the future
            "@global": {
                body: {
                    "&::-webkit-scrollbar": {
                        width: 6,
                    },
                    "&::-webkit-scrollbar-track": {
                        boxShadow: `inset 0 0 6px rgba(0, 0, 0, 0.3)`,
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "darkgrey",
                        outline: `1px solid slategrey`,
                    },
                },
            },
        },
    },
})


function App(props) {

    const [connected, setConnected] = useState(false)

    useEffect(() => {
        connect()
        socket.subscribe("onclose", reconnect)
    }, [])

    function connect(){
        socket.connect()
            .then(() => {
                setConnected(true)
            })
    }

    function reconnect(){
        setConnected(false)
        while(!connected){
            setTimeout(() => {
                console.log("trying to reconnect")
                connect()  
            }, 1000)
        }
    }

    return (
        <ThemeProvider theme={mainTheme}>
            <CssBaseline />

            {connected ?

                <HashRouter basename="/">
                    <Routes>
                        <Route exact path="/" element={<Navigate to="/overlay" />} />
                        <Route path="/overlay" element={<Overlay />} />
                        <Route path="/controller" element={<Controller />} />
                    </Routes>
                </HashRouter>

                : null
            }

        </ThemeProvider>
    );
}


export default App;