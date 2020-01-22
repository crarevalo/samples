import React, {Fragment} from "react";

const HeadedContent = function({headerClassName, header, contentClassName, content, items, alwaysVisible}){
  if ((!header || (!content && !alwaysVisible)) && (!items || !items.length)) return null;

  if (items && items.length){
    return (
      <Fragment>
        {
          items.map(item =>
            <div key={item.key}><span className={headerClassName}>{item.header}:</span><span className={contentClassName}>{item.content}</span></div>
          )
        }
      </Fragment>
    );
  }
  else{
    return (
      <Fragment>
        <span className={headerClassName}>{header}:</span><span className={contentClassName}>{content}</span>
      </Fragment>
    );
  }
};

export default HeadedContent;
