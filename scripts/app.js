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
                    <Link to={{ pathname: "/album/" + album.id }}>
                        <div className="card-img-top dd__img-holder dd__img-holder--v2">
                        {
                            album.images && album.images.length > 0 &&
                            <img className="dd__img" src={ album.images[0] } alt="Card image cap" />
                        }
                        {
                            (!album.images || album.images.length <= 0) &&
                            <img className="dd__img" data-src="holder.js/100px225?theme=thumb&bg=55595c&fg=eceeef&text=Thumbnail" alt="Card image cap" />
                        }
                        </div>
                    </Link>
                    <div className="card-body">
                        <p className="card-text">{ album.name }</p>
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="btn-group">
                                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={ () => props.onEditStart(album.id) }>Редактировать</button>
                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={ () => props.onRemove(album.id) }>Удалить</button>
                            </div>
                            <small className="text-muted">
                                { (album.images || []).length }&nbsp;изображений
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
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Отменить</button>
                            <button type="button" className="btn btn-primary" onClick={props.onAdd}>Добавить</button>
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
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Отменить</button>
                            <button type="button" className="btn btn-primary" onClick={ props.onEditSave }>Сохранить</button>
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

            // TODO:
            // В настоящем приложении, необходимо дополнить всплывающим окном,
            // с просьбой подтвердить действие.

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
            // TODO:
            // В настоящем приложении, необходимо дополнить всплывающим окном,
            // с просьбой подтвердить действие.

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
            if (localStorage && localStorage.getItem(albumsStorageName)) {
                this.setState({
                    albums: JSON.parse(localStorage.getItem(albumsStorageName))
                });
            }

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
                isUploading: false,
                uploading: {
                    max: 0,
                    cur: 0
                }
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
            const context = this;
            const filesCount = files.length;
            let k = 0;
            this.setState({
                isUploading: true,
                uploading: {
                    max: filesCount,
                    cur: k
                }
            })

            files.forEach((file) => {
                // TODO:
                // В силу того, что на сервисе imgur.com не работает регистрация
                // (как следствие, невозможно установить подключение к API),
                // это лишь имитация отправки изображений на сервер.
                // Но принципы работы для настоящего подключения будут примерно такие же.
                const fetchUrl = window.location;
                fetch(fetchUrl, {
                    method: 'POST',
                    data: {
                        file: file
                    }
                })
                .then(function(response) {
                    // TODO:
                    // При подключении к настоящему сервису хранения изображений
                    // в этой части программы будет обработка ответа, получение ссылки на изображение,
                    // и добавление ссылки в localStorage.
                    // Пока же, конвертим изображения в base64.
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
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

                    console.log("file uploaded: ", file);
                    k++;
                    context.setState({
                        uploading: {
                            max: filesCount,
                            cur: k
                        }
                    })

                    if (k === filesCount) {
                        // Это для пользователей с хорошим быстрым интернетом -
                        // чтобы вместо мелькания они увидели, что всё работает
                        // (психологический эффект).
                        setTimeout(function() {
                            context.setState({
                                isUploading: false,
                                uploading: {
                                    max: 0,
                                    cur: 0
                                }
                            })
                        }, 1000);
                    }
                });
            })


            component.setState({
                files: [],
                preview: []
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

        clearAll() {
            const id = parseInt(this.props.match.params.number);
            const albums = this.state.albums.slice();
            const album = albums.filter((elem) => elem.id === id)[0];
            if (!album) {
                return;
            }

            album.images = [];

            this.setState({
                albums: albums
            })

            if (localStorage) {
                localStorage.setItem(albumsStorageName, JSON.stringify(albums));
            }

            console.log("album id=" + id + " cleared");
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
                    <div className="card mb-4 box-shadow" key={ index }>
                        <img className="card-img-top rounded" src={ elem } alt="Card image cap" />

                        <button type="button" className="close close--abs" aria-label="Delete" onClick={ () => this.handleRemove(index) }>
                            <span aria-hidden="true">×</span>
                        </button>
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
                        this.state.isUploading &&

                        <div className="my-5">
                            <p>Изображения загружаются</p>

                            <div className="progress">
                                <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style={{ width: Math.round((1 - (this.state.uploading.max - this.state.uploading.cur) / this.state.uploading.max) * 100) + "%" }}></div>
                            </div>
                        </div>
                    }

                    {
                        !this.state.isUploading &&
                        <div className="mt-5">
                            <ImageUpload onSave={ (component) => this.handleSave(component) } />
                        </div>
                    }

                    <div className="py-5">
                        {
                            albumImages && albumImages.length > 0 &&
                            <div className="card-columns">
                                { albumImages }
                            </div>
                        }
                        {
                            !albumImages || albumImages.length <= 0 &&
                            <div>
                                Здесь пока что пусто...
                            </div>
                        }
                    </div>

                    {
                        (album.images || []).length > 0 &&
                        <div className="mt-5">
                            <button type="button" className="btn btn-sm btn-light" onClick={ () => this.clearAll() }>
                                Удалить все изображения в альбоме
                            </button>
                        </div>
                    }
                </div>
            )
        }

        componentWillMount() {
            if (localStorage && localStorage.getItem(albumsStorageName)) {
                this.setState({
                    albums: JSON.parse(localStorage.getItem(albumsStorageName))
                });
            }
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
                preview: [],
                files: []
            }
        }

        handleDrop(files) {
            const preview = files.map((item) => item.preview);
            this.setState({
                files: this.state.files.slice().concat(files),
                preview: this.state.preview.slice().concat(preview)
            })
        }

        handleRemove(index) {
            const preview = this.state.preview.slice();
            const files = this.state.files.slice();
            preview.splice(index, 1);
            files.splice(index, 1);
            this.setState({
                files: files,
                preview: preview,
            })
        }

        render() {
            const previewItems = (this.state.preview || []).map((item, index) => {
                return (
                    <div className="dd__img-holder rounded my-2" key={ index }>
                        <img src={ item } className="dd__img rounded" alt=""/>
                        <button type="button" className="close close--abs" aria-label="Delete" onClick={ () => this.handleRemove(index) }>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                );
            });

            return (
                <div>
                    <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#modal-new-image">
                        Загрузить изображения
                    </button>

                    <div className="modal fade" id="modal-new-image" tabIndex="-1" role="dialog" aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Загрузить изображения</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="dd">
                                        <div className="dd">
                                            <div className="dd__zone dd__zone--fake bg-light border border-primary rounded">
                                                <span className="dd__text text-muted">Перетащите изображения в эту область, или кликните, чтобы выбрать файлы</span>
                                            </div>
                                        </div>

                                        <Dropzone className="dd__zone" onDrop={ (files) => this.handleDrop(files) } accept="image/jpeg,image/png,image/jpg,image/tiff,image/gif" multiple={ true } onDropRejected={ handleDropRejected } />

                                        {
                                            previewItems && previewItems.length > 0 &&
                                            <div className="dd">
                                                { previewItems }
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Отменить</button>
                                    <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={ () => this.props.onSave(this) }>Загрузить изображения</button>
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