const Dropzone = reactDropzone;

class ImageUpload extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            preview: [],
            files: []
        }
    }

    handleDrop(files) {
        if (!files || files.length <= 0) {
            return;
        }

        const preview = files.map((item) => item.preview);
        const newFiles = this.state.files.slice().concat(files);
        const newPreview = this.state.preview.slice().concat(preview);
        this.setState({
            files: newFiles,
            preview: newPreview
        })

        console.log("[module ImageUpload] dropped " + files.length + " files. total " + newFiles.length + " new files are ready to upload");
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

        console.log("[module ImageUpload] removed image with index: " + index + ". total " + files.length + " files");
    }

    handleDropRejected(...args) {
        console.log('[module ImageUpload] rejected files. args: ', args);
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

                                    <Dropzone className="dd__zone" onDrop={ (files) => this.handleDrop(files) } accept="image/jpeg,image/png,image/jpg,image/tiff,image/gif" multiple={ true } onDropRejected={ (args) => this.handleDropRejected(args) } />

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