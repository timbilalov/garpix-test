const HashRouter = window.ReactRouterDOM.HashRouter;
const Switch = window.ReactRouterDOM.Switch;
const Route = window.ReactRouterDOM.Route;
const Link = window.ReactRouterDOM.Link;

class App extends React.Component {
    render() {
        return (
            <div>
                <Switch>
                    <Route exact path='/' component={ AlbumsList }/>
                    <Route path='/album/:number' component={ AlbumDetailed }/>
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