import React from "react";
import TextField from "./TextField.js";

const onFocus = function(event){
  event.target.select();
};

const EditableCaption = function({content, editing, className, onChange, onClick, onSave, onCancel, ...rest}){
  const editJSX = (
    <TextField label="" value={content} className={className} onBlur={onCancel} onChange={onChange} autoFocus={true} onFocus={onFocus} {...rest} />
  );
  const displayJSX = (
    <span className={className} onClick={onClick}>{content}</span>
  );
  if (editing){
    return editJSX;
  }
  else{
    return displayJSX;
  }
};

export default EditableCaption;
