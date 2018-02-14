(function() {
    let albums;
    let lastID;
    const albumsStorageName = "albums";
    const albumsStorageLastID = "albums-last-id";
    if (localStorage) {
        albums = JSON.parse(localStorage.getItem(albumsStorageName)) || [];
        lastID = parseInt(localStorage.getItem(albumsStorageLastID)) || 0;
    }
    let newAlbumModal, newAlbumNameInput;

    console.log("lastID: " + lastID + "; albums: ", albums);

    function Album(props) {
        const album = props.value;

        return (
            <div className="col-md-4">
                <div className="card mb-4 box-shadow">
                    <img className="card-img-top" data-src="holder.js/100px225?theme=thumb&bg=55595c&fg=eceeef&text=Thumbnail" alt="Card image cap" />
                    <div className="card-body">
                        <p className="card-text">{ album.name }</p>
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="btn-group">
                                <button type="button" className="btn btn-sm btn-outline-secondary">View</button>
                                <button type="button" className="btn btn-sm btn-outline-secondary">Edit</button>
                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={(e) => props.onRemove(album.id)}>Delete</button>
                            </div>
                            <small className="text-muted">9 photos</small>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    function ModalNewAlbum(props) {
        return (
            <div className="modal fade" id="new-album-modal-2" tabIndex="-1" role="dialog" aria-hidden="true">
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
                                <label htmlFor="new-album-name-2">Название альбома</label>
                                <input type="text" className="form-control" id="new-album-name-2" />
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
                return <Album key={ elem.id } value={ elem } onRemove={ (id) => this.handleRemove(id) } />
            });

            return (
                <div>
                    <div className="pb-5">
                        <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#new-album-modal-2">
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
            newAlbumNameInput = $("#new-album-name-2");
            newAlbumModal = $("#new-album-modal-2");

            newAlbumModal.on("shown.bs.modal", function() {
                newAlbumNameInput.focus();
            });
        }

        componentDidUpdate() {
            Holder.run();
            if (localStorage) {
                localStorage.setItem(albumsStorageName, JSON.stringify(this.state.albums.slice()))
            }
        }
    }

    ReactDOM.render(
        <AlbumsList />,
        document.querySelector(".js-albums-container")
    );
})();