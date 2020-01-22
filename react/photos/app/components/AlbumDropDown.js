import React, {Fragment} from "react";
import DropDown from "../../../shared/DropDown.js";

function getElements(albums){
  const array = [];
  if (albums && albums.length){
    for (const album of albums){
      array.push({label : album.title, value : album.id});
    }
  }
  return array;
}

const AlbumDropDown = ({albums, selected, onChange}) =>
  <Fragment>
    <DropDown elements={getElements(albums)} selected={selected} onChange={(event) => onChange(event)} />
  </Fragment>

export default AlbumDropDown;
