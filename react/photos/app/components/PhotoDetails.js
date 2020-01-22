import React, {Fragment} from "react";
import HeadedContent from "../../../shared/HeadedContent.js";

const PhotoDetails = function({className, photo, exif}){
  if (!photo) return null;

  return (
    <div className={className}>
      <div>
        <HeadedContent headerClassName="header" header="Title" contentClassName="content" content={photo.title} alwaysVisible={true} />
      </div>
      <div>
        <HeadedContent headerClassName="header" header="Description" contentClassName="content" content={photo.description} alwaysVisible={true} />
      </div>
      <div>
        <HeadedContent headerClassName="header" header="Timestamp" contentClassName="content" content={photo.moment} alwaysVisible={true} />
      </div>
      <div>
        <HeadedContent headerClassName="header" header="Width" contentClassName="content" content={photo.width} alwaysVisible={true} />
      </div>
      <div>
        <HeadedContent headerClassName="header" header="Height" contentClassName="content" content={photo.height} alwaysVisible={true} />
      </div>
      <div>
        <HeadedContent headerClassName="header" header="Size" contentClassName="content" content={photo.size} alwaysVisible={true} />
      </div>
      <div>
        <HeadedContent headerClassName="header" header="Orientation" contentClassName="content" content={photo.orientation} alwaysVisible={true} />
      </div>
      <div>
        <HeadedContent headerClassName="header" header="Latitude" contentClassName="content" content={photo.latitude} alwaysVisible={true} />
      </div>
      <div>
        <HeadedContent headerClassName="header" header="Longitude" contentClassName="content" content={photo.longitude} alwaysVisible={true} />
      </div>
      <br/>
      {
        exif &&
        Object.keys(exif).map(key =>
          <div>
            <HeadedContent headerClassName="header" header={key} contentClassName="content" content={exif[key]} />
          </div>
        )
      }
    </div>
  );
};

export default PhotoDetails;
