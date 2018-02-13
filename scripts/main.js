$(document).ready(function() {
    (function app() {
        var app = {};

        var albumsContainer = $(".js-albums");
        var albumExampleClass = "js-item-example";
        var albumExample = albumsContainer.find("." + albumExampleClass).eq(0).clone(false).removeAttr("hidden");
        $("." + albumExampleClass).remove();
        var captionClass = "js-caption";
        var albums = [];
        var albumsStorageName = "albums";
        if (localStorage && localStorage.albums) {
            albums = JSON.parse(localStorage.getItem(albumsStorageName));
        }
        var newAlbumNameInput = $("#new-album-name");
        var saveNewAlbumBtn = $("#save-new-album");
        var newAlbumModal = $("#new-album-modal");

        var createNewAlbum = function(opts) {
            if (!opts) {
                return;
            }

            var albumName = opts.name;
            if (!albumName || typeof albumName !== "string") {
                return;
            }

            var newAlbumItem = albumExample.clone(false);
            newAlbumItem.find("." + captionClass).text(albumName);
            albumsContainer.append(newAlbumItem);
            Holder.run();
            var newAlbum = {
                name: albumName
            }
            albums.push(newAlbum);
            if (localStorage) {
                localStorage.setItem(albumsStorageName, JSON.stringify(albums));
            }

            console.log("created new album: " + albumName);
        };

        var showAlbum = function(album) {
            if (!album || typeof album !== "object") {
                return;
            }

            var newAlbumItem = albumExample.clone(false);
            var albumName = album.name;
            newAlbumItem.find("." + captionClass).text(albumName);
            albumsContainer.append(newAlbumItem);
            Holder.run();
        };

        if (albums.length > 0) {
            for (var i = 0; i < albums.length; i++) {
                showAlbum(albums[i]);
            }
        }

        var newAlbumModalController = function() {
            var newAlbum = {};
            var albumName = newAlbumNameInput.val();
            if (!albumName) {
                return;
            }

            newAlbum.name = albumName;
            createNewAlbum(newAlbum);
            newAlbumNameInput.val("");
            newAlbumModal.modal("hide");
        };


        // Binds
        saveNewAlbumBtn.on("click", newAlbumModalController);
        newAlbumModal.on("hidden.bs.modal", function() {
            newAlbumNameInput.blur().val("");
        });
        newAlbumModal.on("shown.bs.modal", function() {
            newAlbumNameInput.focus();
        });

        // Export
        app.createNewAlbum = createNewAlbum;
        window.app = app;
    })();
});