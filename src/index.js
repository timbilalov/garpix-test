import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch } from "react-router-dom";
import AlbumsList from "./albums-list";
import AlbumDetailed from "./album-detailed";
import "bootstrap";

export default class App extends React.Component {
    render() {
        document.querySelector(".preloader").style.display = "none";

        return (
            <div>
                <Switch>
                    <Route exact path="/" component={ AlbumsList }/>
                    <Route path="/album/:number" component={ AlbumDetailed }/>
                </Switch>
            </div>
        )
    }
}

App.consts = {
    albumsStorageName: "albums",
    albumsStorageLastID: "albums-last-id"
};

ReactDOM.render((
    <HashRouter>
        <App />
    </HashRouter>
    ),
    document.getElementById("app")
)