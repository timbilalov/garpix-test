class AlbumsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            albums: [],
            lastID: 0,
            newAlbumName: "",
            editAlbum: {
                name: "",
                id: ""
            },
            defaultAlbumName: "Альбом без названия"
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
        // TODO
        // В настоящем приложении необходимо дополнить проверкой
        // на уникальность имени. В противном случае, можно создавать альбомы
        // с одинаковымы названиями.
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
            lastID: albumID,
            newAlbumName: ""
        });

        if (localStorage) {
            localStorage.setItem(App.consts.albumsStorageName, JSON.stringify(albums));
            localStorage.setItem(App.consts.albumsStorageLastID, albumID);
        }

        console.log("[module AlbumsList] created new album: " + albumName + "; id: " + albumID);
    }

    handleAdd() {
        const albumName = this.state.newAlbumName;
        const album = {
            name: albumName
        };
        this.createNewAlbum(album);
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
        this.setState({
            editAlbum: {
                name: albumToEdit.name || "",
                id: id
            }
        })
    }

    handleEditSave() {
        let id = this.state.editAlbum.id;
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
        const oldName = albumToSave.name;
        const newName = this.state.editAlbum.name || this.state.defaultAlbumName;
        albums[index].name = newName;

        this.setState({
            albums: albums,
            editAlbum: {
                name: "",
                id: 0
            }
        });

        if (localStorage) {
            localStorage.setItem(App.consts.albumsStorageName, JSON.stringify(albums));
        }

        console.log("[module AlbumsList] saved album with id: " + id + "; oldName: " + oldName + ", newName: " + newName);
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

        // TODO:
        // В настоящем приложении, необходимо дополнить всплывающим окном,
        // с просьбой подтвердить действие.

        albumToRemove = albumToRemove[0];
        albums.splice(albums.indexOf(albumToRemove), 1);
        this.setState({
            albums: albums
        })

        if (localStorage) {
            localStorage.setItem(App.consts.albumsStorageName, JSON.stringify(albums));
        }

        console.log("[module AlbumsList] removed album with id: " + id);
    }

    clearAll() {
        // TODO:
        // В настоящем приложении, необходимо дополнить всплывающим окном,
        // с просьбой подтвердить действие.

        this.setState({
            albums: [],
            lastID: 0,
            newAlbumName: ""
        });

        if (localStorage) {
            localStorage.clear();
        }

        console.log("[module AlbumsList] all albums and localStorage cleared");
    }

    handleUpdateNewInputValue(value) {
        this.setState({
            newAlbumName: value
        })
    }

    handleUpdateEditInputValue(value) {
        this.setState({
            editAlbum: {
                name: value,
                id: this.state.editAlbum.id
            }
        })
    }

    render() {
        const albums = this.state.albums.map((elem) => {
            return <AlbumCard key={ elem.id } value={ elem } onEditStart={ (id) => this.handleEditStart(id) } onEditSave={ (id) => this.handleEditSave(id) } onRemove={ (id) => this.handleRemove(id) } />
        });

        return (
            <div>
                <div className="pb-5">
                    <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#modal-new-album">
                        Добавить альбом
                    </button>

                    <ModalNewAlbum onAdd={ () => this.handleAdd() } inputValue={ this.state.newAlbumName } onUpdateInputValue={ (value) => this.handleUpdateNewInputValue(value) } />
                </div>

                {
                    albums && albums.length > 0 &&
                    <div className="row">
                        { albums }
                    </div>
                }
                {
                    (!albums || albums.length <= 0) &&
                    <div>
                        Здесь пока нет альбомов...
                    </div>
                }

                <ModalEditAlbum inputValue={ this.state.editAlbum.name } onEditSave={ () => this.handleEditSave() }  onUpdateInputValue={ (value) => this.handleUpdateEditInputValue(value) } />

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

    componentWillMount() {
        if (localStorage && localStorage.getItem(App.consts.albumsStorageName)) {
            let albums = JSON.parse(localStorage.getItem(App.consts.albumsStorageName)) || [];
            let lastID = parseInt(localStorage.getItem(App.consts.albumsStorageLastID));
            if (isNaN(lastID)) {
                lastID = 0;
            }

            this.setState({
                albums: albums,
                lastID: lastID
            });
        };
    }

    componentDidMount() {
        Holder.run();
        console.log("[module AlbumsList] total " + this.state.albums.length + " albums found. lastID: " + this.state.lastID);
    }

    componentDidUpdate() {
        Holder.run();

        if (localStorage) {
            localStorage.setItem(App.consts.albumsStorageName, JSON.stringify(this.state.albums.slice()))
        }
    }
}