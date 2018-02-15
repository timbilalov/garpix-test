class AlbumDetailed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            albums: [],
            isUploading: false,
            uploading: {
                max: 0,
                cur: 0
            }
        }
    }

    handleSave(component) {
        const files = component.state.files;

        if (!files || !files.length) {
            return;
        }

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

        console.log("[module AlbumDetailed] starting to upload files...");

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
                        localStorage.setItem(App.consts.albumsStorageName, JSON.stringify(albums))
                    }
                }

                console.log("%c -- file uploaded: ", "color: #999", file);
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

                        console.log("[module AlbumDetailed] all " + filesCount + " files uploaded")
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
            localStorage.setItem(App.consts.albumsStorageName, JSON.stringify(albums));
        }

        console.log("[module AlbumDetailed] removed image with index: " + index);
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
            localStorage.setItem(App.consts.albumsStorageName, JSON.stringify(albums));
        }

        console.log("[module AlbumDetailed] album id=" + id + " cleared");
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
                        <button className="btn btn-sm btn-light">⬅ Назад</button>
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
        if (localStorage && localStorage.getItem(App.consts.albumsStorageName)) {
            this.setState({
                albums: JSON.parse(localStorage.getItem(App.consts.albumsStorageName)),
            });
        };
    }

    componentDidMount() {
        const id = parseInt(this.props.match.params.number);
        const albums = this.state.albums.slice();
        const album = albums.filter((elem) => elem.id === id)[0];
        if (!album) {
            return;
        }
        const albumImages = album.images || [];
        console.log("[module AlbumDetailed] showing album with id: " + id + ". images count: " + albumImages.length);
    }
}