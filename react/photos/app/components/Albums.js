import React from "react";
import AlbumHeader from "./AlbumHeader.js";

const Albums = ({className, albums, onClick}) =>
  <div className={className}>
    {
      albums && albums.map(album => <AlbumHeader key={"list_item_" + album.id} className="album-info" album={album} onClick={onClick} />)
    }
  </div>

export default Albums;

