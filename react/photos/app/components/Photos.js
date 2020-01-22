import React from "react";

const spacer = {
  width : "100%",
  clear : "both"
};

const Photos = ({className, photos, selectedIds, onClick}) =>
  <div className={className}>
    {
      photos &&
      photos.map(photo =>
        <div key={"list_item_" + photo.id} className={(selectedIds && selectedIds.has(photo.id)) ? "thumb selected" : "thumb"} onClick={(event) => onClick(event, photo)}>
          <div>
            <img className={"rotated" + photo.orientation} src={photo.preview_path ? "/blueprint/link_thumbs/" + photo.preview_path : ""} />
          </div>
        </div>
      )
    }
    <div style={spacer}>&nbsp;</div>
  </div>

export default Photos;
