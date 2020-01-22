import React, {Fragment} from "react";
import HeadedContent from "../../../shared/HeadedContent.js";
import ActionLink from "../../../shared/ActionLink.js";

const AlbumHeader = function({className, album, onClick, isShowingEdit, onClickEdit}){
  if (!album) return null;

  return (
  <Fragment>
    <div className={className}>
      <div className="title">
        <span onClick={() => onClick(album.id)}>{album.title}</span>
        {isShowingEdit && <ActionLink onClick={onClickEdit} className="link">Edit</ActionLink>}
      </div>
      {
        (album.description) &&
        <div className="description"><span>{album.description}</span></div>
      }
      {
        (album.year || album.month || album.date) &&
        <div className="date">
          <HeadedContent headerClassName="header" header="Year" contentClassName="content" content={album.year} />
          <HeadedContent headerClassName="header" header="Month" contentClassName="content" content={album.monthName} />
          <HeadedContent headerClassName="header" header="Date" contentClassName="content" content={album.date} />
        </div>
      }
      <div className="count"><span>{album.count}&nbsp;{(album.count == 1) ? "photo" : "photos"}</span></div>
    </div>
  </Fragment>
  );
};

export default AlbumHeader;
