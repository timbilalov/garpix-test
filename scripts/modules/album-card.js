function AlbumCard(props) {
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
                            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={ () => props.onEditStart(album.id) } data-toggle="modal" data-target="#modal-edit-album">Редактировать</button>
                            <button type="button" className="btn btn-sm btn-outline-danger" onClick={ () => props.onRemove(album.id) }>Удалить</button>
                        </div>
                        <small className="text-muted">
                            { (album.images || []).length }&nbsp;изображений
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
}