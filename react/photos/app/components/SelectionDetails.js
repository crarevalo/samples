import React, {Fragment} from "react";
import HeadedContent from "../../../shared/HeadedContent.js";

const SelectionDetails = function({count}){
  if (!count) return null;
  else return (
    <HeadedContent 
      headerClassName="selection-details-header"
      header="Selected"
      contentClassName="selection-details-content"
      content={count + ((count > 1) ? " photos" : " photo")}
    />
  );
};

export default SelectionDetails;
