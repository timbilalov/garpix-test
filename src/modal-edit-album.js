import React from "react";

export default function ModalEditAlbum(props) {
    return (
        <div className="modal fade" id="modal-edit-album" tabIndex="-1" role="dialog" aria-hidden="true">
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
                            <input type="text" className="form-control input-edit-album-name" value={ props.inputValue } onChange={ (e) => props.onUpdateInputValue(e.target.value) } />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-dismiss="modal">Отменить</button>
                        <button type="button" className="btn btn-primary" onClick={ props.onEditSave } data-dismiss="modal">Сохранить</button>
                    </div>
                </div>
            </div>
        </div>
    );
}