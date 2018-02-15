(function() {
    const HashRouter = window.ReactRouterDOM.HashRouter;
    const Switch = window.ReactRouterDOM.Switch;
    const Route = window.ReactRouterDOM.Route;
    const Link = window.ReactRouterDOM.Link;

    let albums;
    let lastID;
    const albumsStorageName = "albums";
    const albumsStorageLastID = "albums-last-id";
    if (localStorage) {
        albums = JSON.parse(localStorage.getItem(albumsStorageName)) || [];
        lastID = parseInt(localStorage.getItem(albumsStorageLastID)) || 0;
    }
    let newAlbumModal, newAlbumNameInput;
    let editAlbumModals;

    console.log("lastID: " + lastID + "; albums: ", albums);

    function Album(props) {
        const album = props.value;

        return (
            <div className="col-md-4">
                <div className="card mb-4 box-shadow">
                    {
                        album.images && album.images.length > 0 &&
                        <img className="card-img-top" src={ album.images[0] } alt="Card image cap" />
                    }
                    {
                        (!album.images || album.images.length <= 0) &&
                        <img className="card-img-top" data-src="holder.js/100px225?theme=thumb&bg=55595c&fg=eceeef&text=Thumbnail" alt="Card image cap" />
                    }
                    <div className="card-body">
                        <p className="card-text">{ album.name }</p>
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="btn-group">
                                <Link to={{ pathname: "/album/" + album.id }}>
                                    <button type="button" className="btn btn-sm btn-outline-secondary">View</button>
                                </Link>
                                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={ () => props.onEditStart(album.id) }>Edit</button>
                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={ () => props.onRemove(album.id) }>Delete</button>
                            </div>
                            <small className="text-muted">
                                { (album.images || []).length }&nbsp;photos
                            </small>
                        </div>
                    </div>

                    <ModalEditAlbum value={ album } onEditSave={ (id) => props.onEditSave(album.id) } />
                </div>
            </div>
        );
    }

    function ModalNewAlbum(props) {
        return (
            <div className="modal fade" id="modal-new-album" tabIndex="-1" role="dialog" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Добавить альбом</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="input-new-album-name">Название альбома</label>
                                <input type="text" className="form-control" id="input-new-album-name" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" onClick={props.onAdd}>Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    function ModalEditAlbum(props) {
        const album = props.value || {};

        return (
            <div className="modal fade modal-edit-album" data-id={ album.id } tabIndex="-1" role="dialog" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Редактировать альбом</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Название альбома</label>
                                <input type="text" className="form-control input-edit-album-name" defaultValue={ album.name } />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" onClick={ props.onEditSave }>Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    class AlbumsList extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                albums: albums,
                lastID: lastID
            }
        }

        getUniqueID() {
            let id = this.state.lastID + 1;
            const albums = this.state.albums.slice();
            const checkAlbums = function() {
                let len = albums.filter((elem) => elem.id === id).length;
                return len === 0;
            };

            while (!checkAlbums()) {
                ++id;
            }
            return id;
        };

        createNewAlbum(album) {
            if (!album || typeof album !== "object") {
                return;
            }

            var albumName = album.name;
            if (!albumName || typeof albumName !== "string") {
                return;
            }

            const albumID = album.id || this.getUniqueID();
            const albums = this.state.albums.slice();
            const newAlbum = {
                name: albumName,
                id: albumID
            };
            albums.push(newAlbum);
            this.setState({
                albums: albums,
                lastID: albumID
            });

            if (localStorage) {
                localStorage.setItem(albumsStorageName, JSON.stringify(albums));
                localStorage.setItem(albumsStorageLastID, albumID);
            }

            console.log("created new album: " + albumName + "; id: " + albumID);
        }

        handleAdd() {
            const albumName = newAlbumNameInput.val();
            const album = {
                name: albumName
            };
            this.createNewAlbum(album);
            newAlbumModal.modal("hide");
            newAlbumNameInput.val("").blur();
        }

        handleEditStart(id) {
            id = parseInt(id);
            if (isNaN(id)) {
                return;
            }

            const albums = this.state.albums.slice();

            let albumToEdit = albums.filter(function(elem) {
                return elem.id === id;
            });
            if (!albumToEdit.length) {
                return;
            }

            albumToEdit = albumToEdit[0];
            const editAlbumModal = editAlbumModals.filter("[data-id=" + id + "]");
            editAlbumModal.modal("show");
        }

        handleEditSave(id) {
            id = parseInt(id);
            if (isNaN(id)) {
                return;
            }

            const albums = this.state.albums.slice();

            let albumToSave = albums.filter(function(elem) {
                return elem.id === id;
            });
            if (!albumToSave.length) {
                return;
            }

            albumToSave = albumToSave[0];
            const index = albums.indexOf(albumToSave);

            const editAlbumModal = editAlbumModals.filter("[data-id=" + id + "]");
            const editAlbumNameInput = editAlbumModal.find(".input-edit-album-name");
            const newName = editAlbumNameInput.val();
            albums[index].name = newName;

            this.setState({
                albums: albums
            });

            if (localStorage) {
                localStorage.setItem(albumsStorageName, JSON.stringify(albums));
            }

            editAlbumModal.modal("hide");
            editAlbumNameInput.val("").blur();

            console.log("saved album with id: " + id);
        }

        handleRemove(id) {
            id = parseInt(id);
            if (isNaN(id)) {
                return;
            }

            const albums = this.state.albums.slice();

            let albumToRemove = albums.filter(function(elem) {
                return elem.id === id;
            });
            if (!albumToRemove.length) {
                return;
            }

            albumToRemove = albumToRemove[0];
            albums.splice(albums.indexOf(albumToRemove), 1);
            this.setState({
                albums: albums
            })

            if (localStorage) {
                localStorage.setItem(albumsStorageName, JSON.stringify(albums));
            }

            console.log("removed album with id: " + id);
        }

        clearAll() {
            this.setState({
                albums: [],
                lastID: 0
            });

            if (localStorage) {
                localStorage.clear();
            }
        }

        render() {
            const albums = this.state.albums.map((elem) => {
                return <Album key={ elem.id } value={ elem } onEditStart={ (id) => this.handleEditStart(id) } onEditSave={ (id) => this.handleEditSave(id) } onRemove={ (id) => this.handleRemove(id) } />
            });

            return (
                <div>
                    <div className="pb-5">
                        <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#modal-new-album">
                            Добавить альбом
                        </button>

                        <ModalNewAlbum onAdd={ () => this.handleAdd() } />
                    </div>

                    <div className="row">
                        { albums }
                    </div>


                    {
                        this.state.albums.length > 0 &&
                        <div className="pt-5">
                            <button type="button" className="btn btn-light btn-sm" onClick={ () => this.clearAll() }>
                                Удалить все альбомы и очистить localStorage
                            </button>
                        </div>
                    }
                </div>
            )
        }

        componentDidMount() {
            newAlbumNameInput = $("#input-new-album-name");
            newAlbumModal = $("#modal-new-album");
            newAlbumModal.on("shown.bs.modal", function() {
                newAlbumNameInput.focus();
            });

            editAlbumModals = $(".modal-edit-album");
            Holder.run();
        }

        componentDidUpdate() {
            editAlbumModals = $(".modal-edit-album");

            Holder.run();
            if (localStorage) {
                localStorage.setItem(albumsStorageName, JSON.stringify(this.state.albums.slice()))
            }
        }
    }

    class AlbumDetailed extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                albums: albums,
            }
        }

        handleSave(component) {
            const files = component.state.files;

            const id = parseInt(this.props.match.params.number);
            const albums = this.state.albums.slice();
            const album = albums.filter((elem) => elem.id === id)[0];
            if (!album) {
                return;
            }

            album.images = album.images || [];
            const reader = new FileReader();
            reader.readAsDataURL(files[0]);
            const context = this;
            reader.onloadend = function() {
                const base64data = reader.result;
                album.images.push(base64data);

                context.setState({
                    albums: albums
                });

                if (localStorage) {
                    localStorage.setItem(albumsStorageName, JSON.stringify(albums))
                }
            }


            component.setState({
                files: [],
                preview: false
            });
        }

        handleRemove(index) {
            const id = parseInt(this.props.match.params.number);
            const albums = this.state.albums.slice();
            const album = albums.filter((elem) => elem.id === id)[0];
            if (!album) {
                return;
            }

            const albumImages = album.images;
            albumImages.splice(index, 1);
            this.setState({
                albums: albums
            });

            if (localStorage) {
                localStorage.setItem(albumsStorageName, JSON.stringify(albums));
            }
        }

        render() {
            const id = parseInt(this.props.match.params.number);
            const albums = this.state.albums.slice();
            const album = albums.filter((elem) => elem.id === id)[0];
            if (!album) {
                return;
            }

            let albumImages = album.images || [];
            albumImages = albumImages.map((elem, index) => {
                return (
                    <div className="col-md-4">
                        <div className="card mb-4 box-shadow">
                            <img className="card-img-top" src={ elem } alt="Card image cap" />

                            <button type="button" className="close" aria-label="Delete" onClick={ () => this.handleRemove(index) }>
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                    </div>
                )
            });

            return (
                <div>
                    <div className="pb-5">
                        <Link to={{ pathname: "/" }}>
                            <button className="btn btn-sm btn-light">Назад</button>
                        </Link>
                    </div>

                    <h1>Альбом: { album.name }</h1>

                    {
                        albumImages &&
                        <div className="row py-5">
                            { albumImages }
                        </div>
                    }

                    <ImageUpload onSave={ (component) => this.handleSave(component) } />
                </div>
            )
        }
    }

    const { Component } = React
    const { render } = ReactDOM
    const Dropzone = reactDropzone


    const handleDropRejected = (...args) => console.log('reject', args)

    class ImageUpload extends Component {
        constructor(props) {
            super(props)
            this.state = {
                preview: null,
                files: []
            }
        }

        handleDrop(files) {
            this.setState({
                files: files,
                preview: files[0].preview
            })
        }

        render() {
            const { preview } = this.state

            return (
                <div>
                    <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#modal-new-image">
                        Добавить изображение
                    </button>

                    <div className="modal fade" id="modal-new-image" tabIndex="-1" role="dialog" aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Добавить изображение</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="dd">
                                        <div className="dd__zone dd__zone--fake bg-light border border-primary rounded">
                                            <span className="dd__text">Drag a file here or click to upload.</span>
                                        </div>

                                        <Dropzone className="dd__zone" onDrop={ (files) => this.handleDrop(files) } accept="image/jpeg,image/jpg,image/tiff,image/gif" multiple={ false } onDropRejected={ handleDropRejected } />
                                        {
                                            preview &&
                                            <img className="dd__img" src={ preview } alt="image preview" />
                                        }
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                    <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={ () => this.props.onSave(this) }>Save changes</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    }


    class App extends React.Component {
        render() {
            return (
                <main>
                    <Switch>
                        <Route exact path='/' component={ AlbumsList }/>
                        <Route path='/album/:number' component={ AlbumDetailed }/>
                    </Switch>
                </main>
            )
        }
    }

    ReactDOM.render((
        <HashRouter>
            <App />
        </HashRouter>
        ),
        document.getElementById("app")
    )
})();